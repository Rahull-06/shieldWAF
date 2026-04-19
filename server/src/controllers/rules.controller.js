/**
 * controllers/rules.controller.js — WAF Rule CRUD
 */

const Rule = require('../models/Rule');

const DEFAULT_RULES = [
    { name: 'SQL Injection Detection', description: 'Detects UNION, DROP, SELECT patterns in user input fields', category: 'sqli', severity: 'critical', pattern: '(union|select|insert|drop|delete)', targets: ['body', 'query', 'url'], action: 'block', isActive: true },
    { name: 'XSS Script Tag Filter', description: 'Blocks <script>, onerror, javascript: injection patterns', category: 'xss', severity: 'high', pattern: '<script|onerror|javascript:', targets: ['body', 'query'], action: 'block', isActive: true },
    { name: 'Path Traversal Block', description: 'Blocks ../ sequences and /etc/passwd access attempts', category: 'path', severity: 'critical', pattern: '\\.\\./', targets: ['url', 'query'], action: 'block', isActive: true },
    { name: 'Rate Limit — Brute Force', description: 'Blocks IPs exceeding 100 req/min on /login endpoint', category: 'custom', severity: 'medium', pattern: 'rate_limit_login', targets: ['url'], action: 'flag', isActive: true },
    { name: 'XXE Entity Detection', description: 'Detects SYSTEM and PUBLIC XML entity declarations', category: 'xxe', severity: 'high', pattern: '<!ENTITY|SYSTEM\\s+["\']', targets: ['body'], action: 'block', isActive: true },
    { name: 'CSRF Token Validator', description: 'Validates CSRF tokens on state-changing HTTP requests', category: 'csrf', severity: 'medium', pattern: 'csrf_missing', targets: ['headers'], action: 'flag', isActive: false },
    { name: 'Command Injection Guard', description: 'Detects shell metacharacters and command separators', category: 'cmd', severity: 'critical', pattern: ';\\s*(cat|ls|wget|curl|bash|sh)', targets: ['body', 'query'], action: 'block', isActive: true },
    { name: 'Suspicious User-Agent', description: 'Flags and logs known scanner and bot user-agents', category: 'custom', severity: 'low', pattern: 'sqlmap|nikto|nmap|masscan|dirbuster', targets: ['headers'], action: 'log', isActive: true },
];

// GET /api/rules
exports.getRules = async (req, res) => {
    try {
        let rules = await Rule.find().sort({ createdAt: 1 });
        if (rules.length === 0) {
            rules = await Rule.insertMany(DEFAULT_RULES);
        }
        return res.json({ success: true, data: rules, count: rules.length });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
};

// GET /api/rules/:id
exports.getRuleById = async (req, res) => {
    try {
        const rule = await Rule.findById(req.params.id);
        if (!rule) return res.status(404).json({ success: false, error: 'Rule not found' });
        return res.json({ success: true, data: rule });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
};

// POST /api/rules
exports.createRule = async (req, res) => {
    try {
        const rule = await Rule.create(req.body);
        return res.status(201).json({ success: true, data: rule });
    } catch (err) {
        if (err.name === 'ValidationError') {
            const msgs = Object.values(err.errors).map(e => e.message);
            return res.status(400).json({ success: false, error: msgs.join(', ') });
        }
        return res.status(500).json({ success: false, error: err.message });
    }
};

// PUT /api/rules/:id
exports.updateRule = async (req, res) => {
    try {
        const allowed = ['name', 'description', 'severity', 'action', 'isActive', 'pattern', 'targets', 'category'];
        const updates = {};
        for (const f of allowed) {
            if (req.body[f] !== undefined) updates[f] = req.body[f];
        }
        const rule = await Rule.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
        if (!rule) return res.status(404).json({ success: false, error: 'Rule not found' });
        return res.json({ success: true, data: rule });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
};

// DELETE /api/rules/:id
exports.deleteRule = async (req, res) => {
    try {
        const rule = await Rule.findByIdAndDelete(req.params.id);
        if (!rule) return res.status(404).json({ success: false, error: 'Rule not found' });
        return res.json({ success: true, message: 'Rule deleted' });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
};

// POST /api/rules/reset
exports.resetRules = async (req, res) => {
    try {
        await Rule.deleteMany({});
        const rules = await Rule.insertMany(DEFAULT_RULES);
        return res.json({ success: true, data: rules, message: 'Rules reset to defaults' });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
};