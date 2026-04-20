// const rateLimit = require("express-rate-limit");

// // ============================================================
// //  General API Rate Limiter
// //  Applied to all /api/* routes
// //  100 requests per 15 minutes per IP
// // ============================================================
// const apiLimiter = rateLimit({
//     windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
//     max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
//     message: {
//         success: false,
//         message: "Too many requests from this IP. Please try again after 15 minutes.",
//     },
//     standardHeaders: true,  // Send rate limit info in response headers
//     legacyHeaders: false,  // Disable old X-RateLimit-* headers
// });

// // ============================================================
// //  Strict Auth Rate Limiter
// //  Applied ONLY to /api/auth/login and /api/auth/register
// //  Stricter: 10 attempts per 15 minutes
// //  Prevents brute-force password guessing
// // ============================================================
// const authLimiter = rateLimit({
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     max: 10,              // Max 10 login attempts per 15 min
//     message: {
//         success: false,
//         message: "Too many login attempts. Please try again after 15 minutes.",
//     },
//     standardHeaders: true,
//     legacyHeaders: false,
//     skipSuccessfulRequests: true, // Don't count successful logins against the limit
// });

// module.exports = { apiLimiter, authLimiter };



// PATH: server/src/middleware/rateLimit.js
const rateLimit = require('express-rate-limit')

// Strict limiter for login endpoint
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,                   // 10 attempts per window
    skipSuccessfulRequests: true,
    message: {
        success: false,
        error: 'Too many login attempts. Please try again in 15 minutes.',
    },
    standardHeaders: true,
    legacyHeaders: false,
})

// Moderate limiter for register
const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    message: {
        success: false,
        error: 'Too many accounts created from this IP. Try again in 1 hour.',
    },
})

// Limiter for simulate endpoint
const simulateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30,
    message: {
        success: false,
        error: 'Simulation rate limit exceeded. Max 30 per minute.',
    },
})

module.exports = { loginLimiter, registerLimiter, simulateLimiter }