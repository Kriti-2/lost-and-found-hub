const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/auth');

const { sendMail } = require('../utils/mailer');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secret-key-for-dev';

const bcrypt = require('bcryptjs');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', async (req, res) => {
    const { email, name, password } = req.body;
    
    // Removed srmist check
    
    if (!password || password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    try {
        let user = await User.findOne({ email });

        if (user) {
            if (user.isVerified) {
                return res.status(400).json({ message: 'User already exists. Please login.' });
            } else {
                // User exists but not verified, resend OTP & update pass
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);
                
                const otp = generateOTP();
                user.verificationOTP = otp;
                user.verificationOTPExpire = Date.now() + 10 * 60 * 1000;
                user.name = name;
                user.password = hashedPassword;
                await user.save();

                await sendMail(email, "Verify Your Account - Lost & Found Hub", `Your verification OTP is: ${otp}. It will expire in 10 minutes.`, `<h3>Your verification OTP is: <strong>${otp}</strong></h3><p>It will expire in 10 minutes.</p>`);
                return res.json({ message: 'OTP sent to your email. Please verify.', requiresVerification: true });
            }
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const otp = generateOTP();

        user = new User({ 
            email, 
            name, 
            password: hashedPassword,
            verificationOTP: otp,
            verificationOTPExpire: Date.now() + 10 * 60 * 1000
        });
        await user.save();

        await sendMail(email, "Verify Your Account - Lost & Found Hub", `Your verification OTP is: ${otp}. It will expire in 10 minutes.`, `<h3>Your verification OTP is: <strong>${otp}</strong></h3><p>It will expire in 10 minutes.</p>`);

        res.json({ message: 'OTP sent to your email. Please verify.', requiresVerification: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

// @route   POST /api/auth/verify-email
// @desc    Verify email using OTP
router.post('/verify-email', async (req, res) => {
    const { email, otp } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'User not found.' });

        if (user.isVerified) return res.status(400).json({ message: 'User already verified.' });

        if (user.verificationOTP !== otp || user.verificationOTPExpire < Date.now()) {
            return res.status(400).json({ message: 'Invalid or expired OTP.' });
        }

        user.isVerified = true;
        user.verificationOTP = undefined;
        user.verificationOTPExpire = undefined;
        await user.save();

        const payload = { id: user._id, email: user.email };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

        res.json({ token, user, message: 'Email verified successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during verification' });
    }
});

// @route   POST /api/auth/resend-verification
// @desc    Resend verification OTP
router.post('/resend-verification', async (req, res) => {
    const { email } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'User not found.' });
        if (user.isVerified) return res.status(400).json({ message: 'User already verified.' });

        const otp = generateOTP();
        user.verificationOTP = otp;
        user.verificationOTPExpire = Date.now() + 10 * 60 * 1000;
        await user.save();

        await sendMail(email, "Verify Your Account - Lost & Found Hub", `Your verification OTP is: ${otp}. It will expire in 10 minutes.`, `<h3>Your verification OTP is: <strong>${otp}</strong></h3><p>It will expire in 10 minutes.</p>`);

        res.json({ message: 'New OTP sent to your email.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during OTP resend' });
    }
});

// @route   POST /api/auth/login
// @desc    Login existing user
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    // Removed srmist check

    try {
        let user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials. Have you registered?' });
        }
        
        if (!user.password) {
            return res.status(400).json({ message: 'This account was created without a password. Please contact support.' });
        }

        if (!user.isVerified && !user.googleId) {
            // Need to resend OTP and ask them to verify
            const otp = generateOTP();
            user.verificationOTP = otp;
            user.verificationOTPExpire = Date.now() + 10 * 60 * 1000;
            await user.save();

            await sendMail(email, "Verify Your Account - Lost & Found Hub", `Your verification OTP is: ${otp}. It will expire in 10 minutes.`, `<h3>Your verification OTP is: <strong>${otp}</strong></h3><p>It will expire in 10 minutes.</p>`);
            
            return res.status(400).json({ message: 'Email not verified. A new OTP has been sent to your email.', unverified: true });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials. Wrong password.' });
        }

        const payload = { id: user._id, email: user.email };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

        res.json({ token, user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// @route   POST /api/auth/forgot-password
// @desc    Send OTP to reset password
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found with this email.' });

        const otp = generateOTP();
        user.resetPasswordOTP = otp;
        user.resetPasswordOTPExpire = Date.now() + 10 * 60 * 1000;
        await user.save();

        await sendMail(email, "Reset Your Password - Lost & Found Hub", `Your password reset OTP is: ${otp}. It will expire in 10 minutes.`, `<h3>Your password reset OTP is: <strong>${otp}</strong></h3><p>It will expire in 10 minutes.</p>`);

        res.json({ message: 'Password reset OTP sent to your email.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during forgot password' });
    }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password using OTP
router.post('/reset-password', async (req, res) => {
    const { email, otp, newPassword } = req.body;
    try {
        if (!newPassword || newPassword.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters long.' });

        let user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found.' });

        if (user.resetPasswordOTP !== otp || user.resetPasswordOTPExpire < Date.now()) {
            return res.status(400).json({ message: 'Invalid or expired OTP.' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.resetPasswordOTP = undefined;
        user.resetPasswordOTPExpire = undefined;
        await user.save();

        res.json({ message: 'Password reset successfully. You can now login.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during reset password' });
    }
});

// @route   GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-__v');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @route   POST /api/auth/google-login
// @desc    Login/Register with Google
router.post('/google-login', async (req, res) => {
    const { tokenId } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken: tokenId,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const { email, name, sub, picture } = ticket.getPayload();

        // Check if user exists
        let user = await User.findOne({ email });

        if (!user) {
            // Create new user if they don't exist
            user = new User({
                email,
                name,
                googleId: sub,
                profilePicture: picture,
                isVerified: true
            });
            await user.save();
        } else if (!user.googleId) {
            // If user exists via email registration but now logs in via Google
            user.googleId = sub;
            user.isVerified = true;
            if (!user.profilePicture) user.profilePicture = picture;
            await user.save();
        }

        const payload = { id: user._id, email: user.email };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

        res.json({ token, user });
    } catch (err) {
        console.error("Google Login Error:", err);
        res.status(400).json({ message: 'Google login failed' });
    }
});

// @route   PUT /api/auth/notifications/read
// @desc    Mark all notifications as read
router.put('/notifications/read', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.notifications.forEach(notif => {
            notif.isRead = true;
        });

        user.markModified('notifications');
        await user.save();
        res.json(user.notifications);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   DELETE /api/auth/notifications/:id
// @desc    Delete a notification
router.delete('/notifications/:id', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.notifications = user.notifications.filter(
            notif => notif._id.toString() !== req.params.id
        );

        await user.save();
        res.json(user.notifications);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
