// PATH: server/src/models/Log.js
const mongoose = require('mongoose')

const LogSchema = new mongoose.Schema({
    timestamp: {
        type: Date,
        default: Date.now,
        index: true,
    },
    ip: {
        type: String,
        required: true,
        index: true,
    },
    country: {
        type: String,
        default: 'Unknown',
    },
    countryFlag: {
        type: String,
        default: '🌐',
    },
    countryCode: {
        type: String,
        default: 'UN',
    },
    method: {
        type: String,
        enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
        required: true,
    },
    path: {
        type: String,
        required: true,
    },
    attackType: {
        type: String,
        enum: [
            'SQL Injection', 'XSS', 'Path Traversal', 'Command Injection',
            'CSRF', 'XXE', 'SSRF', 'Brute Force', 'Clean',
        ],
        required: true,
    },
    payload: {
        type: String,
        required: true,
        maxlength: 500,
    },
    severity: {
        type: String,
        enum: ['Critical', 'High', 'Medium', 'Low'],
        required: true,
    },
    riskScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
    },
    action: {
        type: String,
        enum: ['Blocked', 'Allowed', 'Warning'],
        required: true,
    },
    ruleTriggered: {
        type: String,
        default: '',
    },
    userAgent: {
        type: String,
        default: '',
    },
}, { timestamps: false })

// ── Indexes for fast filtering ─────────────────────────────────────────────────
LogSchema.index({ action: 1 })
LogSchema.index({ severity: 1 })
LogSchema.index({ attackType: 1 })
LogSchema.index({ timestamp: -1 })

module.exports = mongoose.model('Log', LogSchema)