const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
    },
    profilePicture: {
        type: String,
        default: ''
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationOTP: String,
    verificationOTPExpire: Date,
    resetPasswordOTP: String,
    resetPasswordOTPExpire: Date,
    institution: {
        type: String,
        default: 'SRMIST'
    },
    notifications: [{
        senderName: String,
        senderEmail: String,
        message: String,
        itemName: String,
        date: { type: Date, default: Date.now },
        isRead: { type: Boolean, default: false }
    }]
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
