// PATH: server/src/middleware/auth.js
const jwt = require('jsonwebtoken')
const User = require('../models/User')

// ── Protect: verify JWT token ─────────────────────────────────────────────────
async function protect(req, res, next) {
    try {
        const header = req.headers.authorization
        if (!header || !header.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, error: 'Not authenticated. Please login.' })
        }

        const token = header.split(' ')[1]
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'shieldwaf_dev_secret')

        const user = await User.findById(decoded.id)
        if (!user || !user.isActive) {
            return res.status(401).json({ success: false, error: 'User not found or deactivated.' })
        }

        req.user = user
        next()
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, error: 'Session expired. Please login again.' })
        }
        return res.status(401).json({ success: false, error: 'Invalid token.' })
    }
}

// ── Admin only ────────────────────────────────────────────────────────────────
function adminOnly(req, res, next) {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Admin access required.' })
    }
    next()
}

// ── Optional auth: attaches user if token present, doesn't block if not ──────
async function optionalAuth(req, _res, next) {
    try {
        const header = req.headers.authorization
        if (header && header.startsWith('Bearer ')) {
            const token = header.split(' ')[1]
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'shieldwaf_dev_secret')
            const user = await User.findById(decoded.id)
            if (user) req.user = user
        }
    } catch {
        // silently ignore — user stays unauthenticated
    }
    next()
}

module.exports = { protect, adminOnly, optionalAuth }