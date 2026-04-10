const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/auth');

const { sendMail } = require('../utils/mailer');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secret-key-for-dev';

const bcrypt = require('bcryptjs');

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', async (req, res) => {
    const { email, name, password } = req.body;
    
    if (!email.endsWith('@srmist.edu.in')) {
        return res.status(403).json({ message: 'Only @srmist.edu.in emails are allowed.' });
    }
    
    if (!password || password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    try {
        let user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({ message: 'User already exists. Please login.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({ email, name, password: hashedPassword });
        await user.save();

        const payload = { id: user._id, email: user.email };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

        res.json({ token, user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

// @route   POST /api/auth/login
// @desc    Login existing user
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    if (!email.endsWith('@srmist.edu.in')) {
        return res.status(403).json({ message: 'Only @srmist.edu.in emails are allowed.' });
    }

    try {
        let user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials. Have you registered?' });
        }
        
        if (!user.password) {
            return res.status(400).json({ message: 'This account was created without a password. Please contact support.' });
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
                profilePicture: picture
            });
            await user.save();
        } else if (!user.googleId) {
            // If user exists via email registration but now logs in via Google
            user.googleId = sub;
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
