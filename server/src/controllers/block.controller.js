/**
 * controllers/block.controller.js — IP Block Management
 * =======================================================
 * CRUD for the IP blocklist. Works with the BlockIP model.
 *
 * Endpoints:
 *   GET    /api/block          — list all blocked IPs
 *   POST   /api/block          — block an IP
 *   DELETE /api/block/:ip      — unblock an IP
 *   GET    /api/block/check/:ip — check if an IP is blocked
 */

const BlockIP = require('../models/BlockIP');
const { emitBlock } = require('../services/socket');

// ─── GET /api/block ───────────────────────────────────────────────────────────
async function getBlockedIPs(req, res) {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, parseInt(req.query.limit) || 20);
        const skip = (page - 1) * limit;

        // Only return active blocks (not yet expired)
        const filter = {
            $or: [
                { expiresAt: { $exists: false } },
                { expiresAt: null },
                { expiresAt: { $gt: new Date() } },
            ],
        };

        const [blocked, total] = await Promise.all([
            BlockIP.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            BlockIP.countDocuments(filter),
        ]);

        return res.json({
            success: true,
            data: blocked,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (err) {
        console.error('[Block] getBlockedIPs error:', err.message);
        return res.status(500).json({ success: false, error: 'Failed to fetch blocked IPs' });
    }
}

// ─── POST /api/block ──────────────────────────────────────────────────────────
/**
 * Block an IP address.
 * Body: { ip, reason, expiresAt? }
 *   ip        — IPv4 or IPv6 address
 *   reason    — why this IP is being blocked
 *   expiresAt — optional ISO date; omit for permanent block
 */
async function blockIP(req, res) {
    try {
        const { ip, reason, expiresAt } = req.body;

        if (!ip) {
            return res.status(400).json({ success: false, error: 'IP address is required' });
        }

        // Basic IP format validation
        const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$|^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;
        if (!ipRegex.test(ip)) {
            return res.status(400).json({ success: false, error: 'Invalid IP address format' });
        }

        // Upsert — if IP already blocked, update reason/expiry
        const block = await BlockIP.findOneAndUpdate(
            { ip },
            {
                ip,
                reason: reason || 'Manually blocked via dashboard',
                expiresAt: expiresAt ? new Date(expiresAt) : null,
                blockedBy: req.user?.id || 'system',
                updatedAt: new Date(),
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // Emit real-time event to dashboard
        emitBlock({ ip, reason: block.reason, expiresAt: block.expiresAt });

        return res.status(201).json({
            success: true,
            message: `IP ${ip} has been blocked`,
            data: block,
        });
    } catch (err) {
        console.error('[Block] blockIP error:', err.message);
        return res.status(500).json({ success: false, error: 'Failed to block IP' });
    }
}

// ─── DELETE /api/block/:ip ────────────────────────────────────────────────────
async function unblockIP(req, res) {
    try {
        const { ip } = req.params;

        const result = await BlockIP.findOneAndDelete({ ip });
        if (!result) {
            return res.status(404).json({ success: false, error: `IP ${ip} is not in the blocklist` });
        }

        return res.json({
            success: true,
            message: `IP ${ip} has been unblocked`,
        });
    } catch (err) {
        console.error('[Block] unblockIP error:', err.message);
        return res.status(500).json({ success: false, error: 'Failed to unblock IP' });
    }
}

// ─── GET /api/block/check/:ip ─────────────────────────────────────────────────
async function checkIP(req, res) {
    try {
        const { ip } = req.params;

        const block = await BlockIP.findOne({
            ip,
            $or: [
                { expiresAt: { $exists: false } },
                { expiresAt: null },
                { expiresAt: { $gt: new Date() } },
            ],
        }).lean();

        return res.json({
            success: true,
            ip,
            blocked: !!block,
            data: block || null,
        });
    } catch (err) {
        console.error('[Block] checkIP error:', err.message);
        return res.status(500).json({ success: false, error: 'Failed to check IP' });
    }
}

module.exports = { getBlockedIPs, blockIP, unblockIP, checkIP };