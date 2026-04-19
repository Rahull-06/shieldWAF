/**
 * controllers/logs.controller.js — WAF Logs
 * ===========================================
 * Handles all read operations on the WAF log collection.
 *
 * Endpoints:
 *   GET  /api/logs          — paginated, filterable log list
 *   GET  /api/logs/:id      — single log entry
 *   GET  /api/logs/export   — export logs as JSON
 *   DELETE /api/logs        — clear all logs (admin only)
 */

const Log = require('../models/Log');

// ─── GET /api/logs ────────────────────────────────────────────────────────────
/**
 * Returns paginated WAF logs with optional filters.
 *
 * Query params:
 *   page       (default 1)
 *   limit      (default 20, max 100)
 *   ip         filter by IP address
 *   threatType filter by threat category (e.g. sqli, xss)
 *   severity   filter by severity (low, medium, high, critical)
 *   action     filter by action (block, log)
 *   startDate  ISO date string
 *   endDate    ISO date string
 *   search     text search on path/payload
 */
async function getLogs(req, res) {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
        const skip = (page - 1) * limit;

        // ── Build filter ─────────────────────────────────────────────────────
        const filter = {};

        if (req.query.ip) {
            filter.ip = req.query.ip.trim();
        }
        if (req.query.threatType) {
            filter.threatType = req.query.threatType.trim();
        }
        if (req.query.severity) {
            filter.severity = req.query.severity.trim();
        }
        if (req.query.action) {
            filter.action = req.query.action.trim();
        }
        if (req.query.startDate || req.query.endDate) {
            filter.timestamp = {};
            if (req.query.startDate) filter.timestamp.$gte = new Date(req.query.startDate);
            if (req.query.endDate) filter.timestamp.$lte = new Date(req.query.endDate);
        }
        if (req.query.search) {
            const regex = new RegExp(req.query.search.trim(), 'i');
            filter.$or = [{ path: regex }, { payload: regex }];
        }

        // ── Query ────────────────────────────────────────────────────────────
        const [logs, total] = await Promise.all([
            Log.find(filter)
                .sort({ timestamp: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Log.countDocuments(filter),
        ]);

        return res.json({
            success: true,
            data: logs,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
                hasNext: page * limit < total,
                hasPrev: page > 1,
            },
        });
    } catch (err) {
        console.error('[Logs] getLogs error:', err.message);
        return res.status(500).json({ success: false, error: 'Failed to fetch logs' });
    }
}

// ─── GET /api/logs/export ─────────────────────────────────────────────────────
/**
 * Export up to 1000 recent logs as a JSON download.
 */
async function exportLogs(req, res) {
    try {
        const logs = await Log.find({})
            .sort({ timestamp: -1 })
            .limit(1000)
            .lean();

        res.setHeader('Content-Disposition', 'attachment; filename="shieldwaf-logs.json"');
        res.setHeader('Content-Type', 'application/json');
        return res.json({ exported: logs.length, timestamp: new Date(), logs });
    } catch (err) {
        console.error('[Logs] exportLogs error:', err.message);
        return res.status(500).json({ success: false, error: 'Export failed' });
    }
}

// ─── GET /api/logs/:id ────────────────────────────────────────────────────────
async function getLogById(req, res) {
    try {
        const log = await Log.findById(req.params.id).lean();
        if (!log) {
            return res.status(404).json({ success: false, error: 'Log entry not found' });
        }
        return res.json({ success: true, data: log });
    } catch (err) {
        console.error('[Logs] getLogById error:', err.message);
        return res.status(500).json({ success: false, error: 'Failed to fetch log' });
    }
}

// ─── DELETE /api/logs ─────────────────────────────────────────────────────────
/**
 * Clear all logs. Admin only — protected by auth middleware in routes.
 */
async function clearLogs(req, res) {
    try {
        const result = await Log.deleteMany({});
        return res.json({
            success: true,
            message: `Deleted ${result.deletedCount} log entries`,
        });
    } catch (err) {
        console.error('[Logs] clearLogs error:', err.message);
        return res.status(500).json({ success: false, error: 'Failed to clear logs' });
    }
}

module.exports = { getLogs, getLogById, exportLogs, clearLogs };