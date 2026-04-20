const express = require('express');
const Item = require('../models/Item');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const { upload, cloudinary } = require('../middleware/upload');
const { sendMail } = require('../utils/mailer');
const Filter = require('bad-words');
const filter = new Filter();

// Add custom bad words to the filter
const customBadWords = [
    'fuk', 'shit', 'asshole', 'bastard', 'dick', 'pussy', 'nude', 'porn', 'sex', 'naked',
    'bitch', 'crap', 'damn', 'hell', 'piss', 'slut', 'whore', 'bastard', 'faggot', 'nigger',
    'kike', 'spic', 'chink', 'wetback', 'retard', 'rape', 'murder', 'kill', 'suicide'
];
filter.addWords(...customBadWords);

const router = express.Router();

// @route   GET /api/items
// @desc    Get all items (with filters and search)
router.get('/', async (req, res) => {
    try {
        const { search, type, status, user: userId } = req.query;
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
        if (userId) query.user = userId;
        
        // Hide reported/flagged items from general view
        query.isHidden = { $ne: true };

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
        
        if (filter.isProfane(name) || filter.isProfane(description) || filter.isProfane(location)) {
            return res.status(400).json({ message: 'Inappropriate language detected. Post rejected.' });
        }
        
        let imageUrl = '';
        if (req.file) {
            imageUrl = req.file.path;
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

        // ------------------
        // Background Tasks (Automated Matching)
        // ------------------
        // We already scan for NSFW on the frontend to protect the server and save CPU.
        // We only do the matching logic here.
        setImmediate(async () => {
            try {
                // Matching Algorithm: If a "Found" item is posted, notify users who lost something similar
                if (savedItem.type === 'Found' && name && name.length > 3) {
                    const keywords = name.toLowerCase().split(' ').filter(word => word.length > 3);
                    if (keywords.length > 0) {
                        // Simpler and faster search: matches at least one keyword
                        const matchingLostItems = await Item.find({
                            type: 'Lost',
                            name: { $regex: keywords.join('|'), $options: 'i' }
                        }).populate('user').limit(5); // Limit notifications to prevent mail spam/hang

                        for (let lostItem of matchingLostItems) {
                            if (lostItem.user?.email) {
                                sendMail(
                                    lostItem.user.email,
                                    "Potential Match for Your Lost Item!",
                                    `A potential match ("${savedItem.name}") for your lost item "${lostItem.name}" was found.`,
                                    `<p>Hello ${lostItem.user.name}, someone posted a <strong>Found</strong> item named <em>"${savedItem.name}"</em> which may match your lost item!</p>`
                                ).catch(e => console.error("Email error:", e));
                            }
                        }
                    }
                }
            } catch (bgErr) {
                console.error("Background matching error:", bgErr);
            }
        });

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
        
        // Profanity Check for updates
        if ((name && filter.isProfane(name)) || 
            (description && filter.isProfane(description)) || 
            (location && filter.isProfane(location))) {
            return res.status(400).json({ message: 'Inappropriate language detected. Update rejected.' });
        }

        item.type = type || item.type;
        item.name = name || item.name;
        item.description = description || item.description;
        item.location = location || item.location;
        item.date = date || item.date;
        item.status = status || item.status;

        if (req.file) {
            const imageUrl = req.file.path;

            // Backend Image Moderation Check
            const isNSFW = await checkImageNSFW(imageUrl);
            if (isNSFW) {
                // Delete from cloudinary immediately
                if (req.file.filename) {
                    await cloudinary.uploader.destroy(req.file.filename);
                }
                return res.status(400).json({ message: 'Inappropriate image detected. Update rejected.' });
            }

            item.image = imageUrl;
        }

        const updatedItem = await item.save();

        // Notify regarding "Returned" status
        if (status === 'Returned') {
            const owner = await User.findById(item.user);
            
            // Email to Owner
            if (owner) {
                const subject = "Item Successfully Returned!";
                const html = `<h3>Congratulations!</h3><p>Your item <strong>"${item.name}"</strong> has been marked as <strong>Returned</strong>.</p><p>Thank you for using the Lost & Found Hub!</p>`;
                await sendMail(owner.email, subject, "Your item has been marked as returned.", html);
            }

            // Notify all claimers
            for (const claim of item.claims) {
                const claimer = await User.findById(claim.claimerId);
                if (claimer) {
                    // In-app Notification
                    claimer.notifications.push({
                        senderName: "System",
                        message: `The item "${item.name}" you claimed has been marked as Returned (Resolved).`,
                        itemName: item.name,
                        isRead: false
                    });
                    await claimer.save();

                    // Email to Claimer
                    const subject = "Update: A Claimed Item has been Returned";
                    const html = `<h3>Item Resolved!</h3><p>Hello ${claimer.name},</p><p>The item <strong>"${item.name}"</strong> that you sent a claim for has been marked as <strong>Returned / Resolved</strong> by the owner.</p><p>If you have already received the item, great! If not, please check the chat for any last details.</p>`;
                    await sendMail(claimer.email, subject, "An item you claimed is now marked as returned.", html);
                }
            }
        }

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

            // Send Email to Owner
            const subject = "Someone Claimed Your Item!";
            const text = `Hello ${ownerUser.name},\n\n${claimerUser.name} has claimed your item "${item.name}".\nMessage: "${message}"\n\nLogin to the hub to chat with them!`;
            const html = `<h3>Item Claim Alert!</h3><p>Hello ${ownerUser.name},</p><p><strong>${claimerUser.name}</strong> has claimed your item <em>"${item.name}"</em>.</p><p><strong>Their Message:</strong> "${message}"</p><p>Please log into the app to check your inbox and reply.</p>`;
            await sendMail(ownerUser.email, subject, text, html);
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
            // Ensure the chat is not hidden for the owner
            existingChat.hiddenBy = existingChat.hiddenBy.filter(id => id.toString() !== item.user._id.toString());
            await existingChat.save();
        }

        res.json({ message: 'Claim request sent successfully!', item });
    } catch (err) {
        console.error("Claim error:", err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   POST /api/items/:id/report
// @desc    Report an item
// @access  Private
router.post('/:id/report', authMiddleware, async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Item not found' });

        if (item.reports.includes(req.user.id)) {
            return res.status(400).json({ message: 'You have already reported this item.' });
        }

        item.reports.push(req.user.id);
        
        // Auto-hide if reported by 3 different users
        if (item.reports.length >= 3) {
            item.isHidden = true;
        }

        await item.save();
        res.json({ message: 'Item reported successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
