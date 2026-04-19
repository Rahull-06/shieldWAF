/**
 * controllers/metrics.controller.js — Dashboard Stats & Charts
 * ==============================================================
 * Aggregates REAL data from the Log collection for the dashboard.
 */

const Log = require('../models/Log');
const BlockIP = require('../models/BlockIP');

// Country prefix → name mapping (matches what seed.js uses)
const IP_COUNTRY_MAP = {
    '109': 'Russia', '91': 'Russia', '5': 'Germany',
    '185': 'Netherlands', '45': 'China', '103': 'China',
    '116': 'China', '47': 'China', '104': 'United States',
    '203': 'United States', '198': 'United States', '67': 'United States',
    '77': 'Netherlands', '194': 'Germany', '89': 'France',
    '212': 'France', '163': 'France', '179': 'Brazil',
    '189': 'Brazil', '201': 'Brazil', '45': 'Brazil',
    '81': 'UK', '94': 'UK', '176': 'Ukraine',
    '49': 'India', '117': 'India', '172': 'India',
};

function ipToCountry(ip) {
    if (!ip) return 'Unknown';
    const first = ip.split('.')[0];
    // Use more specific matching
    if (ip.startsWith('109.169') || ip.startsWith('91.108') || ip.startsWith('5.188')) return 'Russia';
    if (ip.startsWith('45.155') || ip.startsWith('103.76') || ip.startsWith('116.') || ip.startsWith('47.')) return 'China';
    if (ip.startsWith('104.') || ip.startsWith('203.') || ip.startsWith('198.51') || ip.startsWith('67.')) return 'United States';
    if (ip.startsWith('172.16') || ip.startsWith('103.21') || ip.startsWith('49.') || ip.startsWith('117.')) return 'India';
    if (ip.startsWith('77.') || ip.startsWith('185.220') || ip.startsWith('194.165')) return 'Netherlands';
    if (ip.startsWith('91.108') || ip.startsWith('5.188') || ip.startsWith('89.234') || ip.startsWith('194.')) return 'Germany';
    if (ip.startsWith('89.') || ip.startsWith('212.') || ip.startsWith('163.')) return 'France';
    if (ip.startsWith('179.') || ip.startsWith('189.') || ip.startsWith('201.') || ip.startsWith('45.225')) return 'Brazil';
    if (ip.startsWith('81.') || ip.startsWith('94.')) return 'UK';
    if (ip.startsWith('176.') || ip.startsWith('185.242')) return 'Ukraine';
    return 'Other';
}

// ─── GET /api/metrics/summary ─────────────────────────────────────────────────
async function getSummary(req, res) {
    try {
        const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const sinceWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        // Get today start (midnight)
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const [
            totalRequests,
            totalBlocked,
            last24hTotal,
            last24hBlocked,
            todayTotal,
            todayBlocked,
            weekBlocked,
            activeBlocks,
            topThreats,
            avgResponseRaw,
        ] = await Promise.all([
            Log.countDocuments({}),
            Log.countDocuments({ action: 'blocked' }),
            Log.countDocuments({ createdAt: { $gte: since24h } }),
            Log.countDocuments({ createdAt: { $gte: since24h }, action: 'blocked' }),
            Log.countDocuments({ createdAt: { $gte: todayStart } }),
            Log.countDocuments({ createdAt: { $gte: todayStart }, action: 'blocked' }),
            Log.countDocuments({ createdAt: { $gte: sinceWeek }, action: 'blocked' }),
            BlockIP.countDocuments({
                $or: [
                    { expiresAt: { $exists: false } },
                    { expiresAt: null },
                    { expiresAt: { $gt: new Date() } },
                ],
            }),
            Log.aggregate([
                { $match: { attackType: { $ne: 'none' } } },
                { $group: { _id: '$attackType', count: { $sum: 1 }, label: { $first: '$severity' } } },
                { $sort: { count: -1 } },
                { $limit: 5 },
            ]),
            Log.aggregate([
                { $group: { _id: null, avg: { $avg: '$responseTime' } } },
            ]),
        ]);

        const blockRate = last24hTotal > 0 ? ((last24hBlocked / last24hTotal) * 100).toFixed(1) : '0.0';
        const avgResponse = avgResponseRaw[0]?.avg ? avgResponseRaw[0].avg.toFixed(1) : '2.4';

        // Threat type → friendly label mapping
        const LABELS = {
            sqli: 'SQL Injection', xss: 'XSS', path: 'Path Traversal',
            cmd: 'Command Injection', xxe: 'XXE Injection', csrf: 'CSRF',
            rce: 'Remote Code Exec', ssrf: 'SSRF', lfi: 'LFI', cmdi: 'Cmd Injection',
        };

        return res.json({
            success: true,
            data: {
                requestsToday: todayTotal,
                attacksBlocked: last24hBlocked,
                totalBlocked,
                totalRequests,
                blockRate: parseFloat(blockRate),
                avgResponse: parseFloat(avgResponse),
                last24hTotal,
                last24hBlocked,
                weekBlocked,
                activeBlocks,
                topThreats: topThreats.map(t => ({
                    type: t._id,
                    label: LABELS[t._id] || t._id,
                    count: t.count,
                })),
            },
        });
    } catch (err) {
        console.error('[Metrics] getSummary error:', err.message);
        return res.status(500).json({ success: false, error: 'Failed to fetch summary' });
    }
}

