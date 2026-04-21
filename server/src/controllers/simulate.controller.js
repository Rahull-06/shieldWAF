// PATH: server/src/controllers/simulate.controller.js
// Uses real Gemini AI analysis + saves result to MongoDB logs

const { analyzePayload } = require('../services/ai.service')
const Log = require('../models/Log')

const COUNTRY_MAP = {
    sqli:  { country: 'Russia',      flag: '🇷🇺' },
    xss:   { country: 'China',       flag: '🇨🇳' },
    path:  { country: 'Germany',     flag: '🇩🇪' },
    cmd:   { country: 'Netherlands', flag: '🇳🇱' },
    ssrf:  { country: 'Brazil',      flag: '🇧🇷' },
    xxe:   { country: 'Iran',        flag: '🇮🇷' },
    csrf:  { country: 'USA',         flag: '🇺🇸' },
    brute: { country: 'Romania',     flag: '🇷🇴' },
}

function randomIP() {
    return [
        Math.floor(Math.random() * 223) + 1,
        Math.floor(Math.random() * 255),
        Math.floor(Math.random() * 255),
        Math.floor(Math.random() * 255),
    ].join('.')
}

// POST /api/simulate
async function runSimulation(req, res) {
    try {
        const { type, endpoint, method = 'GET', payload } = req.body

        if (!payload || typeof payload !== 'string') {
            return res.status(400).json({ success: false, message: 'payload is required' })
        }

        const attackTypeMap = {
            sqli:  'SQL Injection',
            xss:   'XSS',
            path:  'Path Traversal',
            cmd:   'Command Injection',
            ssrf:  'SSRF',
            xxe:   'XXE',
            csrf:  'CSRF',
            brute: 'Brute Force',
        }

        const attackTypeHint = attackTypeMap[type] || null

        // Real AI analysis (Gemini → OpenAI → rule-based fallback)
        const analysis = await analyzePayload(payload, attackTypeHint, true)

        const geo = COUNTRY_MAP[type] || { country: 'Unknown', flag: '🌐' }
        const ip  = randomIP()

        // Save simulation as a real log entry in MongoDB
        try {
            await Log.create({
                ip,
                method,
                url: endpoint || '/api/simulate',
                attackType: analysis.attackType,
                payload: payload.slice(0, 200),
                action: analysis.detected ? 'Blocked' : 'Allowed',
                severity: analysis.severity || 'Medium',
                riskScore: analysis.riskScore,
                country: geo.country,
                countryFlag: geo.flag,
                userAgent: 'ShieldWAF/Simulator',
                source: 'simulator',
                timestamp: new Date(),
            })
        } catch (dbErr) {
            // Log save failure is non-fatal — still return analysis
            console.warn('[simulate] DB log failed:', dbErr.message)
        }

        res.json({
            success: true,
            data: {
                ...analysis,
                ip,
                method,
                endpoint: endpoint || '/api/simulate',
                country: geo.country,
                flag: geo.flag,
                timestamp: new Date().toISOString(),
                poweredBy: process.env.GEMINI_API_KEY ? 'Gemini AI' : process.env.OPENAI_API_KEY ? 'OpenAI' : 'Rule Engine',
            },
        })
    } catch (err) {
        console.error('[simulate]', err)
        res.status(500).json({ success: false, message: 'Simulation failed: ' + err.message })
    }
}

module.exports = { runSimulation }