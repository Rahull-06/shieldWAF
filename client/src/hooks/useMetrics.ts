// PATH: client/src/hooks/useMetrics.ts
'use client'
import { useState, useEffect } from 'react'
import type { TrafficPoint } from '@/components/Chart'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface MetricSummary {
    totalRequests:  number
    blockedAttacks: number
    activeThreats:  number
    activeRules:    number
    blockRate:      number
    uptime:         string
    last24hBlocked: number
    criticalCount:  number
    topThreat:      string
    aiInsight?:     string
}

export interface ThreatPoint {
    name:  string
    count: number
    pct:   number
    color: string
}

export interface GeoPoint {
    name:  string
    flag:  string
    count: number
    pct:   number
    color: string
}

// ─── Demo constants (shown when not logged in) ────────────────────────────────

const DEMO_SUMMARY: MetricSummary = {
    totalRequests:  2_400_000,
    blockedAttacks: 18_421,
    activeThreats:  3,
    activeRules:    42,
    blockRate:      7.6,
    uptime:         '99.98%',
    last24hBlocked: 1_240,
    criticalCount:  5,
    topThreat:      'SQL Injection',
}

const DEMO_TRAFFIC: TrafficPoint[] = [
    { hour: '00:00', requests: 120,  blocked: 8  },
    { hour: '02:00', requests: 85,   blocked: 3  },
    { hour: '04:00', requests: 60,   blocked: 1  },
    { hour: '06:00', requests: 140,  blocked: 12 },
    { hour: '08:00', requests: 320,  blocked: 28 },
    { hour: '10:00', requests: 480,  blocked: 41 },
    { hour: '12:00', requests: 510,  blocked: 55 },
    { hour: '14:00', requests: 430,  blocked: 38 },
    { hour: '16:00', requests: 390,  blocked: 33 },
    { hour: '18:00', requests: 350,  blocked: 27 },
    { hour: '20:00', requests: 280,  blocked: 19 },
    { hour: '22:00', requests: 190,  blocked: 14 },
]

const DEMO_THREATS: ThreatPoint[] = [
    { name: 'SQL Injection',   count: 4821, pct: 100, color: '#ef4444' },
    { name: 'XSS',             count: 3240, pct: 67,  color: '#f59e0b' },
    { name: 'Path Traversal',  count: 2180, pct: 45,  color: '#f59e0b' },
    { name: 'Cmd Injection',   count: 1540, pct: 32,  color: '#8b5cf6' },
    { name: 'Brute Force',     count: 980,  pct: 20,  color: '#06b6d4' },
    { name: 'SSRF',            count: 620,  pct: 13,  color: '#1a6cff' },
]

const DEMO_GEO: GeoPoint[] = [
    { name: 'Russia',  flag: '🇷🇺', count: 624, pct: 100, color: '#ef4444' },
    { name: 'China',   flag: '🇨🇳', count: 412, pct: 66,  color: '#ef4444' },
    { name: 'Brazil',  flag: '🇧🇷', count: 218, pct: 35,  color: '#f59e0b' },
    { name: 'India',   flag: '🇮🇳', count: 156, pct: 25,  color: '#f59e0b' },
    { name: 'USA',     flag: '🇺🇸', count: 98,  pct: 16,  color: '#60a5fa' },
    { name: 'Others',  flag: '🌐',  count: 546, pct: 88,  color: '#3d5570' },
]

// ─── Hook ─────────────────────────────────────────────────────────────────────

function getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('token')
}

export function useMetrics() {
    const [summary,  setSummary]  = useState<MetricSummary | null>(null)
    const [traffic,  setTraffic]  = useState<TrafficPoint[]>([])
    const [threats,  setThreats]  = useState<ThreatPoint[]>([])
    const [geo,      setGeo]      = useState<GeoPoint[]>([])
    const [loading,  setLoading]  = useState(true)
    const [isDemo,   setIsDemo]   = useState(true)

    useEffect(() => {
        const token = getToken()

        // No token → load demo data instantly, no API calls
        if (!token) {
            setSummary(DEMO_SUMMARY)
            setTraffic(DEMO_TRAFFIC)
            setThreats(DEMO_THREATS)
            setGeo(DEMO_GEO)
            setIsDemo(true)
            setLoading(false)
            return
        }

        // Token present → fetch real data from all 4 endpoints in parallel
        setLoading(true)

        const headers = { Authorization: `Bearer ${token}` }

        Promise.all([
            fetch(`${API}/metrics/summary`,  { headers }).then(r => r.json()),
            fetch(`${API}/metrics/traffic`,  { headers }).then(r => r.json()),
            fetch(`${API}/metrics/threats`,  { headers }).then(r => r.json()),
            fetch(`${API}/metrics/geo`,      { headers }).then(r => r.json()),
        ])
            .then(([sum, traf, thr, g]) => {
                // If any endpoint returns 401, fall back to demo
                if (sum.success === false || traf.success === false) {
                    localStorage.removeItem('token')
                    setSummary(DEMO_SUMMARY)
                    setTraffic(DEMO_TRAFFIC)
                    setThreats(DEMO_THREATS)
                    setGeo(DEMO_GEO)
                    setIsDemo(true)
                    return
                }

                // Unwrap backend shape: { success: true, data: ... }
                setSummary(sum.data  ?? sum)
                setTraffic(traf.data ?? traf)
                setThreats(thr.data  ?? thr)
                setGeo(g.data        ?? g)
                setIsDemo(false)
            })
            .catch(() => {
                // Network error → fall back to demo silently
                setSummary(DEMO_SUMMARY)
                setTraffic(DEMO_TRAFFIC)
                setThreats(DEMO_THREATS)
                setGeo(DEMO_GEO)
                setIsDemo(true)
            })
            .finally(() => setLoading(false))
    }, [])

    return { summary, traffic, threats, geo, loading, isDemo }
}