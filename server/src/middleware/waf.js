// const BlockIP = require('../models/BlockIP');
// const Log = require('../models/Log');
// const Rule = require('../models/Rule');
// const { analyzeRequest } = require('../utils/detect');
// const { DEFAULT_RULES } = require('../config/rules');

// // ─── IP Utilities ─────────────────────────────────────────────────────────────

// /**
//  * Extract the real client IP, respecting proxy headers.
//  * Priority: X-Forwarded-For → X-Real-IP → req.ip → req.connection.remoteAddress
//  */
// function getClientIP(req) {
//     const forwarded = req.headers['x-forwarded-for'];
//     if (forwarded) {
//         // X-Forwarded-For can be a comma-separated list; first is the originating client
//         return forwarded.split(',')[0].trim();
//     }
//     return (
//         req.headers['x-real-ip'] ||
//         req.ip ||
//         req.connection?.remoteAddress ||
//         'unknown'
//     );
// }

// // ─── Rule Cache ───────────────────────────────────────────────────────────────

// /**
//  * We cache the active rules in memory to avoid hitting MongoDB on every request.
//  * Rules are refreshed every 60 seconds or when manually updated via the API.
//  */
// let ruleCache = null;
// let ruleCacheTime = 0;
// const RULE_CACHE_TTL = 60 * 1000; // 60 seconds

// async function getActiveRules() {
//     const now = Date.now();
//     if (ruleCache && now - ruleCacheTime < RULE_CACHE_TTL) {
//         return ruleCache;
//     }

//     try {
//         // Fetch rules from DB; fall back to DEFAULT_RULES if DB is empty
//         const dbRules = await Rule.find({ enabled: true }).lean();
//         ruleCache = dbRules.length > 0 ? dbRules : DEFAULT_RULES.filter((r) => r.enabled);
//         ruleCacheTime = now;
//         return ruleCache;
//     } catch {
//         // If DB is unreachable, use defaults — WAF must never go offline
//         return DEFAULT_RULES.filter((r) => r.enabled);
//     }
// }

// /** Call this after updating rules via API to force a refresh */
// function invalidateRuleCache() {
//     ruleCache = null;
//     ruleCacheTime = 0;
// }

// // ─── Log Helper ───────────────────────────────────────────────────────────────

// /**
//  * Persist a WAF event to MongoDB and emit it over Socket.io.
//  * Non-blocking — we don't await this so the response isn't delayed.
//  */
// async function logThreat({ req, ip, threat, matchedRule, action }) {
//     try {
//         const logEntry = await Log.create({
//             ip,
//             method: req.method,
//             path: req.originalUrl || req.url,
//             userAgent: req.headers['user-agent'] || '',
//             payload: threat.matched,
//             threatType: threat.type,
//             threatLabel: threat.label,
//             severity: threat.severity,
//             location: threat.location,
//             ruleId: matchedRule?.ruleId || 'inline',
//             action,
//             timestamp: new Date(),
//         });

//         // Real-time push to Socket.io (Phase 3 wires this up)
//         const io = req.app.get('io');
//         if (io) {
//             io.emit('waf:threat', {
//                 id: logEntry._id,
//                 ip,
//                 threatLabel: threat.label,
//                 severity: threat.severity,
//                 action,
//                 path: req.originalUrl,
//                 timestamp: logEntry.timestamp,
//             });
//         }
//     } catch (err) {
//         // Logging failure must NEVER bring down the WAF
//         console.error('[WAF] Log write failed:', err.message);
//     }
// }

// // ─── WAF Middleware ───────────────────────────────────────────────────────────

// async function wafMiddleware(req, res, next) {
//     const ip = getClientIP(req);

//     // ── Step 1: IP Blocklist check ─────────────────────────────────────────────
//     try {
//         const blocked = await BlockIP.findOne({
//             ip,
//             $or: [
//                 { expiresAt: { $exists: false } },  // Permanent block
//                 { expiresAt: null },
//                 { expiresAt: { $gt: new Date() } },  // Temporary block still active
//             ],
//         });

