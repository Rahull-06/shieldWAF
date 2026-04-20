
// const Log = require('../models/Log');

// async function getLogs(req, res) {
//     try {
//         const page = Math.max(1, parseInt(req.query.page) || 1);
//         const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
//         const skip = (page - 1) * limit;

//         // ── Build filter ─────────────────────────────────────────────────────
//         const filter = {};

//         if (req.query.ip) {
//             filter.ip = req.query.ip.trim();
//         }
//         if (req.query.threatType) {
//             filter.threatType = req.query.threatType.trim();
//         }
//         if (req.query.severity) {
//             filter.severity = req.query.severity.trim();
//         }
//         if (req.query.action) {
//             filter.action = req.query.action.trim();
//         }
//         if (req.query.startDate || req.query.endDate) {
//             filter.timestamp = {};
//             if (req.query.startDate) filter.timestamp.$gte = new Date(req.query.startDate);
//             if (req.query.endDate) filter.timestamp.$lte = new Date(req.query.endDate);
//         }
//         if (req.query.search) {
//             const regex = new RegExp(req.query.search.trim(), 'i');
//             filter.$or = [{ path: regex }, { payload: regex }];
//         }

//         // ── Query ────────────────────────────────────────────────────────────
//         const [logs, total] = await Promise.all([
//             Log.find(filter)
//                 .sort({ timestamp: -1 })
//                 .skip(skip)
//                 .limit(limit)
//                 .lean(),
//             Log.countDocuments(filter),
//         ]);

//         return res.json({
//             success: true,
//             data: logs,
//             pagination: {
//                 page,
//                 limit,
//                 total,
//                 pages: Math.ceil(total / limit),
//                 hasNext: page * limit < total,
//                 hasPrev: page > 1,
//             },
//         });
//     } catch (err) {
//         console.error('[Logs] getLogs error:', err.message);
//         return res.status(500).json({ success: false, error: 'Failed to fetch logs' });
//     }
// }

// // ─── GET /api/logs/export ─────────────────────────────────────────────────────
// /**
//  * Export up to 1000 recent logs as a JSON download.
//  */
// async function exportLogs(req, res) {
//     try {
//         const logs = await Log.find({})
//             .sort({ timestamp: -1 })
//             .limit(1000)
//             .lean();

//         res.setHeader('Content-Disposition', 'attachment; filename="shieldwaf-logs.json"');
//         res.setHeader('Content-Type', 'application/json');
//         return res.json({ exported: logs.length, timestamp: new Date(), logs });
//     } catch (err) {
//         console.error('[Logs] exportLogs error:', err.message);
//         return res.status(500).json({ success: false, error: 'Export failed' });
//     }
// }

// // ─── GET /api/logs/:id ────────────────────────────────────────────────────────
// async function getLogById(req, res) {
//     try {
//         const log = await Log.findById(req.params.id).lean();
//         if (!log) {
//             return res.status(404).json({ success: false, error: 'Log entry not found' });
//         }
//         return res.json({ success: true, data: log });
//     } catch (err) {
//         console.error('[Logs] getLogById error:', err.message);
//         return res.status(500).json({ success: false, error: 'Failed to fetch log' });
//     }
// }

// // ─── DELETE /api/logs ─────────────────────────────────────────────────────────
// /**
//  * Clear all logs. Admin only — protected by auth middleware in routes.
//  */
// async function clearLogs(req, res) {
//     try {
//         const result = await Log.deleteMany({});
//         return res.json({
//             success: true,
//             message: `Deleted ${result.deletedCount} log entries`,
//         });
//     } catch (err) {
//         console.error('[Logs] clearLogs error:', err.message);
//         return res.status(500).json({ success: false, error: 'Failed to clear logs' });
//     }
// }

// module.exports = { getLogs, getLogById, exportLogs, clearLogs };





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