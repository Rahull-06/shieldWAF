// ============================================================
//  middleware/rateLimit.js — Rate Limiting Middleware
//
//  Prevents brute-force attacks and API abuse by limiting
//  how many requests an IP can make in a time window.
//
//  Uses express-rate-limit package (install it via npm)
// ============================================================

const rateLimit = require("express-rate-limit");

// ============================================================
//  General API Rate Limiter
//  Applied to all /api/* routes
//  100 requests per 15 minutes per IP
// ============================================================
const apiLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
    message: {
        success: false,
        message: "Too many requests from this IP. Please try again after 15 minutes.",
    },
    standardHeaders: true,  // Send rate limit info in response headers
    legacyHeaders: false,  // Disable old X-RateLimit-* headers
});

// ============================================================
//  Strict Auth Rate Limiter
//  Applied ONLY to /api/auth/login and /api/auth/register
//  Stricter: 10 attempts per 15 minutes
//  Prevents brute-force password guessing
// ============================================================
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,              // Max 10 login attempts per 15 min
    message: {
        success: false,
        message: "Too many login attempts. Please try again after 15 minutes.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't count successful logins against the limit
});

module.exports = { apiLimiter, authLimiter };