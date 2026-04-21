// PATH: server/src/routes/waf.routes.js
const router = require('express').Router()
const Rule = require('../models/Rule')
const Log = require('../models/Log')
const { protect, adminOnly } = require('../middleware/auth')

// GET /api/waf/status — summary for the WAF status widget
router.get('/status', protect, async (_req, res) => {
    try {
        const [activeRules, totalBlocked, last1h] = await Promise.all([
            Rule.countDocuments({ enabled: true }),
            Log.countDocuments({ action: 'Blocked' }),
            Log.countDocuments({
                action: 'Blocked',
                timestamp: { $gte: new Date(Date.now() - 60 * 60 * 1000) },
            }),
        ])

        res.json({
            success: true,
            data: {
                wafEnabled: true,
                mode: 'block',
                activeRules,
                totalBlocked,
                blockedLastHour: last1h,
                uptime: '99.98%',
                lastUpdated: new Date().toISOString(),
            },
        })
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to fetch WAF status.' })
    }
})

module.exports = router