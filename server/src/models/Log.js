// const mongoose = require("mongoose");

// const LogSchema = new mongoose.Schema(
//     {
//         // ---- Request Info ----
//         ip: { type: String, required: true, index: true },

//         method: {
//             type: String,
//             enum: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"],
//         },

//         // Support both 'url' (waf middleware) and 'path' (simulate controller)
//         url  : { type: String, default: "/" },
//         path : { type: String, default: "/" },

//         payload    : { type: String, default: "" },
//         userAgent  : { type: String, default: "" },

//         // ---- WAF Decision ----
//         action: {
//             type    : String,
//             enum    : ["allowed", "blocked", "flagged"],
//             default : "allowed",
//             index   : true,
//         },

//         // Alias used by simulate controller
//         blocked: { type: Boolean, default: false },

//         // ---- Attack Classification ----
//         attackType: {
//             type    : String,
//             enum    : ["sqli","xss","path","cmd","csrf","xxe","rce","ssrf","lfi","cmdi","none"],
//             default : "none",
//             index   : true,
//         },

//         // Raw detections array from rule engine
//         threats: { type: mongoose.Schema.Types.Mixed, default: [] },

//         // ---- AI Fields ----
//         aiScore      : { type: Number, default: null, min: 0, max: 100 },
//         aiConfidence : { type: Number, default: null, min: 0, max: 100 },
//         aiProvider   : { type: String, default: null },

//         // ---- Severity ----
//         severity: {
//             type    : String,
//             enum    : ["none", "low", "medium", "high", "critical"],
//             default : "none",
//         },

//         triggeredRule : { type: String, default: null },
//         responseTime  : { type: Number, default: 0 },

//         // Source of the log entry
//         source: {
//             type    : String,
//             enum    : ["waf", "simulate", "simulate-preset", "manual"],
//             default : "waf",
//         },
//     },
//     { timestamps: true }
// );

// LogSchema.index({ createdAt: -1 });
// LogSchema.index({ ip: 1, createdAt: -1 });
// LogSchema.index({ attackType: 1, action: 1 });

// module.exports = mongoose.model("Log", LogSchema);








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