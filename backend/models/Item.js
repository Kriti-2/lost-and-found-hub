const mongoose = require('mongoose');

const ClaimSchema = new mongoose.Schema({
    claimerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['Pending', 'Accepted', 'Rejected'], default: 'Pending' },
    message: { type: String }
});

const ItemSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['Lost', 'Found'],
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    image: {
        type: String, // URL/path to the image
    },
    status: {
        type: String,
        enum: ['Lost', 'Found', 'Returned'],
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    claims: [ClaimSchema]
}, { timestamps: true });

module.exports = mongoose.model('Item', ItemSchema);
