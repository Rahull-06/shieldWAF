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