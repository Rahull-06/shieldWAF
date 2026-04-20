// const DEFAULT_RULES = [
//     {
//         ruleId: 'OWASP-001',
//         name: 'SQL Injection',
//         category: 'Injection',
//         severity: 'critical',
//         action: 'block',
//         enabled: true,
//         patternKey: 'sqli',
//         description:
//             'Blocks SQL injection attempts including UNION SELECT, tautologies, ' +
//             'time-based blind SQLi, and out-of-band techniques.',
//     },
//     {
//         ruleId: 'OWASP-002',
//         name: 'Cross-Site Scripting (XSS)',
//         category: 'XSS',
//         severity: 'high',
//         action: 'block',
//         enabled: true,
//         patternKey: 'xss',
//         description:
//             'Detects script injection, event handlers, javascript: URIs, ' +
//             'and dangerous HTML tags used in XSS attacks.',
//     },
//     {
//         ruleId: 'OWASP-003',
//         name: 'Command Injection',
//         category: 'Injection',
//         severity: 'critical',
//         action: 'block',
//         enabled: true,
//         patternKey: 'cmdi',
//         description:
//             'Blocks OS command injection via shell metacharacters, subshell ' +
//             'execution, and piping to common system binaries.',
//     },
//     {
//         ruleId: 'OWASP-004',
//         name: 'Path Traversal',
//         category: 'Broken Access Control',
//         severity: 'high',
//         action: 'block',
//         enabled: true,
//         patternKey: 'traversal',
//         description:
//             'Prevents directory traversal attacks using ../ sequences ' +
//             'and encoded variants targeting sensitive OS files.',
//     },
//     {
//         ruleId: 'OWASP-005',
//         name: 'Server-Side Request Forgery (SSRF)',
//         category: 'SSRF',
//         severity: 'high',
//         action: 'block',
//         enabled: true,
//         patternKey: 'ssrf',
//         description:
//             'Blocks requests targeting internal network addresses, cloud ' +
//             'metadata endpoints, and internal protocols.',
//     },
//     {
//         ruleId: 'OWASP-006',
//         name: 'Local/Remote File Inclusion',
//         category: 'Injection',
//         severity: 'critical',
//         action: 'block',
//         enabled: true,
//         patternKey: 'lfi',
//         description:
//             'Detects PHP stream wrappers, file inclusion attempts, ' +
//             'and remote file execution via URL parameters.',
//     },
//     {
//         ruleId: 'OWASP-007',
//         name: 'XML External Entity (XXE)',
//         category: 'XXE',
//         severity: 'critical',
//         action: 'block',
//         enabled: true,
//         patternKey: 'xxe',
//         description:
//             'Blocks XML payloads containing external entity declarations ' +
//             'that could expose files or trigger SSRF.',
//     },
//     {
//         ruleId: 'OWASP-008',
//         name: 'NoSQL Injection',
//         category: 'Injection',
//         severity: 'high',
//         action: 'block',
//         enabled: true,
//         patternKey: 'nosqli',
//         description:
//             'Detects MongoDB operator injection attempts that bypass ' +
//             'authentication or extract unauthorized data.',
//     },
//     {
//         ruleId: 'OWASP-009',
//         name: 'HTTP Header Injection',
//         category: 'Injection',
//         severity: 'medium',
//         action: 'log',
//         enabled: true,
//         patternKey: 'headerInjection',
//         description:
//             'Identifies CRLF injection in headers that could lead to ' +
//             'response splitting or cookie manipulation.',
//     },
//     {
//         ruleId: 'OWASP-010',
//         name: 'Malicious Bot / Scanner Detection',
//         category: 'Reconnaissance',
//         severity: 'medium',
//         action: 'block',
//         enabled: true,
//         patternKey: 'badBot',
//         description:
//             'Blocks known attack tools like sqlmap, Nikto, DirBuster, ' +
//             'Hydra, and Metasploit by User-Agent fingerprint.',
//     },
// ];

// module.exports = { DEFAULT_RULES };





// PATH: server/src/config/rules.js
// Default WAF rules loaded into DB on first run via seed.js

const DEFAULT_RULES = [
    {
        ruleId: '001',
        name: 'SQL Injection Blocker',
        description: 'Detects UNION, OR 1=1, DROP TABLE patterns',
        category: 'Injection',
        action: 'Block',
        severity: 'Critical',
        patterns: ["'", '--', ';', 'union', 'select', 'drop', 'insert', 'delete', 'exec', 'xp_', '1=1', 'or 1'],
        hits: 4821,
        enabled: true,
    },
    {
        ruleId: '002',
        name: 'XSS Filter',
        description: 'Sanitises <script>, on* handlers, data: URIs',
        category: 'XSS',
        action: 'Block',
        severity: 'High',
        patterns: ['<script', 'onerror=', 'onload=', 'javascript:', '<img', 'alert(', 'document.cookie'],
        hits: 3240,
        enabled: true,
    },
    {
        ruleId: '003',
        name: 'Path Traversal Guard',
        description: 'Blocks ../ and /etc/passwd sequences',
        category: 'LFI/RFI',
        action: 'Block',
        severity: 'High',
        patterns: ['../', '..\\', '/etc/passwd', '/etc/shadow', 'win.ini', 'boot.ini'],
        hits: 2180,
        enabled: true,
    },
    {
        ruleId: '004',
        name: 'Command Injection Shield',
        description: 'Detects shell meta-chars: ;, |, &&, backtick',
        category: 'Injection',
        action: 'Block',
        severity: 'Critical',
        patterns: ['; cat', '| nc', '&& rm', '`id`', '$(', 'wget ', 'curl '],
        hits: 1540,
        enabled: true,
    },
    {
        ruleId: '005',
        name: 'Brute Force Rate Limiter',
        description: 'Limits >10 auth attempts/min per IP',
        category: 'Auth',
        action: 'Block',
        severity: 'Medium',
        patterns: [],
        hits: 980,
        enabled: true,
    },
    {
        ruleId: '006',
        name: 'SSRF Blocker',
        description: 'Blocks requests to 169.254.x, 10.x metadata',
        category: 'SSRF',
        action: 'Block',
        severity: 'Critical',
        patterns: ['169.254.169.254', 'metadata', '192.168.', '10.0.0.', 'localhost', '127.0.0.1'],
        hits: 620,
        enabled: true,
    },
    {
        ruleId: '007',
        name: 'XXE Injection Prevention',
        description: 'Strips ENTITY declarations from XML bodies',
        category: 'XXE',
        action: 'Block',
        severity: 'High',
        patterns: ['<!entity', 'system "', '<!doctype', 'SYSTEM "file'],
        hits: 412,
        enabled: true,
    },
    {
        ruleId: '008',
        name: 'CSRF Token Validator',
        description: 'Enforces SameSite cookies + CSRF token',
        category: 'CSRF',
        action: 'Monitor',
        severity: 'Medium',
        patterns: [],
        hits: 286,
        enabled: false,
    },
]

module.exports = { DEFAULT_RULES }