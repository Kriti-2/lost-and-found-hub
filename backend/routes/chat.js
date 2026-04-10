const express = require('express');
const Chat = require('../models/Chat');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/chat
// @desc    Get all chat rooms for the logged in user
router.get('/', authMiddleware, async (req, res) => {
    try {
        const chats = await Chat.find({ participants: req.user.id })
            .populate('participants', 'name email profilePicture')
            .populate('item', 'name image status')
            .sort({ 'messages.timestamp': -1 });

        res.json(chats);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching chats' });
    }
});

// @route   POST /api/chat/:id/message
// @desc    Send a message via HTTP (fallback/initial load)
router.post('/:id/message', authMiddleware, async (req, res) => {
    try {
        const chat = await Chat.findById(req.params.id);
        if (!chat) return res.status(404).json({ message: 'Chat not found' });

        if (!chat.participants.includes(req.user.id)) {
            return res.status(403).json({ message: 'Not authorized for this chat' });
        }

        const { content } = req.body;
        const newMessage = {
            sender: req.user.id,
            content,
            timestamp: new Date()
        };

        chat.messages.push(newMessage);
        await chat.save();

        res.json(newMessage);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error sending message' });
    }
});

module.exports = router;