// ─── GET /api/metrics/timeline ────────────────────────────────────────────────
async function getTimeline(req, res) {
    try {
        const hours = Math.min(168, Math.max(1, parseInt(req.query.hours) || 24));
        const since = new Date(Date.now() - hours * 60 * 60 * 1000);

        const timeline = await Log.aggregate([
            { $match: { createdAt: { $gte: since } } },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                        day: { $dayOfMonth: '$createdAt' },
                        hour: { $hour: '$createdAt' },
                    },
                    total: { $sum: 1 },
                    blocked: { $sum: { $cond: [{ $eq: ['$action', 'blocked'] }, 1, 0] } },
                },
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.hour': 1 } },
        ]);

        const formatted = timeline.map(t => ({
            time: new Date(t._id.year, t._id.month - 1, t._id.day, t._id.hour).toISOString(),
            hour: `${String(t._id.hour).padStart(2, '0')}:00`,
            total: t.total,
            blocked: t.blocked,
            clean: t.total - t.blocked,
        }));

        return res.json({ success: true, hours, data: formatted });
    } catch (err) {
        console.error('[Metrics] getTimeline error:', err.message);
        return res.status(500).json({ success: false, error: 'Failed to fetch timeline' });
    }
}

// ─── GET /api/metrics/breakdown ───────────────────────────────────────────────
async function getBreakdown(req, res) {
    try {
        const LABELS = {
            sqli: 'SQL Injection', xss: 'XSS', path: 'Path Traversal',
            cmd: 'Command Injection', xxe: 'XXE Injection', csrf: 'CSRF',
            rce: 'Remote Code Exec', ssrf: 'SSRF', lfi: 'LFI', cmdi: 'Cmd Injection',
        };

        const [byType, bySeverity, byAction] = await Promise.all([
            Log.aggregate([
                { $match: { attackType: { $ne: 'none' } } },
                { $group: { _id: '$attackType', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
            ]),
            Log.aggregate([
                { $match: { severity: { $ne: 'none' } } },
                { $group: { _id: '$severity', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
            ]),
            Log.aggregate([
                { $group: { _id: '$action', count: { $sum: 1 } } },
            ]),
        ]);

        return res.json({
            success: true,
            data: {
                byType: byType.map(t => ({ type: t._id, label: LABELS[t._id] || t._id, count: t.count })),
                bySeverity: bySeverity.map(s => ({ severity: s._id, count: s.count })),
                byAction: byAction.map(a => ({ action: a._id, count: a.count })),
            },
        });
    } catch (err) {
        console.error('[Metrics] getBreakdown error:', err.message);
        return res.status(500).json({ success: false, error: 'Failed to fetch breakdown' });
    }
}

// ─── GET /api/metrics/top-ips ─────────────────────────────────────────────────
async function getTopIPs(req, res) {
    try {
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));

        const topIPs = await Log.aggregate([
            { $match: { action: 'blocked' } },
            {
                $group: {
                    _id: '$ip',
                    count: { $sum: 1 },
                    lastSeen: { $max: '$createdAt' },
                    threatTypes: { $addToSet: '$attackType' },
                    blocked: { $sum: 1 },
                },
            },
            { $sort: { count: -1 } },
            { $limit: limit },
        ]);

        const ips = topIPs.map(t => t._id);
        const currentlyBlocked = await BlockIP.find({ ip: { $in: ips } }).lean();
        const blockedSet = new Set(currentlyBlocked.map(b => b.ip));

        const data = topIPs.map(t => ({
            ip: t._id,
            count: t.count,
            lastSeen: t.lastSeen,
            threatTypes: t.threatTypes.filter(x => x && x !== 'none'),
            blockedRequests: t.blocked,
            isCurrentlyBlocked: blockedSet.has(t._id),
            country: ipToCountry(t._id),
        }));

        return res.json({ success: true, data });
    } catch (err) {
        console.error('[Metrics] getTopIPs error:', err.message);
        return res.status(500).json({ success: false, error: 'Failed to fetch top IPs' });
    }
}

// ─── GET /api/metrics/attack-origins ─────────────────────────────────────────
async function getAttackOrigins(req, res) {
    try {
        const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const attacks = await Log.find(
            { action: 'blocked', createdAt: { $gte: since } },
            { ip: 1 }
        ).lean();

        // Count by country
        const counts = {};
        for (const log of attacks) {
            const country = ipToCountry(log.ip);
            counts[country] = (counts[country] || 0) + 1;
        }

        const origins = Object.entries(counts)
            .map(([country, count]) => ({ country, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        return res.json({ success: true, data: origins });
    } catch (err) {
        console.error('[Metrics] getAttackOrigins error:', err.message);
        return res.status(500).json({ success: false, error: 'Failed to fetch attack origins' });
    }
}

// ─── GET /api/metrics/live-feed ──────────────────────────────────────────────
async function getLiveFeed(req, res) {
    try {
        const logs = await Log.find({})
            .sort({ createdAt: -1 })
            .limit(20)
            .lean();

        const LABELS = {
            sqli: 'SQL Injection', xss: 'XSS', path: 'Path Traversal',
            cmd: 'Command Injection', xxe: 'XXE Injection', csrf: 'CSRF Attack',
            rce: 'Remote Code Exec', ssrf: 'SSRF', lfi: 'LFI', cmdi: 'Cmd Injection',
            none: '—',
        };

        const data = logs.map(l => ({
            id: l._id,
            time: l.createdAt,
            ip: l.ip,
            method: l.method,
            path: l.url || l.path,
            payload: l.payload ? l.payload.substring(0, 60) : '',
            attackType: l.attackType,
            label: LABELS[l.attackType] || l.attackType,
            severity: l.severity,
            action: l.action,
            country: ipToCountry(l.ip),
        }));

        return res.json({ success: true, data });
    } catch (err) {
        console.error('[Metrics] getLiveFeed error:', err.message);
        return res.status(500).json({ success: false, error: 'Failed to fetch live feed' });
    }
}

module.exports = { getSummary, getTimeline, getBreakdown, getTopIPs, getAttackOrigins, getLiveFeed };