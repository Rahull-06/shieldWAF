/**
 * config/rules.js — Default WAF Rule Definitions
 * ================================================
 * These are the built-in OWASP-based rules ShieldWAF ships with.
 * Rules can be toggled on/off via the admin API (stored in MongoDB).
 *
 * Each rule maps to a pattern key in detect.js and has:
 *  - ruleId    : unique identifier (used in logs + UI)
 *  - name      : human-readable name
 *  - category  : OWASP category tag
 *  - severity  : critical | high | medium | low
 *  - action    : block | log | challenge
 *  - enabled   : default state
 *  - description
 */

const DEFAULT_RULES = [
    {
        ruleId: 'OWASP-001',
        name: 'SQL Injection',
        category: 'Injection',
        severity: 'critical',
        action: 'block',
        enabled: true,
        patternKey: 'sqli',
        description:
            'Blocks SQL injection attempts including UNION SELECT, tautologies, ' +
            'time-based blind SQLi, and out-of-band techniques.',
    },
    {
        ruleId: 'OWASP-002',
        name: 'Cross-Site Scripting (XSS)',
        category: 'XSS',
        severity: 'high',
        action: 'block',
        enabled: true,
        patternKey: 'xss',
        description:
            'Detects script injection, event handlers, javascript: URIs, ' +
            'and dangerous HTML tags used in XSS attacks.',
    },
    {
        ruleId: 'OWASP-003',
        name: 'Command Injection',
        category: 'Injection',
        severity: 'critical',
        action: 'block',
        enabled: true,
        patternKey: 'cmdi',
        description:
            'Blocks OS command injection via shell metacharacters, subshell ' +
            'execution, and piping to common system binaries.',
    },
    {
        ruleId: 'OWASP-004',
        name: 'Path Traversal',
        category: 'Broken Access Control',
        severity: 'high',
        action: 'block',
        enabled: true,
        patternKey: 'traversal',
        description:
            'Prevents directory traversal attacks using ../ sequences ' +
            'and encoded variants targeting sensitive OS files.',
    },
    {
        ruleId: 'OWASP-005',
        name: 'Server-Side Request Forgery (SSRF)',
        category: 'SSRF',
        severity: 'high',
        action: 'block',
        enabled: true,
        patternKey: 'ssrf',
        description:
            'Blocks requests targeting internal network addresses, cloud ' +
            'metadata endpoints, and internal protocols.',
    },
    {
        ruleId: 'OWASP-006',
        name: 'Local/Remote File Inclusion',
        category: 'Injection',
        severity: 'critical',
        action: 'block',
        enabled: true,
        patternKey: 'lfi',
        description:
            'Detects PHP stream wrappers, file inclusion attempts, ' +
            'and remote file execution via URL parameters.',
    },
    {
        ruleId: 'OWASP-007',
        name: 'XML External Entity (XXE)',
        category: 'XXE',
        severity: 'critical',
        action: 'block',
        enabled: true,
        patternKey: 'xxe',
        description:
            'Blocks XML payloads containing external entity declarations ' +
            'that could expose files or trigger SSRF.',
    },
    {
        ruleId: 'OWASP-008',
        name: 'NoSQL Injection',
        category: 'Injection',
        severity: 'high',
        action: 'block',
        enabled: true,
        patternKey: 'nosqli',
        description:
            'Detects MongoDB operator injection attempts that bypass ' +
            'authentication or extract unauthorized data.',
    },
    {
        ruleId: 'OWASP-009',
        name: 'HTTP Header Injection',
        category: 'Injection',
        severity: 'medium',
        action: 'log',
        enabled: true,
        patternKey: 'headerInjection',
        description:
            'Identifies CRLF injection in headers that could lead to ' +
            'response splitting or cookie manipulation.',
    },
    {
        ruleId: 'OWASP-010',
        name: 'Malicious Bot / Scanner Detection',
        category: 'Reconnaissance',
        severity: 'medium',
        action: 'block',
        enabled: true,
        patternKey: 'badBot',
        description:
            'Blocks known attack tools like sqlmap, Nikto, DirBuster, ' +
            'Hydra, and Metasploit by User-Agent fingerprint.',
    },
];

module.exports = { DEFAULT_RULES };