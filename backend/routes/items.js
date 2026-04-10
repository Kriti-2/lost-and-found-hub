const express = require('express');
const Item = require('../models/Item');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');
const { sendMail } = require('../utils/mailer');

const router = express.Router();

// @route   GET /api/items
// @desc    Get all items (with filters and search)
router.get('/', async (req, res) => {
    try {
        const { search, type, status } = req.query;
        let query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { location: { $regex: search, $options: 'i' } }
            ];
        }

        if (type) query.type = type;
        if (status) query.status = status;

        const items = await Item.find(query)
            .populate('user', 'name email profilePicture')
            .populate('claims.claimerId', 'name email')
            .sort({ createdAt: -1 });

        res.json(items);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   POST /api/items
// @desc    Create an item post
// @access  Private
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
    try {
        const { type, name, description, location, date } = req.body;
        
        let imageUrl = '';
        if (req.file) {
            imageUrl = `/uploads/${req.file.filename}`;
        }

        const newItem = new Item({
            type,
            name,
            description,
            location,
            date,
            image: imageUrl,
            status: type === 'Lost' ? 'Lost' : 'Found',
            user: req.user.id
        });

        const savedItem = await newItem.save();
        res.status(201).json(savedItem);
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

// @route   GET /api/items/:id
// @desc    Get item by ID
router.get('/:id', async (req, res) => {
    try {
        const item = await Item.findById(req.params.id)
            .populate('user', 'name email profilePicture')
            .populate('claims.claimerId', 'name email');
        
        if (!item) return res.status(404).json({ message: 'Item not found' });
        res.json(item);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   PUT /api/items/:id
// @desc    Update an item post
// @access  Private
router.put('/:id', authMiddleware, upload.single('image'), async (req, res) => {
    try {
        let item = await Item.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Item not found' });

        // Check user ownership
        if (item.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized to update this item' });
        }

        const { type, name, description, location, date, status } = req.body;
        
        item.type = type || item.type;
        item.name = name || item.name;
        item.description = description || item.description;
        item.location = location || item.location;
        item.date = date || item.date;
        item.status = status || item.status;

        if (req.file) {
            item.image = `/uploads/${req.file.filename}`;
        }

        const updatedItem = await item.save();
        res.json(updatedItem);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   DELETE /api/items/:id
// @desc    Delete an item post
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Item not found' });

        // Check user ownership
        if (item.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized to delete this item' });
        }

        await Item.findByIdAndDelete(req.params.id);
        res.json({ message: 'Item removed' });
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   POST /api/items/:id/claim
// @desc    Claim an item (send an in-app request)
// @access  Private
router.post('/:id/claim', authMiddleware, async (req, res) => {
    try {
        const item = await Item.findById(req.params.id).populate('user');
        if (!item) return res.status(404).json({ message: 'Item not found' });

        if (item.user._id.toString() === req.user.id) {
            return res.status(400).json({ message: 'You cannot claim your own post' });
        }

        const alreadyClaimed = item.claims.find(claim => claim.claimerId.toString() === req.user.id);
        if (alreadyClaimed) {
             return res.status(400).json({ message: 'You have already sent a claim request for this item' });
        }

        const { message } = req.body;
        item.claims.push({ claimerId: req.user.id, message });
        await item.save();

        const Chat = require('../models/Chat');
        
        // Push In-App Notification directly to owner
        const claimerUser = await User.findById(req.user.id);
        const ownerUser = await User.findById(item.user._id);
        
        if (ownerUser) {
            ownerUser.notifications.push({
                senderName: claimerUser.name,
                senderEmail: claimerUser.email,
                message: message,
                itemName: item.name,
                isRead: false
            });
            await ownerUser.save();
        }

        // Initialize Chat Room
        let existingChat = await Chat.findOne({
            participants: { $all: [req.user.id, item.user._id] },
            item: item._id
        });

        if (!existingChat) {
            const newChat = new Chat({
                participants: [req.user.id, item.user._id],
                item: item._id,
                messages: [{
                    sender: req.user.id,
                    content: `[Automated System]: Claim Request Sent - "${message}"`
                }]
            });
            await newChat.save();
        } else {
            existingChat.messages.push({
                sender: req.user.id,
                content: `[Automated System]: Reminder Claim Request - "${message}"`
            });
            await existingChat.save();
        }

        res.json({ message: 'Claim request sent successfully!', item });
    } catch (err) {
        console.error("Claim error:", err);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
