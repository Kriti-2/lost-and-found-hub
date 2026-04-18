const User = require('../models/User');

// Middleware to check if the authenticated user is an admin
const adminMiddleware = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || !user.isAdmin) {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }
        next();
    } catch (err) {
        res.status(500).json({ message: 'Server error during admin check' });
    }
};

module.exports = adminMiddleware;
