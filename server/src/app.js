// PATH: server/src/app.js
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')

const authRoutes = require('./routes/auth.routes')
const logsRoutes = require('./routes/logs.routes')
const rulesRoutes = require('./routes/rules.routes')
const metricsRoutes = require('./routes/metrics.routes')
const simulateRoutes = require('./routes/simulate.routes')
const blockRoutes = require('./routes/block.routes')

const app = express()

// ── Security & Parsing ──────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }))
app.use(cors({
    origin: [
        process.env.CLIENT_URL || 'http://localhost:3000',
        'http://localhost:3001',
    ],
    credentials: true,
}))
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true }))

// ── Logging (dev only) ───────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'))
}

// ── Global rate limiter ─────────────────────────────────────────────────────
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Too many requests, please try again later.' },
})
app.use('/api', globalLimiter)

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes)
app.use('/api/logs', logsRoutes)
app.use('/api/rules', rulesRoutes)
app.use('/api/metrics', metricsRoutes)
app.use('/api/simulate', simulateRoutes)
app.use('/api/block', blockRoutes)

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
    res.json({
        success: true,
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime()) + 's',
    })
})

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({ success: false, error: 'Route not found' })
})

// ── Global error handler ─────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
    console.error('Unhandled error:', err)
    res.status(500).json({ success: false, error: 'Internal server error' })
})

module.exports = app