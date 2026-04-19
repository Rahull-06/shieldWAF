/**
 * app.js — Express Application
 * =============================
 * Sets up all middleware, routes, and error handlers.
 * WAF middleware is registered FIRST so it intercepts all requests.
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// ─── Import Middleware ─────────────────────────────────────────────────────────
const { wafMiddleware } = require('./middleware/waf');
const { apiLimiter } = require('./middleware/rateLimit');

// ─── Import Routes ─────────────────────────────────────────────────────────────
const authRoutes     = require('./routes/auth.routes');
const wafRoutes      = require('./routes/waf.routes');
const logsRoutes     = require('./routes/logs.routes');
const blockRoutes    = require('./routes/block.routes');
const metricsRoutes  = require('./routes/metrics.routes');
const rulesRoutes    = require('./routes/rules.routes');
const simulateRoutes = require('./routes/simulate.routes');

const app = express();

// ─── Security Headers ─────────────────────────────────────────────────────────
app.use(
    helmet({
        crossOriginEmbedderPolicy: false,
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", 'data:', 'https:'],
            },
        },
    })
);

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',');
app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error(`CORS blocked: ${origin}`));
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
);

// ─── Request Parsing ──────────────────────────────────────────────────────────
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// ─── Request Logging (dev only) ───────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

// ──────────────────────────────────────────────────────────────────────────────
// 🛡️  WAF MIDDLEWARE — Must be registered BEFORE all routes
// ──────────────────────────────────────────────────────────────────────────────
app.use(wafMiddleware);

// ─── Rate Limiting ────────────────────────────────────────────────────────────
app.use(apiLimiter);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'ShieldWAF server is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
    });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/waf',      wafRoutes);
app.use('/api/logs',     logsRoutes);
app.use('/api/block',    blockRoutes);
app.use('/api/metrics',  metricsRoutes);
app.use('/api/rules',    rulesRoutes);
app.use('/api/simulate', simulateRoutes);

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: `Route ${req.method} ${req.originalUrl} not found`,
    });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    console.error('[Server Error]', err.stack || err.message);

    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map((e) => e.message);
        return res.status(400).json({ success: false, error: messages.join(', ') });
    }
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ success: false, error: 'Invalid token' });
    }
    if (err.message?.startsWith('CORS blocked')) {
        return res.status(403).json({ success: false, error: err.message });
    }

    res.status(err.status || 500).json({
        success: false,
        error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    });
});

module.exports = app;