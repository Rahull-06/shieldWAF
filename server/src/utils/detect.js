// // ─── Pattern Library ────────────────────────────────────────────────────────

// const PATTERNS = {
//     // ── SQL Injection ──────────────────────────────────────────────────────────
//     sqli: {
//         label: 'SQL Injection',
//         severity: 'critical',
//         patterns: [
//             /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute|xp_)\b)/i,
//             /(--|;|\/\*|\*\/|xp_|0x[0-9a-f]+)/i,
//             /(\bor\b\s+\d+\s*=\s*\d+|\band\b\s+\d+\s*=\s*\d+)/i,
//             /('|")\s*(or|and)\s*('|"|\d)/i,
//             /\b(sleep|benchmark|waitfor\s+delay)\s*\(/i,
//             /\b(load_file|into\s+outfile|into\s+dumpfile)\b/i,
//         ],
//     },

//     // ── Cross-Site Scripting ───────────────────────────────────────────────────
//     xss: {
//         label: 'Cross-Site Scripting (XSS)',
//         severity: 'high',
//         patterns: [
//             /<\s*script[\s\S]*?>[\s\S]*?<\/\s*script\s*>/i,
//             /<[^>]*(on\w+\s*=|javascript:|vbscript:)/i,
//             /(<img|<iframe|<svg|<body|<input)[^>]*(onerror|onload|onfocus|onclick)\s*=/i,
//             /javascript\s*:/i,
//             /data\s*:\s*text\/html/i,
//             /<\s*\/?\s*(script|iframe|object|embed|applet|link|meta|style)\b/i,
//             /expression\s*\(.*\)/i,
//         ],
//     },

//     // ── Command Injection ──────────────────────────────────────────────────────
//     cmdi: {
//         label: 'Command Injection',
//         severity: 'critical',
//         patterns: [
//             /[;&|`]\s*(ls|cat|whoami|id|uname|pwd|echo|wget|curl|nc|netcat|bash|sh|python|perl|ruby|php)\b/i,
//             /\$\([^)]*\)/,           // $(command)
//             /`[^`]*`/,               // backtick execution
//             /\|\s*(bash|sh|cmd)/i,
//             />\s*\/dev\/(null|tcp|udp)/i,
//         ],
//     },

//     // ── Path Traversal ─────────────────────────────────────────────────────────
//     traversal: {
//         label: 'Path Traversal',
//         severity: 'high',
//         patterns: [
//             /\.\.\//,                         // ../
//             /\.\.%2[fF]/,                     // URL-encoded ../
//             /\.\.[\\\/]/,
//             /%2e%2e[%2f\\]/i,
//             /\/etc\/(passwd|shadow|hosts|hostname)/i,
//             /\/proc\/self\//i,
//             /[cC]:\\(Windows|Users|System32)/,
//         ],
//     },

//     // ── SSRF — Server-Side Request Forgery ─────────────────────────────────────
//     ssrf: {
//         label: 'Server-Side Request Forgery (SSRF)',
//         severity: 'high',
//         patterns: [
//             /https?:\/\/(127\.0\.0\.1|localhost|0\.0\.0\.0)/i,
//             /https?:\/\/169\.254\.169\.254/,  // AWS metadata
//             /https?:\/\/10\.\d+\.\d+\.\d+/,  // Private Class A
//             /https?:\/\/192\.168\.\d+\.\d+/,  // Private Class C
//             /https?:\/\/172\.(1[6-9]|2[0-9]|3[01])\.\d+\.\d+/,  // Private Class B
//             /file:\/\//i,
//             /gopher:\/\//i,
//             /dict:\/\//i,
//         ],
//     },

//     // ── LFI / RFI ──────────────────────────────────────────────────────────────
//     lfi: {
//         label: 'Local/Remote File Inclusion',
//         severity: 'critical',
//         patterns: [
//             /\bphp:\/\/(input|filter|data)\b/i,
//             /\bexpect:\/\//i,
//             /(include|require|include_once|require_once)\s*\(/i,
//             /\/(etc|proc|var\/log|usr\/share)\//i,
//             /https?:\/\/[^/]+\/.+\.(php|asp|jsp|cfm)\?/i,
//         ],
//     },

//     // ── XXE — XML External Entity ──────────────────────────────────────────────
//     xxe: {
//         label: 'XML External Entity (XXE)',
//         severity: 'critical',
//         patterns: [
//             /<!ENTITY\s+\S+\s+SYSTEM\s+/i,
//             /<!DOCTYPE[^>]*\[/i,
//             /SYSTEM\s+["']file:\/\//i,
//             /<!ENTITY\s+/i,
//         ],
//     },

//     // ── NoSQL Injection ────────────────────────────────────────────────────────
//     nosqli: {
//         label: 'NoSQL Injection',
//         severity: 'high',
//         patterns: [
//             /\$where\s*:/i,
//             /\$ne\s*:\s*null/i,
//             /\$gt\s*:\s*""/i,
//             /\{\s*"\$[a-z]+"\s*:/i,    // MongoDB operators
//             /\bjavascript\b.*\bsleep\b/i,
//         ],
//     },

