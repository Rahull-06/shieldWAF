// ============================================================
//  controllers/simulate.controller.js
//
//  Test attack payloads against the WAF + AI engine.
//  Useful for B.Tech demo and manual QA.
// ============================================================

const { detectThreats }  = require('../utils/detect');
const { analyzeRequest } = require('../services/ai.service');
const Log                = require('../models/Log');

// ─── Built-in attack presets ──────────────────────────────────────────────────
const PRESETS = {
    sqli        : { method: 'POST', path: '/login',  body: { username: "' OR '1'='1' --", password: 'x' } },
    xss         : { method: 'POST', path: '/comment', body: { text: '<script>alert("xss")</script>' } },
    lfi         : { method: 'GET',  path: '/file?name=../../../../etc/passwd', body: {} },
    cmdi        : { method: 'POST', path: '/ping',   body: { host: '127.0.0.1; cat /etc/shadow' } },
    rce         : { method: 'POST', path: '/eval',   body: { code: 'require("child_process").exec("rm -rf /")' } },
    ssrf        : { method: 'GET',  path: '/fetch?url=http://169.254.169.254/latest/meta-data', body: {} },
    clean       : { method: 'GET',  path: '/api/products?page=1&limit=10', body: {} },
};

// ─── Single payload test ──────────────────────────────────────────────────────
exports.simulateSingle = async (req, res) => {
    try {
        const {
            method   = 'GET',
            path     = '/',
            body     = {},
            headers  = {},
            ip       = '127.0.0.1',
            useAI    = true,
        } = req.body;

        // Step 1 — Rule engine detection
        const detections = detectThreats({ method, path, body, headers });

        // Step 2 — AI scoring
        let aiResult = null;
        if (useAI) {
            aiResult = await analyzeRequest({ method, path, body, headers, ip, detections });
        }

        // Step 3 — Final verdict
        const blocked = detections.length > 0 || (aiResult && aiResult.recommendation === 'block');

        // Step 4 — Save to log
        await Log.create({
            ip,
            method,
            path,
            blocked,
            threats    : detections,
            aiScore    : aiResult?.threatScore    ?? null,
            aiConfidence: aiResult?.confidence    ?? null,
            aiProvider : aiResult?.provider       ?? null,
            severity   : aiResult?.severity       ?? (detections.length > 0 ? 'medium' : 'none'),
            source     : 'simulate',
        });

        return res.json({
            success : true,
            request : { method, path, ip },
            detections,
            ai      : aiResult,
            verdict : {
                blocked,
                reason: blocked
                    ? detections.length > 0
                        ? `Rule engine matched: ${detections.map(d => d.type).join(', ')}`
                        : `AI scored ${aiResult?.threatScore}/100 — recommendation: block`
                    : 'Request is clean',
            },
        });
    } catch (err) {
        console.error('[Simulate] Error:', err.message);
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ─── Preset test ─────────────────────────────────────────────────────────────
exports.simulatePreset = async (req, res) => {
    try {
        const { preset } = req.params;

        if (!PRESETS[preset]) {
            return res.status(400).json({
                success : false,
                message : `Unknown preset. Available: ${Object.keys(PRESETS).join(', ')}`,
            });
        }

        const { method, path, body } = PRESETS[preset];
        const ip         = req.ip || '127.0.0.1';
        const detections = detectThreats({ method, path, body, headers: {} });
        const aiResult   = await analyzeRequest({ method, path, body, headers: {}, ip, detections });
        const blocked    = detections.length > 0 || aiResult.recommendation === 'block';

        await Log.create({
            ip,
            method,
            path,
            blocked,
            threats     : detections,
            aiScore     : aiResult.threatScore,
            aiConfidence: aiResult.confidence,
            aiProvider  : aiResult.provider,
            severity    : aiResult.severity,
            source      : 'simulate-preset',
        });

        return res.json({
            success: true,
            preset,
            request: { method, path, body, ip },
            detections,
            ai     : aiResult,
            verdict: {
                blocked,
                reason: blocked
                    ? `${preset.toUpperCase()} attack detected — score ${aiResult.threatScore}/100`
                    : 'Request passed all checks',
            },
        });
    } catch (err) {
        console.error('[Simulate Preset] Error:', err.message);
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ─── Batch test (all presets at once) ────────────────────────────────────────
exports.simulateBatch = async (req, res) => {
    try {
        const results = [];

        for (const [name, payload] of Object.entries(PRESETS)) {
            const { method, path, body } = payload;
            const ip         = '127.0.0.1';
            const detections = detectThreats({ method, path, body, headers: {} });
            const aiResult   = await analyzeRequest({ method, path, body, headers: {}, ip, detections });
            const blocked    = detections.length > 0 || aiResult.recommendation === 'block';

            results.push({
                preset     : name,
                method,
                path,
                detections : detections.length,
                threatScore: aiResult.threatScore,
                confidence : aiResult.confidence,
                severity   : aiResult.severity,
                blocked,
            });
        }

        return res.json({ success: true, total: results.length, results });
    } catch (err) {
        console.error('[Simulate Batch] Error:', err.message);
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ─── List presets ─────────────────────────────────────────────────────────────
exports.getPresets = (req, res) => {
    return res.json({
        success : true,
        presets : Object.entries(PRESETS).map(([name, p]) => ({
            name,
            method: p.method,
            path  : p.path,
        })),
    });
};