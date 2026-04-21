// PATH: server/src/models/BlockIP.js
const mongoose = require('mongoose')

const BlockIPSchema = new mongoose.Schema({
    ip: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    reason: {
        type: String,
        default: 'Manual block',
    },
    blockedAt: {
        type: Date,
        default: Date.now,
    },
    expiresAt: {
        type: Date,
        default: null, // null = permanent
    },
    hitCount: {
        type: Number,
        default: 1,
    },
    country: {
        type: String,
        default: 'Unknown',
    },
    addedBy: {
        type: String,
        default: 'system',
    },
}, { timestamps: true })

module.exports = mongoose.model('BlockIP', BlockIPSchema)