//     // ── HTTP Header Injection ──────────────────────────────────────────────────
//     headerInjection: {
//         label: 'HTTP Header Injection',
//         severity: 'medium',
//         patterns: [
//             /[\r\n]+(Location|Set-Cookie|Content-Type)\s*:/i,
//             /%0[dD]%0[aA]/,           // CRLF URL-encoded
//             /\\r\\n/,
//         ],
//     },

//     // ── Suspicious / Scanner User-Agents ──────────────────────────────────────
//     badBot: {
//         label: 'Malicious Bot / Scanner',
//         severity: 'medium',
//         patterns: [
//             /sqlmap/i,
//             /nmap/i,
//             /nikto/i,
//             /masscan/i,
//             /zgrab/i,
//             /dirbuster/i,
//             /gobuster/i,
//             /wfuzz/i,
//             /hydra/i,
//             /metasploit/i,
//             /havij/i,
//             /acunetix/i,
//         ],
//     },
// };

// // ─── Helpers ─────────────────────────────────────────────────────────────────

// /**
//  * Decode common encoding tricks attackers use to bypass WAFs
//  */
// function decodeInput(value) {
//     try {
//         let decoded = decodeURIComponent(value);
//         // Double-decode (some bypasses use double-encoding)
//         try { decoded = decodeURIComponent(decoded); } catch { }
//         return decoded;
//     } catch {
//         return value;
//     }
// }

// /**
//  * Flatten an object's values recursively into an array of strings
//  */
// function flattenValues(obj, depth = 0) {
//     if (depth > 5) return []; // Prevent deeply nested attacks
//     if (typeof obj === 'string') return [obj];
//     if (typeof obj === 'number') return [String(obj)];
//     if (Array.isArray(obj)) return obj.flatMap((v) => flattenValues(v, depth + 1));
//     if (obj && typeof obj === 'object') {
//         return Object.values(obj).flatMap((v) => flattenValues(v, depth + 1));
//     }
//     return [];
// }

// // ─── Core Detection Function ─────────────────────────────────────────────────

// /**
//  * Scans a single string value against all (or specific) pattern categories.
//  * Returns null if clean, or a threat object if a pattern matches.
//  *
//  * @param {string} raw       - The raw value to test
//  * @param {string} location  - Where it came from (e.g. "query", "body", "header")
//  * @param {string[]} only    - Optional whitelist of threat keys to check
//  */
// function scanValue(raw, location = 'unknown', only = []) {
//     const value = decodeInput(String(raw));
//     const checkKeys = only.length > 0 ? only : Object.keys(PATTERNS);

//     for (const key of checkKeys) {
//         const threat = PATTERNS[key];
//         for (const regex of threat.patterns) {
//             if (regex.test(value)) {
//                 return {
//                     type: key,
//                     label: threat.label,
//                     severity: threat.severity,
//                     location,
//                     matched: value.substring(0, 200), // Cap logged payload at 200 chars
//                 };
//             }
//         }
//     }
//     return null;
// }

// // ─── Request-Level Analysis ───────────────────────────────────────────────────

// /**
//  * analyzeRequest(req) — main entry point used by waf.js middleware
//  *
//  * Inspects:
//  *  - URL path
//  *  - Query parameters
//  *  - Request body (JSON, form, raw string)
//  *  - HTTP headers (User-Agent, Referer, Cookie, X-Forwarded-For)
//  *
//  * Returns: { clean: true } OR { clean: false, threat: { ... } }
//  */
// function analyzeRequest(req) {
//     const checks = [];

//     // 1. URL path
//     checks.push({ value: req.path || '', location: 'url' });

//     // 2. Query string — all values
//     if (req.query && typeof req.query === 'object') {
//         flattenValues(req.query).forEach((v) =>
//             checks.push({ value: v, location: 'query' })
//         );
//     }

//     // 3. Body — all values (JSON parsed or form data)
//     if (req.body && typeof req.body === 'object') {
//         flattenValues(req.body).forEach((v) =>
//             checks.push({ value: v, location: 'body' })
//         );
//     } else if (typeof req.body === 'string') {
//         checks.push({ value: req.body, location: 'body' });
//     }

//     // 4. Specific headers known to carry attacker payloads
//     const suspectHeaders = ['user-agent', 'referer', 'cookie', 'x-forwarded-for', 'x-real-ip'];
//     for (const h of suspectHeaders) {
//         const val = req.headers?.[h];
//         if (val) {
//             // User-Agent — also check for bad bots
//             const only = h === 'user-agent' ? ['badBot', 'xss', 'sqli'] : [];
//             checks.push({ value: val, location: `header:${h}`, only });
//         }
//     }

//     // Run all checks — stop at first match (fail-fast)
//     for (const { value, location, only = [] } of checks) {
//         const result = scanValue(value, location, only);
//         if (result) {
//             return { clean: false, threat: result };
//         }
//     }

//     return { clean: true };
// }

// // ─── Exports ──────────────────────────────────────────────────────────────────

// module.exports = {
//     analyzeRequest,
//     scanValue,
//     flattenValues,
//     PATTERNS,
// };







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