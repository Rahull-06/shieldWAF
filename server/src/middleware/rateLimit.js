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