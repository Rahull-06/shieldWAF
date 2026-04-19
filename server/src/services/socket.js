// server/src/services/socket.js

'use strict';

const { Server } = require('socket.io');

let io = null;

function initSocket(httpServer, allowedOrigins) {
    if (!allowedOrigins) allowedOrigins = ['http://localhost:3000'];

    io = new Server(httpServer, {
        cors: {
            origin     : allowedOrigins,
            methods    : ['GET', 'POST'],
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
            console.log(`[Socket.io] Disconnected: ${socket.id} (${reason})`);
        });

        socket.on('join:room', (room) => {
            socket.join(room);
        });
    });

    setInterval(() => {
        if (io) io.emit('waf:heartbeat', { timestamp: new Date().toISOString() });
    }, 30000);

    console.log('[Socket.io] Live feed initialized');
    return io;
}

function getIO() {
    if (!io) throw new Error('[Socket.io] Not initialized. Call initSocket() first.');
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

module.exports = { initSocket, getIO, emitThreat, emitBlock };
