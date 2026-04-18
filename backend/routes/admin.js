const express = require('express');
const User = require('../models/User');
const Item = require('../models/Item');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

const router = express.Router();

// All admin routes require both auth + admin check
router.use(authMiddleware, adminMiddleware);

// @route   GET /api/admin/users
// @desc    Get all registered users
router.get('/users', async (req, res) => {
    try {
        const users = await User.find()
            .select('-password -verificationOTP -verificationOTPExpire -resetPasswordOTP -resetPasswordOTPExpire')
            .sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user (cannot delete another admin)
router.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.isAdmin) return res.status(403).json({ message: 'Cannot delete another admin account.' });

        // Also remove all their items
        await Item.deleteMany({ user: req.params.id });
        await User.findByIdAndDelete(req.params.id);

        res.json({ message: 'User and all their listings removed successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET /api/admin/items
// @desc    Get ALL items including hidden ones
router.get('/items', async (req, res) => {
    try {
        const items = await Item.find()
            .populate('user', 'name email isAdmin')
            .sort({ createdAt: -1 });
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   DELETE /api/admin/items/:id
// @desc    Delete any item as admin
router.delete('/items/:id', async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Item not found' });
        await Item.findByIdAndDelete(req.params.id);
        res.json({ message: 'Item deleted by admin.' });
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   PATCH /api/admin/items/:id/toggle-hide
// @desc    Toggle visibility of an item
router.patch('/items/:id/toggle-hide', async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Item not found' });
        item.isHidden = !item.isHidden;
        await item.save();
        res.json({ message: `Item ${item.isHidden ? 'hidden' : 'unhidden'} successfully.`, item });
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   PATCH /api/admin/users/:id/toggle-admin
// @desc    Promote or demote a user's admin status
router.patch('/users/:id/toggle-admin', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        user.isAdmin = !user.isAdmin;
        await user.save();
        res.json({ message: `User ${user.isAdmin ? 'promoted to' : 'removed from'} admin.`, user });
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
