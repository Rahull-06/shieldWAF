// PATH: server/src/controllers/logs.controller.js
const Log = require('../models/Log')

// ── GET /api/logs ─────────────────────────────────────────────────────────────
async function getLogs(req, res) {
    try {
        const {
            page = 1,
            limit = 20,
            attackType = '',
            severity = '',
            action = '',
            search = '',
            from = '',
            to = '',
        } = req.query

        const filter = {}

        if (attackType) filter.attackType = attackType
        if (severity) filter.severity = severity
        if (action) filter.action = action

        if (from || to) {
            filter.timestamp = {}
            if (from) filter.timestamp.$gte = new Date(from)
            if (to) filter.timestamp.$lte = new Date(to)
        }

        if (search) {
            filter.$or = [
                { ip: { $regex: search, $options: 'i' } },
                { payload: { $regex: search, $options: 'i' } },
                { attackType: { $regex: search, $options: 'i' } },
                { country: { $regex: search, $options: 'i' } },
            ]
        }

        const skip = (Number(page) - 1) * Number(limit)
        const total = await Log.countDocuments(filter)
        const logs = await Log.find(filter)
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(Number(limit))
            .lean()

        // Format timestamp for frontend
        const formatted = logs.map(l => ({
            ...l,
            id: l._id.toString(),
            timestamp: new Date(l.timestamp).toLocaleTimeString('en-GB', {
                hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3,
            }),
        }))

        res.json({
            success: true,
            data: {
                items: formatted,
                total,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(total / Number(limit)),
            },
        })
    } catch (err) {
        console.error('getLogs error:', err)
        res.status(500).json({ success: false, error: 'Failed to fetch logs.' })
    }
}

// ── GET /api/logs/recent ──────────────────────────────────────────────────────
async function getRecentLogs(req, res) {
    try {
        const logs = await Log.find({ action: { $in: ['Blocked', 'Warning'] } })
            .sort({ timestamp: -1 })
            .limit(10)
            .lean()

        const formatted = logs.map(l => ({
            id: l._id.toString(),
            timestamp: new Date(l.timestamp).toLocaleTimeString('en-GB', {
                hour: '2-digit', minute: '2-digit', second: '2-digit',
            }),
            ip: l.ip,
            method: l.method,
            payload: l.payload,
            action: l.action.toLowerCase(),
            attackType: l.attackType,
        }))

        res.json({ success: true, data: formatted })
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to fetch recent logs.' })
    }
}

// ── DELETE /api/logs/:id ──────────────────────────────────────────────────────
async function deleteLog(req, res) {
    try {
        await Log.findByIdAndDelete(req.params.id)
        res.json({ success: true, message: 'Log deleted.' })
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to delete log.' })
    }
}

module.exports = { getLogs, getRecentLogs, deleteLog }