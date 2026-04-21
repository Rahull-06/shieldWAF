const Rule = require('../models/Rule');
const BlockIP = require('../models/BlockIP');
const Log = require('../models/Log');
const { DEFAULT_RULES } = require('../config/rules');
const { invalidateRuleCache } = require('../middleware/waf');
const { analyzeThreat } = require('../services/ai.service');

// ─── Rule Management ──────────────────────────────────────────────────────────

exports.getRules = async (req, res) => {
    try {
        let rules = await Rule.find().sort({ ruleId: 1 });

        // Seed default rules on first run
        if (rules.length === 0) {
            rules = await Rule.insertMany(DEFAULT_RULES);
        }

        res.json({ success: true, data: rules });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.updateRule = async (req, res) => {
    try {
        const allowedFields = ['enabled', 'action', 'name', 'description'];
        const updates = {};
        for (const field of allowedFields) {
            if (req.body[field] !== undefined) updates[field] = req.body[field];
        }

        const rule = await Rule.findByIdAndUpdate(req.params.id, updates, {
            new: true,
            runValidators: true,
        });

        if (!rule) return res.status(404).json({ success: false, error: 'Rule not found' });

        // Bust the in-memory rule cache so changes take effect immediately
        invalidateRuleCache();

        res.json({ success: true, data: rule, message: 'Rule updated. Cache refreshed.' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.resetRules = async (req, res) => {
    try {
        await Rule.deleteMany({});
        const rules = await Rule.insertMany(DEFAULT_RULES);
        invalidateRuleCache();
        res.json({ success: true, data: rules, message: 'Rules reset to defaults.' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// ─── IP Block Management ──────────────────────────────────────────────────────

exports.getBlockedIPs = async (req, res) => {
    try {
        const query =
            req.query.all === 'true'
                ? {}
                : {
                    $or: [
                        { expiresAt: { $exists: false } },
                        { expiresAt: null },
                        { expiresAt: { $gt: new Date() } },
                    ],
                };

        const ips = await BlockIP.find(query).sort({ createdAt: -1 });
        res.json({ success: true, data: ips, count: ips.length });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.blockIP = async (req, res) => {
    try {
        const { ip, reason = 'Manual block', durationMinutes } = req.body;

        if (!ip) return res.status(400).json({ success: false, error: 'IP address is required' });

        // Basic IP format validation
        const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
        if (!ipv4Regex.test(ip)) {
            return res.status(400).json({ success: false, error: 'Invalid IP address format' });
        }

        // Check if already blocked
        const existing = await BlockIP.findOne({ ip });
        if (existing) {
            return res.status(409).json({ success: false, error: 'IP is already blocked' });
        }

        const blockData = {
            ip,
            reason,
            blockedBy: req.user?.email || 'system',
        };

        if (durationMinutes) {
            blockData.expiresAt = new Date(Date.now() + durationMinutes * 60 * 1000);
        }

        const blocked = await BlockIP.create(blockData);

        // Emit live update
        const io = req.app.get('io');
        if (io) io.emit('waf:ip-blocked', { ip, reason });

        res.status(201).json({ success: true, data: blocked });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.unblockIP = async (req, res) => {
    try {
        const blocked = await BlockIP.findByIdAndDelete(req.params.id);
        if (!blocked) return res.status(404).json({ success: false, error: 'Blocked IP not found' });

        const io = req.app.get('io');
        if (io) io.emit('waf:ip-unblocked', { ip: blocked.ip });

        res.json({ success: true, message: `IP ${blocked.ip} unblocked.` });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// ─── Log Viewer ───────────────────────────────────────────────────────────────

exports.getLogs = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
        const skip = (page - 1) * limit;

        // Build dynamic filter
        const filter = {};
        if (req.query.severity) filter.severity = req.query.severity;
        if (req.query.type) filter.threatType = req.query.type;
        if (req.query.ip) filter.ip = req.query.ip;
        if (req.query.from || req.query.to) {
            filter.timestamp = {};
            if (req.query.from) filter.timestamp.$gte = new Date(req.query.from);
            if (req.query.to) filter.timestamp.$lte = new Date(req.query.to);
        }

        const [logs, total] = await Promise.all([
            Log.find(filter).sort({ timestamp: -1 }).skip(skip).limit(limit).lean(),
            Log.countDocuments(filter),
        ]);

        res.json({
            success: true,
            data: logs,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};


exports.clearLogs = async (req, res) => {
    try {
        const result = await Log.deleteMany({});
        res.json({ success: true, message: `Deleted ${result.deletedCount} log entries.` });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// ─── AI Analysis ─────────────────────────────────────────────────────────────

exports.analyzeLog = async (req, res) => {
    try {
        const log = await Log.findById(req.params.logId).lean();
        if (!log) return res.status(404).json({ success: false, error: 'Log entry not found' });

        const analysis = await analyzeThreat(log);
        res.json({ success: true, data: { log, analysis } });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

exports.getStats = async (req, res) => {
    try {
        const now = new Date();
        const todayStart = new Date(now.setHours(0, 0, 0, 0));
        const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        const [
            totalAll,
            totalToday,
            totalWeek,
            bySeverity,
            byType,
            topIPs,
            hourly,
        ] = await Promise.all([
            // Total all time
            Log.countDocuments(),

            // Today
            Log.countDocuments({ timestamp: { $gte: todayStart } }),

            // This week
            Log.countDocuments({ timestamp: { $gte: weekStart } }),

            // Group by severity
            Log.aggregate([
                { $group: { _id: '$severity', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
            ]),

            // Top 5 threat types
            Log.aggregate([
                { $group: { _id: '$threatType', label: { $first: '$threatLabel' }, count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 5 },
            ]),

            // Top 10 attacking IPs
            Log.aggregate([
                { $group: { _id: '$ip', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 },
            ]),

            // Requests per hour for last 24 hours
            Log.aggregate([
                { $match: { timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } },
                {
                    $group: {
                        _id: { $hour: '$timestamp' },
                        count: { $sum: 1 },
                    },
                },
                { $sort: { _id: 1 } },
            ]),
        ]);

        res.json({
            success: true,
            data: {
                totals: { all: totalAll, today: totalToday, week: totalWeek },
                bySeverity,
                byType,
                topIPs,
                hourly,
            },
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};