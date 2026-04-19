// ============================================================
//  Rule.js — WAF Rule Model
//
//  Stores the detection rules that the WAF middleware uses
//  to identify and block malicious requests.
//  Rules can be pattern-based (regex) or keyword-based.
// ============================================================

const mongoose = require("mongoose");

const RuleSchema = new mongoose.Schema(
    {
        // ---- Rule Identity ----
        name: {
            type: String,
            required: [true, "Rule name is required"],
            unique: true,
            trim: true,
            // Example: "SQL Injection - UNION SELECT"
        },

        description: {
            type: String,
            default: "",
            // Example: "Detects UNION-based SQL injection attempts"
        },

        // ---- Classification ----
        category: {
            type: String,
            required: true,
            enum: ["sqli", "xss", "path", "cmd", "csrf", "xxe", "rce", "custom"],
            index: true,
        },

        severity: {
            type: String,
            enum: ["low", "medium", "high", "critical"],
            default: "high",
        },

        // ---- Detection Pattern ----
        pattern: {
            type: String,
            required: [true, "Pattern is required"],
            // Stored as a regex string, e.g.: "union\\s+select"
        },

        // Where to look for the pattern
        targets: {
            type: [String],
            default: ["body", "query", "headers", "url"],
            enum: ["body", "query", "headers", "url", "cookies"],
        },

        // ---- Rule Action ----
        action: {
            type: String,
            enum: ["block", "flag", "log"],
            default: "block",
            // block → reject request immediately
            // flag  → allow but mark as suspicious
            // log   → only log, no action (monitoring mode)
        },

        // ---- Status ----
        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },

        // ---- Stats (updated by WAF middleware) ----
        hitCount: {
            type: Number,
            default: 0,
            // How many times this rule has triggered
        },

        lastTriggered: {
            type: Date,
            default: null,
        },

        // ---- Who created/updated this rule ----
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Rule", RuleSchema);