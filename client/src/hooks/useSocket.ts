// PATH: client/src/hooks/useSocket.ts
// Connects to Socket.IO if token exists, otherwise uses mock feed
'use client'
import { useState, useEffect } from 'react'

export interface FeedEntry {
    id: string; timestamp: string; ip: string
    method: string; payload: string; action: 'blocked' | 'allowed' | 'warning'
}

const MOCK_IPS = ['109.169.23.11', '185.220.4.17', '172.16.0.45', '45.155.205.4', '91.198.174.2', '103.21.244.0']
const MOCK_ENTRIES = [
    { payload: "1' OR '1'='1", action: 'blocked' as const },
    { payload: '<img src=x onerror=alert(1)>', action: 'blocked' as const },
    { payload: '/api/search?q=hello', action: 'allowed' as const },
    { payload: '../../config/database.yml', action: 'blocked' as const },
    { payload: 'http://169.254.169.254/metadata', action: 'blocked' as const },
    { payload: "'; DROP TABLE users;--", action: 'blocked' as const },
]
const METHODS = ['POST', 'GET', 'PUT', 'DELETE']
const rand = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)]
const nowTs = () => { const n = new Date(); return `${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}:${String(n.getSeconds()).padStart(2, '0')}.${String(n.getMilliseconds()).padStart(3, '0')}` }
const mockRow = (): FeedEntry => { const e = rand(MOCK_ENTRIES); return { id: Math.random().toString(36).slice(2), timestamp: nowTs(), ip: rand(MOCK_IPS), method: rand(METHODS), payload: e.payload, action: e.action } }

export function useSocket() {
    const [feed, setFeed] = useState<FeedEntry[]>([])

    useEffect(() => {
        // Seed initial feed
        setFeed(Array.from({ length: 5 }, mockRow))

        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

        if (token) {
            // Try real Socket.IO connection
            import('socket.io-client').then(({ io }) => {
                const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
                    transports: ['websocket'],
                })
                socket.on('initial_feed', (data: FeedEntry[]) => setFeed(data))
                socket.on('new_attack', (entry: FeedEntry) => setFeed(p => [entry, ...p].slice(0, 20)))
                return () => { socket.disconnect() }
            }).catch(() => {
                // socket.io-client not available — fall back to mock
                const t = setInterval(() => setFeed(p => [mockRow(), ...p].slice(0, 20)), 3500)
                return () => clearInterval(t)
            })
        } else {
            // No token — use mock feed
            const t = setInterval(() => setFeed(p => [mockRow(), ...p].slice(0, 20)), 3500)
            return () => clearInterval(t)
        }
    }, [])

    return { feed }
}