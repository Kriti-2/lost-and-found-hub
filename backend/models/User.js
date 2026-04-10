const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/^[a-zA-Z0-9._%+-]+@(srmist\.edu\.in|gmail\.com)$/, 'Please use a valid SRM or Gmail ID']
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
