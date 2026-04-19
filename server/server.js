/**
 * server.js — Entry Point
 * ========================
 * Creates the HTTP server, attaches Socket.io,
 * connects to MongoDB, and starts listening.
 *
 * Architecture:
 *   server.js  →  app.js (Express)  →  routes  →  controllers
 *                     ↓
 *              socket.js (Socket.io live feed)
 */

require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const connectDB  = require('./src/config/db');
const { initSocket } = require('./src/services/socket');

const PORT = process.env.PORT || 5000;
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',');

// ─── Create HTTP server (required for Socket.io) ─────────────────────────────
const httpServer = http.createServer(app);

// ─── Initialize Socket.io live feed ──────────────────────────────────────────
const io = initSocket(httpServer, allowedOrigins);

// Make io accessible in controllers via req.app.get('io')
app.set('io', io);

// ─── Connect to MongoDB, then start listening ─────────────────────────────────
connectDB()
    .then(() => {
        httpServer.listen(PORT, () => {
            console.log('');
            console.log('  ╔══════════════════════════════════════╗');
            console.log(`  ║   🛡️  ShieldWAF Server Running        ║`);
            console.log(`  ║   Port    : ${PORT}                       ║`);
            console.log(`  ║   Env     : ${(process.env.NODE_ENV || 'development').padEnd(12)} ║`);
            console.log('  ╚══════════════════════════════════════╝');
            console.log('');
        });
    })
    .catch((err) => {
        console.error('[Server] Failed to connect to MongoDB:', err.message);
        process.exit(1);
    });

// ─── Graceful Shutdown ────────────────────────────────────────────────────────
process.on('SIGTERM', () => {
    console.log('[Server] SIGTERM received — shutting down gracefully');
    httpServer.close(() => {
        console.log('[Server] HTTP server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('\n[Server] SIGINT received — shutting down');
    httpServer.close(() => process.exit(0));
});