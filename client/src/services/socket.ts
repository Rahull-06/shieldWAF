// server/src/services/socket.js

const { Server } = require('socket.io');

let io = null;

/**
 * Initialize Socket.io with the HTTP server.
 * Call this in server.js AFTER creating the http server.
 */
function initSocket(httpServer, allowedOrigins = ['http://localhost:3000']) {
    io = new Server(httpServer, {
        cors: {
            origin: allowedOrigins,
            methods: ['GET', 'POST'],
            credentials: true,
        },
        pingInterval: 25000,
        pingTimeout : 60000,
    });

    io.on('connection', (socket) => {
        console.log(`[Socket.io] Client connected: ${socket.id}`);

        socket.emit('waf:connected', {
            message  : 'Connected to ShieldWAF live feed',
            timestamp: new Date().toISOString(),
        });

        socket.on('disconnect', (reason) => {
            console.log(`[Socket.io] Client disconnected: ${socket.id} (${reason})`);
        });

        socket.on('join:room', (room) => {
            socket.join(room);
            console.log(`[Socket.io] ${socket.id} joined room: ${room}`);
        });
    });

    // Heartbeat every 30s so dashboard knows server is alive
    setInterval(() => {
        if (io) {
            io.emit('waf:heartbeat', { timestamp: new Date().toISOString() });
        }
    }, 30000);

    console.log('[Socket.io] Live feed initialized');
    return io;
}

function getIO() {
    if (!io) {
        throw new Error('[Socket.io] Not initialized. Call initSocket() first.');
    }
    return io;
}

function emitThreat(payload) {
    try {
        if (io) {
            io.emit('waf:threat', {
                ...payload,
                timestamp: payload.timestamp || new Date().toISOString(),
            });
        }
    } catch (err) {
        console.error('[Socket.io] emitThreat failed:', err.message);
    }
}

function emitBlock(payload) {
    try {
        if (io) {
            io.emit('waf:blocked', {
                ...payload,
                timestamp: new Date().toISOString(),
            });
        }
    } catch (err) {
        console.error('[Socket.io] emitBlock failed:', err.message);
    }
}

// ── IMPORTANT: must use module.exports, not export default ───────────────────
module.exports = { initSocket, getIO, emitThreat, emitBlock };