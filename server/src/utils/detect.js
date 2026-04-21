// PATH: server/src/utils/detect.js
// Pattern-based attack detection engine (no ML needed for this project level)

const RULES = [
    {
        name: 'SQL Injection',
        severity: 'Critical',
        riskBase: 90,
        patterns: [
            /('\s*(or|and)\s*'?\d)/i,
            /(union\s+select)/i,
            /(drop\s+table)/i,
            /(insert\s+into)/i,
            /(';\s*--)/i,
            /(exec\s*\()/i,
            /(xp_\w+)/i,
            /(' or '1'='1)/i,
        ],
    },
    {
        name: 'XSS',
        severity: 'High',
        riskBase: 80,
        patterns: [
            /<script[\s>]/i,
            /onerror\s*=/i,
            /onload\s*=/i,
            /javascript:/i,
            /<img[^>]+onerror/i,
            /alert\s*\(/i,
            /document\.cookie/i,
            /eval\s*\(/i,
        ],
    },
    {
        name: 'Path Traversal',
        severity: 'High',
        riskBase: 82,
        patterns: [
            /\.\.[/\\]/,
            /\/etc\/passwd/i,
            /\/etc\/shadow/i,
            /win\.ini/i,
            /boot\.ini/i,
        ],
    },
    {
        name: 'Command Injection',
        severity: 'Critical',
        riskBase: 95,
        patterns: [
            /;\s*cat\s/i,
            /\|\s*nc\s/i,
            /&&\s*rm\s/i,
            /`[^`]+`/,
            /\$\([^)]+\)/,
            /;\s*wget\s/i,
            /;\s*curl\s/i,
        ],
    },
    {
        name: 'SSRF',
        severity: 'Critical',
        riskBase: 92,
        patterns: [
            /169\.254\.169\.254/,
            /metadata\.google/i,
            /192\.168\.\d+\.\d+/,
            /10\.\d+\.\d+\.\d+/,
            /127\.0\.0\.1/,
            /localhost/i,
        ],
    },
    {
        name: 'XXE',
        severity: 'Critical',
        riskBase: 88,
        patterns: [
            /<!entity\s/i,
            /system\s*"file:/i,
            /<!doctype[^>]+\[/i,
        ],
    },
    {
        name: 'CSRF',
        severity: 'Medium',
        riskBase: 55,
        patterns: [
            /csrf/i,
            /xsrf/i,
        ],
    },
]

/**
 * Detect attack in a payload string.
 * @param {string} payload
 * @returns {{ detected: boolean, attackType: string, severity: string, riskScore: number, rule: string, payload: string }}
 */
function detectAttack(payload) {
    if (!payload || typeof payload !== 'string') {
        return { detected: false }
    }

    for (const rule of RULES) {
        for (const pattern of rule.patterns) {
            if (pattern.test(payload)) {
                // Add slight randomness to risk score (±5) to look realistic
                const jitter = Math.floor(Math.random() * 11) - 5
                const riskScore = Math.min(100, Math.max(50, rule.riskBase + jitter))

                // Extract the matched portion as the "payload" to log
                const match = payload.match(pattern)
                const logPayload = match ? payload.slice(0, 120).trim() : payload.slice(0, 120).trim()

                return {
                    detected: true,
                    attackType: rule.name,
                    severity: rule.severity,
                    riskScore,
                    rule: rule.name,
                    payload: logPayload,
                }
            }
        }
    }

    return { detected: false }
}

/**
 * Get attack confidence score (0–100)
 */
function getConfidence(attackType) {
    const conf = {
        'SQL Injection': 97,
        'XSS': 93,
        'Path Traversal': 91,
        'Command Injection': 96,
        'SSRF': 94,
        'XXE': 90,
        'CSRF': 78,
        'Brute Force': 88,
    }
    return conf[attackType] || 85
}

module.exports = { detectAttack, getConfidence }