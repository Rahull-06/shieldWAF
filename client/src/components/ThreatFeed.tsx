// PATH: client/src/components/ThreatFeed.tsx
'use client'
import { useState, useEffect } from 'react'

interface FeedEntry { id: string; ts: string; ip: string; method: string; payload: string; action: 'blocked' | 'allowed'; color: string }

const IPS = ['109.169.23.11', '185.220.4.17', '172.16.0.45', '45.155.205.4', '91.198.174.2', '103.21.244.0', '178.62.55.19']
const ENTRIES = [
    { payload: "1' OR '1'='1", color: '#fca5a5', action: 'blocked' as const },
    { payload: '<img src=x onerror=alert(1)>', color: '#fdba74', action: 'blocked' as const },
    { payload: '/api/search?q=hello', color: 'var(--text2)', action: 'allowed' as const },
    { payload: '../../config/database.yml', color: '#fca5a5', action: 'blocked' as const },
    { payload: 'http://169.254.169.254/metadata', color: '#fca5a5', action: 'blocked' as const },
    { payload: "'; DROP TABLE users;--", color: '#fca5a5', action: 'blocked' as const },
]
const METHODS = ['POST', 'GET', 'PUT', 'DELETE']

const ts = () => {
    const n = new Date()
    return `${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}:${String(n.getSeconds()).padStart(2, '0')}.${String(n.getMilliseconds()).padStart(3, '0')}`
}
const rand = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)]
const makeRow = (): FeedEntry => {
    const e = rand(ENTRIES)
    return { id: Math.random().toString(36).slice(2), ts: ts(), ip: rand(IPS), method: rand(METHODS), payload: e.payload, action: e.action, color: e.color }
}

export default function ThreatFeed() {
    const [mounted, setMounted] = useState(false)
    const [feed, setFeed] = useState<FeedEntry[]>([])

    useEffect(() => {
        // Generate initial feed on client only — fixes hydration mismatch
        setFeed(Array.from({ length: 5 }, makeRow))
        setMounted(true)

        const t = setInterval(() => setFeed(p => [makeRow(), ...p].slice(0, 8)), 3500)
        return () => clearInterval(t)
    }, [])

    if (!mounted) {
        return (
            <div className="feed-panel" style={{ minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: 'var(--text3)', fontSize: 13 }}>Connecting to feed…</span>
            </div>
        )
    }

    return (
        <>
            <style>{`
        .feed-panel { background:var(--bg2); border:1px solid var(--border); border-radius:10px; overflow:hidden; margin-bottom:14px; }
        .feed-header { padding:13px 16px; border-bottom:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; }
        .feed-cols { display:grid; grid-template-columns:110px 108px 44px 1fr 72px; gap:8px; padding:7px 14px; }
        @media(max-width:600px) {
          .feed-cols { grid-template-columns:90px 90px 1fr 60px; gap:6px; padding:7px 10px; }
          .feed-method { display:none; }
        }
        @media(max-width:400px) {
          .feed-cols { grid-template-columns:80px 1fr 54px; gap:5px; }
          .feed-ip { display:none; }
        }
        .feed-col-hdr { font-size:10px; color:var(--text3); text-transform:uppercase; letter-spacing:.7px; font-weight:500; }
        .feed-row-base { border-bottom:1px solid rgba(30,42,56,.7); transition:background .15s; }
        .feed-row-base:hover { background:rgba(255,255,255,.015); }
        .feed-row-base:last-child { border-bottom:none; }
        .feed-new-anim { animation:newrow .8s ease; }
        @keyframes newrow { from{background:rgba(26,108,255,.08)} to{background:transparent} }
      `}</style>

            <div className="feed-panel">
                <div className="feed-header">
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: '#cbd5e1' }}>Live Attack Feed</span>
                    <span style={{ fontSize: 11, color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span className="pulse-dot" />Streaming
                    </span>
                </div>

                <div className="feed-cols" style={{ background: 'var(--bg3)', borderBottom: '1px solid var(--border)' }}>
                    <span className="feed-col-hdr">Timestamp</span>
                    <span className="feed-col-hdr feed-ip">IP Address</span>
                    <span className="feed-col-hdr feed-method">Mthd</span>
                    <span className="feed-col-hdr">Payload Detected</span>
                    <span className="feed-col-hdr">Action</span>
                </div>

                {feed.map((e, i) => (
                    <div key={e.id} className={`feed-cols feed-row-base ${i === 0 ? 'feed-new-anim' : ''}`} style={{ fontSize: 11.5 }}>
                        <span className="mono" style={{ fontSize: 11, color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.ts}</span>
                        <span className="mono feed-ip" style={{ fontSize: 11, color: '#60a5fa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.ip}</span>
                        <span className="feed-method" style={{ color: 'var(--text2)' }}>{e.method}</span>
                        <span className="mono" style={{ fontSize: 11, color: e.color, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.payload}</span>
                        <span>
                            <span className={`badge ${e.action === 'blocked' ? 'b-blocked' : 'b-allowed'}`}>{e.action.toUpperCase()}</span>
                        </span>
                    </div>
                ))}
            </div>
        </>
    )
}