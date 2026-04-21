// PATH: server/src/models/Rule.js
const mongoose = require('mongoose')

const RuleSchema = new mongoose.Schema({
    ruleId: {
        type: String,
        unique: true,
        required: true,
    },
    name: {
        type: String,
        required: [true, 'Rule name is required'],
        trim: true,
    },
    description: {
        type: String,
        default: '',
    },
    category: {
        type: String,
        required: true,
        trim: true,
    },
    action: {
        type: String,
        enum: ['Block', 'Allow', 'Monitor'],
        default: 'Block',
    },
    severity: {
        type: String,
        enum: ['Critical', 'High', 'Medium', 'Low'],
        required: true,
    },
    patterns: {
        type: [String],
        default: [],
    },
    hits: {
        type: Number,
        default: 0,
    },
    enabled: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true })

module.exports = mongoose.model('Rule', RuleSchema)