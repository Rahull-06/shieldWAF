// PATH: client/src/components/ThreatFeed.tsx
'use client'
import { useState, useEffect } from 'react'

interface FeedEntry {
    id: string
    ts: string
    ip: string
    method: string
    payload: string
    action: 'blocked' | 'allowed'
    color: string
}

const IPS = ['109.169.23.11','185.220.4.17','172.16.0.45','45.155.205.4','91.198.174.2','103.21.244.0','178.62.55.19']
const ENTRIES = [
    { payload: "1' OR '1'='1",             color: '#fca5a5', action: 'blocked' as const },
    { payload: '<img src=x onerror=alert(1)>', color: '#fdba74', action: 'blocked' as const },
    { payload: '/api/search?q=hello',       color: 'var(--text2)', action: 'allowed' as const },
    { payload: '../../config/database.yml', color: '#fca5a5', action: 'blocked' as const },
    { payload: 'http://169.254.169.254/metadata', color: '#fca5a5', action: 'blocked' as const },
    { payload: "'; DROP TABLE users;--",    color: '#fca5a5', action: 'blocked' as const },
]
const METHODS = ['POST', 'GET', 'PUT', 'DELETE']

const ts = () => {
    const n = new Date()
    return `${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}:${String(n.getSeconds()).padStart(2,'0')}`
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
        setFeed(Array.from({ length: 6 }, makeRow))
        setMounted(true)
        const t = setInterval(() => setFeed(p => [makeRow(), ...p].slice(0, 10)), 3500)
        return () => clearInterval(t)
    }, [])

    if (!mounted) {
        return (
            <div style={{
                height: 240,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <span style={{ color: 'var(--text3)', fontSize: 13 }}>Connecting…</span>
            </div>
        )
    }

    return (
        <>
            <style>{`
                /* ThreatFeed — lives inside .feed-panel, no wrapper card */
                .tf-wrap {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    overflow: hidden;
                }

                /* Column header row */
                .tf-head {
                    display: grid;
                    grid-template-columns: 70px 1fr 52px;
                    gap: 8px;
                    padding: 7px 18px;
                    background: var(--bg3);
                    border-bottom: 1px solid var(--border);
                    flex-shrink: 0;
                }

                /* Data rows */
                .tf-rows {
                    overflow-y: auto;
                    overflow-x: hidden;
                    flex: 1;
                    min-height: 0;
                    scrollbar-width: thin;
                    scrollbar-color: var(--border2) transparent;
                }
                .tf-rows::-webkit-scrollbar { width: 4px; }
                .tf-rows::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 4px; }
                .tf-rows::-webkit-scrollbar-track { background: transparent; }

                .tf-row {
                    display: grid;
                    grid-template-columns: 70px 1fr 52px;
                    gap: 8px;
                    padding: 8px 18px;
                    border-bottom: 1px solid rgba(26,37,53,0.5);
                    align-items: center;
                    transition: background 0.15s;
                    min-width: 0;
                }
                .tf-row:last-child { border-bottom: none; }
                .tf-row:hover { background: rgba(255,255,255,0.015); }
                .tf-new { animation: tf-slide 0.5s ease; }
                @keyframes tf-slide {
                    from { background: rgba(59,130,246,0.09); }
                    to   { background: transparent; }
                }

                .tf-col-hdr {
                    font-size: 9.5px;
                    color: var(--text3);
                    text-transform: uppercase;
                    letter-spacing: 0.8px;
                    font-weight: 500;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .tf-ts {
                    font-size: 10.5px;
                    color: var(--text3);
                    font-family: var(--font-mono, monospace);
                    white-space: nowrap;
                }
                .tf-payload {
                    font-size: 11px;
                    font-family: var(--font-mono, monospace);
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    min-width: 0;
                }
                .tf-badge {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 9px;
                    font-weight: 700;
                    letter-spacing: 0.6px;
                    padding: 3px 7px;
                    border-radius: 5px;
                    text-transform: uppercase;
                    white-space: nowrap;
                }
                .tf-badge-blocked {
                    background: rgba(239,68,68,0.12);
                    color: #ef4444;
                    border: 1px solid rgba(239,68,68,0.2);
                }
                .tf-badge-allowed {
                    background: rgba(16,185,129,0.1);
                    color: #10b981;
                    border: 1px solid rgba(16,185,129,0.18);
                }

                /* Responsive: smaller screens collapse columns */
                @media (max-width: 480px) {
                    .tf-head,
                    .tf-row {
                        grid-template-columns: 58px 1fr 48px;
                        gap: 6px;
                        padding: 7px 12px;
                    }
                    .tf-ts { font-size: 9.5px; }
                    .tf-payload { font-size: 10.5px; }
                }
                @media (max-width: 360px) {
                    .tf-head,
                    .tf-row {
                        grid-template-columns: 48px 1fr 44px;
                        gap: 5px;
                        padding: 6px 10px;
                    }
                }
            `}</style>

            <div className="tf-wrap">
                {/* Column headers */}
                <div className="tf-head">
                    <span className="tf-col-hdr">Time</span>
                    <span className="tf-col-hdr">Payload</span>
                    <span className="tf-col-hdr">Action</span>
                </div>

                {/* Scrollable rows */}
                <div className="tf-rows">
                    {feed.map((e, i) => (
                        <div key={e.id} className={`tf-row${i === 0 ? ' tf-new' : ''}`}>
                            <span className="tf-ts">{e.ts}</span>
                            <span className="tf-payload" style={{ color: e.color }} title={e.payload}>
                                {e.payload}
                            </span>
                            <span className={`tf-badge ${e.action === 'blocked' ? 'tf-badge-blocked' : 'tf-badge-allowed'}`}>
                                {e.action}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}