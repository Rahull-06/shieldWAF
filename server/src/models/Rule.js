// const mongoose = require("mongoose");

// const RuleSchema = new mongoose.Schema(
//     {
//         // ---- Rule Identity ----
//         name: {
//             type: String,
//             required: [true, "Rule name is required"],
//             unique: true,
//             trim: true,
//             // Example: "SQL Injection - UNION SELECT"
//         },

//         description: {
//             type: String,
//             default: "",
//             // Example: "Detects UNION-based SQL injection attempts"
//         },

//         // ---- Classification ----
//         category: {
//             type: String,
//             required: true,
//             enum: ["sqli", "xss", "path", "cmd", "csrf", "xxe", "rce", "custom"],
//             index: true,
//         },

//         severity: {
//             type: String,
//             enum: ["low", "medium", "high", "critical"],
//             default: "high",
//         },

//         // ---- Detection Pattern ----
//         pattern: {
//             type: String,
//             required: [true, "Pattern is required"],
//             // Stored as a regex string, e.g.: "union\\s+select"
//         },

//         // Where to look for the pattern
//         targets: {
//             type: [String],
//             default: ["body", "query", "headers", "url"],
//             enum: ["body", "query", "headers", "url", "cookies"],
//         },

//         // ---- Rule Action ----
//         action: {
//             type: String,
//             enum: ["block", "flag", "log"],
//             default: "block",
//             // block → reject request immediately
//             // flag  → allow but mark as suspicious
//             // log   → only log, no action (monitoring mode)
//         },

//         // ---- Status ----
//         isActive: {
//             type: Boolean,
//             default: true,
//             index: true,
//         },

//         // ---- Stats (updated by WAF middleware) ----
//         hitCount: {
//             type: Number,
//             default: 0,
//             // How many times this rule has triggered
//         },

//         lastTriggered: {
//             type: Date,
//             default: null,
//         },

//         // ---- Who created/updated this rule ----
//         createdBy: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "User",
//         },
//     },
//     {
//         timestamps: true,
//     }
// );

// module.exports = mongoose.model("Rule", RuleSchema);



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