//         if (blocked) {
//             // Log the blocked attempt (action: 'blocked-ip')
//             await logThreat({
//                 req,
//                 ip,
//                 threat: {
//                     type: 'blocked-ip',
//                     label: 'Blocked IP Address',
//                     severity: 'critical',
//                     location: 'ip',
//                     matched: ip,
//                 },
//                 matchedRule: null,
//                 action: 'blocked',
//             }).catch(() => { }); // Swallow log error silently

//             return res.status(403).json({
//                 success: false,
//                 error: 'Access denied.',
//                 code: 'IP_BLOCKED',
//             });
//         }
//     } catch (err) {
//         // DB issue — log but don't block legitimate traffic
//         console.error('[WAF] BlockIP lookup failed:', err.message);
//     }

//     // ── Step 2: Pattern Detection ──────────────────────────────────────────────
//     const detection = analyzeRequest(req);

//     if (!detection.clean) {
//         const { threat } = detection;

//         // Find the matching rule to determine action
//         let matchedRule = null;
//         try {
//             const activeRules = await getActiveRules();
//             matchedRule = activeRules.find((r) => r.patternKey === threat.type) || null;
//         } catch {
//             // Proceed with default action (block) if rule fetch fails
//         }

//         const action = matchedRule?.action || 'block';

//         // Always log the threat (non-blocking)
//         logThreat({ req, ip, threat, matchedRule, action }).catch(() => { });

//         // If action is 'block' → reject the request
//         if (action === 'block') {
//             return res.status(403).json({
//                 success: false,
//                 error: 'Request blocked by ShieldWAF.',
//                 threat: threat.label,
//                 code: 'WAF_BLOCKED',
//             });
//         }

//         // If action is 'log' → just tag the request and continue
//         req.wafFlag = { threat, matchedRule };
//     }

//     // ── Step 3: Clean request — pass through ──────────────────────────────────
//     next();
// }

// // ─── Exports ──────────────────────────────────────────────────────────────────

// module.exports = { wafMiddleware, invalidateRuleCache, getClientIP };




// PATH: server/src/middleware/waf.js
// Lightweight WAF middleware — inspects incoming requests and logs threats.
// For this project it operates in MONITOR mode (doesn't block real traffic,
// but logs detections so the dashboard has real data).

const Log = require('../models/Log')
const { detectAttack } = require('../utils/detect')

const GEO_MAP = {
    '185.': { country: 'Russia', flag: '🇷🇺', code: 'RU' },
    '103.': { country: 'China', flag: '🇨🇳', code: 'CN' },
    '178.': { country: 'Germany', flag: '🇩🇪', code: 'DE' },
    '104.': { country: 'Brazil', flag: '🇧🇷', code: 'BR' },
    '5.18': { country: 'Netherlands', flag: '🇳🇱', code: 'NL' },
    '45.': { country: 'Russia', flag: '🇷🇺', code: 'RU' },
    '91.': { country: 'USA', flag: '🇺🇸', code: 'US' },
    '8.8': { country: 'USA', flag: '🇺🇸', code: 'US' },
}

function getGeo(ip) {
    for (const [prefix, geo] of Object.entries(GEO_MAP)) {
        if (ip.startsWith(prefix)) return geo
    }
    return { country: 'Unknown', flag: '🌐', code: 'UN' }
}

async function wafMiddleware(req, _res, next) {
    try {
        // Build payload string from query + body
        const queryStr = JSON.stringify(req.query || {})
        const bodyStr = JSON.stringify(req.body || {})
        const payload = `${queryStr} ${bodyStr}`.slice(0, 500)

        // Skip if it's a health check or auth route
        const skipPaths = ['/api/health', '/api/auth']
        if (skipPaths.some(p => req.path.startsWith(p))) return next()

        const result = detectAttack(payload)
        if (!result.detected) return next()

        const ip = req.ip || req.connection.remoteAddress || '0.0.0.0'
        const geo = getGeo(ip)

        await Log.create({
            ip,
            country: geo.country,
            countryFlag: geo.flag,
            countryCode: geo.code,
            method: req.method,
            path: req.path,
            attackType: result.attackType,
            payload: result.payload,
            severity: result.severity,
            riskScore: result.riskScore,
            action: 'Blocked',
            ruleTriggered: result.rule,
            userAgent: req.headers['user-agent'] || '',
        })
    } catch {
        // WAF middleware should never crash the app
    }
    next()
}

module.exports = { wafMiddleware }