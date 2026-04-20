const express = require('express');
const Chat = require('../models/Chat');
const Item = require('../models/Item');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const { sendMail } = require('../utils/mailer');

const router = express.Router();

// @route   GET /api/chat
// @desc    Get all chat rooms for the logged in user
router.get('/', authMiddleware, async (req, res) => {
    try {
        // 1. Performance Cleanup: Permanently delete chats that have no item linked (waste data)
        // This keeps the DB lean and fast
        await Chat.deleteMany({ item: null });

        // 2. Fetch chats for the user
        const chats = await Chat.find({ 
            participants: req.user.id,
            hiddenBy: { $nin: [req.user.id] } 
        })
            .populate('participants', 'name email profilePicture')
            .populate('item', 'name image status')
            .sort({ 'messages.timestamp': -1 });

        // Double check for any null items that might have survived deletion in the current request
        const validChats = chats.filter(chat => chat.item !== null);

        res.json(validChats);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching chats' });
    }
});

// @route   GET /api/chat/unread-count
// @desc    Get total number of unread messages for the user
router.get('/unread-count', authMiddleware, async (req, res) => {
    try {
        const chats = await Chat.find({ 
            participants: req.user.id,
            hiddenBy: { $nin: [req.user.id] } 
        });

        let totalUnread = 0;
        const userId = req.user.id.toString();

        chats.forEach(chat => {
            totalUnread += chat.messages.filter(m => 
                m.sender.toString() !== userId && !m.isRead
            ).length;
        });

        res.json({ count: totalUnread });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching unread count' });
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
        
        // Remove recipient from hiddenBy if they had "deleted" the chat
        const otherParticipantId = chat.participants.find(p => p.toString() !== req.user.id);
        chat.hiddenBy = chat.hiddenBy.filter(u => u.toString() !== otherParticipantId.toString());

        await chat.save();

        // ----------------------------------------------------
        // Notification Logic: Notify the other participant(s)
        // ----------------------------------------------------
        const recipient = await User.findById(otherParticipantId);
        const sender = await User.findById(req.user.id);
        
        let itemData = null;
        if (chat.item) {
            itemData = await Item.findById(chat.item);
        }

        if (recipient && sender) {
            // Push In-App Notification
            recipient.notifications.push({
                senderName: sender.name,
                senderEmail: sender.email,
                message: `New message: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`,
                itemName: itemData ? itemData.name : 'a chat',
                isRead: false
            });
            await recipient.save();

            // Send Email Notification
            const subject = "You have a new message on Lost & Found Hub";
            const text = `Hello ${recipient.name},\n\n${sender.name} sent you a message regarding "${itemData ? itemData.name : 'your item'}":\n\n"${content}"\n\nLogin to the hub to reply!`;
            const html = `<h3>New Message Alert</h3>
                <p>Hello <strong>${recipient.name}</strong>,</p>
                <p><strong>${sender.name}</strong> sent you a message regarding <em>"${itemData ? itemData.name : 'your item'}"</em>:</p>
                <div style="background:#f4f4f4; padding:15px; border-radius:8px; margin: 20px 0; border-left: 4px solid #6c5ce7;">
                    "${content}"
                </div>
                <p>Please log in to the app to continue the conversation.</p>`;

            await sendMail(recipient.email, subject, text, html);
        }

        res.json(newMessage);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error sending message' });
    }
});

// @route   PATCH /api/chat/:id/read
// @desc    Mark all messages in a chat as read
router.patch('/:id/read', authMiddleware, async (req, res) => {
    try {
        const chat = await Chat.findById(req.params.id);
        if (!chat) return res.status(404).json({ message: 'Chat not found' });

        if (!chat.participants.includes(req.user.id)) {
            return res.status(403).json({ message: 'Not authorized for this chat' });
        }

        // Mark all messages sent by the OTHER person as read
        let updated = false;
        chat.messages.forEach(msg => {
            if (msg.sender.toString() !== req.user.id && !msg.isRead) {
                msg.isRead = true;
                updated = true;
            }
        });

        if (updated) {
            await chat.save();
        }

        res.json({ message: 'Messages marked as read' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error marking messages as read' });
    }
});

// @route   DELETE /api/chat/:id
// @desc    "Delete" (hide) a chat for the current user
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const chat = await Chat.findById(req.params.id);
        if (!chat) return res.status(404).json({ message: 'Chat not found' });

        if (!chat.participants.includes(req.user.id)) {
            return res.status(403).json({ message: 'Not authorized for this chat' });
        }

        // Add to hiddenBy if not already there
        const userId = req.user.id.toString();
        const alreadyHidden = chat.hiddenBy.some(id => id.toString() === userId);
        
        if (!alreadyHidden) {
            chat.hiddenBy.push(req.user.id);
            await chat.save();
        }

        res.json({ message: 'Chat hidden successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error hiding chat' });
    }
});

module.exports = router;
