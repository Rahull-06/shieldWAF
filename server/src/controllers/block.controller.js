// PATH: server/src/controllers/block.controller.js
const BlockIP = require('../models/BlockIP')

// ── GET /api/block ────────────────────────────────────────────────────────────
async function getBlockedIPs(req, res) {
    try {
        const ips = await BlockIP.find().sort({ blockedAt: -1 }).lean()
        res.json({ success: true, data: ips })
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to fetch blocked IPs.' })
    }
}

// ── POST /api/block ───────────────────────────────────────────────────────────
async function blockIP(req, res) {
    try {
        const { ip, reason, expiresInMinutes } = req.body
        if (!ip) return res.status(400).json({ success: false, error: 'IP address is required.' })

        const expiresAt = expiresInMinutes
            ? new Date(Date.now() + expiresInMinutes * 60 * 1000)
            : null

        const blocked = await BlockIP.findOneAndUpdate(
            { ip },
            { ip, reason: reason || 'Manual block', blockedAt: new Date(), expiresAt, $inc: { hitCount: 1 }, addedBy: req.user?.name || 'admin' },
            { upsert: true, new: true }
        )

        res.status(201).json({ success: true, data: blocked })
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to block IP.' })
    }
}

// ── DELETE /api/block/:ip ─────────────────────────────────────────────────────
async function unblockIP(req, res) {
    try {
        const result = await BlockIP.findOneAndDelete({ ip: req.params.ip })
        if (!result) return res.status(404).json({ success: false, error: 'IP not found in blocklist.' })
        res.json({ success: true, message: `${req.params.ip} unblocked.` })
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to unblock IP.' })
    }
}

module.exports = { getBlockedIPs, blockIP, unblockIP }