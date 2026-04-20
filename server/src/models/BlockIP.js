// const mongoose = require("mongoose");

// const BlockIPSchema = new mongoose.Schema(
//     {
//         // ---- IP Address ----
//         ip: {
//             type: String,
//             required: [true, "IP address is required"],
//             unique: true,
//             trim: true,
//             index: true,
//         },

//         // ---- Reason for Block ----
//         reason: {
//             type: String,
//             default: "Manual block",
//             // Examples: "SQL Injection", "Brute force", "Manual block"
//         },

//         // ---- Block Type ----
//         blockType: {
//             type: String,
//             enum: ["permanent", "temporary"],
//             default: "permanent",
//         },

//         // For temporary blocks — when does the block expire?
//         // If null, it's permanent
//         expiresAt: {
//             type: Date,
//             default: null,
//             index: true, // Index for expiry cleanup jobs
//         },

//         // ---- Attack Info ----
//         attackType: {
//             type: String,
//             default: "unknown",
//         },

//         // How many attacks came from this IP before being blocked
//         attackCount: {
//             type: Number,
//             default: 1,
//         },

//         // ---- Status ----
//         isActive: {
//             type: Boolean,
//             default: true,
//             index: true,
//         },

//         // ---- Who blocked this IP ----
//         blockedBy: {
//             type: String,
//             default: "system", // "system" = auto-blocked, or username if manual
//         },
//     },
//     {
//         timestamps: true, // createdAt = when IP was blocked
//     }
// );

// // ============================================================
// //  METHOD: Check if block has expired (for temporary blocks)
// // ============================================================
// BlockIPSchema.methods.isExpired = function () {
//     if (!this.expiresAt) return false; // Permanent block never expires
//     return new Date() > this.expiresAt;
// };

// // ============================================================
// //  STATIC: Check if a given IP is currently blocked
// //  Usage: const blocked = await BlockIP.isBlocked("192.168.1.1")
// // ============================================================
// BlockIPSchema.statics.isBlocked = async function (ip) {
//     const record = await this.findOne({ ip, isActive: true });
//     if (!record) return false;

//     // Auto-deactivate expired temporary blocks
//     if (record.isExpired()) {
//         record.isActive = false;
//         await record.save();
//         return false;
//     }

//     return true;
// };

// module.exports = mongoose.model("BlockIP", BlockIPSchema);







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