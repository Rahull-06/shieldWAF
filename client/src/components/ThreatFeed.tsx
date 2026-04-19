// // PATH: client/src/components/ThreatFeed.tsx
// 'use client'
// import { useSocket } from '@/hooks/useSocket'

// const ACTION_COLOR: Record<string, string> = {
//     blocked: 'badge-blocked',
//     allowed: 'badge-allowed',
//     warning: 'badge-warning',
// }

// const PAYLOAD_COLOR: Record<string, string> = {
//     blocked: '#f87171',   // red
//     allowed: '#4ade80',   // green
//     warning: '#fbbf24',   // amber
// }

// export default function ThreatFeed() {
//     const { feed } = useSocket()

//     return (
//         <div className="bg-bg2 border border-border1 rounded-xl overflow-hidden">

//             {/* Header */}
//             <div className="px-4 py-3 border-b border-border1 flex items-center justify-between">
//                 <span className="text-[12.5px] font-semibold text-slate-300">Live Attack Feed</span>
//                 <div className="flex items-center gap-1.5 text-[11px] text-green-400">
//                     <span className="pulse-dot" />
//                     Streaming
//                 </div>
//             </div>

//             {/* Column headers */}
//             <div className="grid grid-cols-[100px_1fr_50px_1fr_72px] gap-2 px-3.5 py-2 bg-bg3 border-b border-border1">
//                 {['Timestamp', 'IP Address', 'Mthd', 'Payload', 'Action'].map(h => (
//                     <span key={h} className="text-[10px] text-text3 uppercase tracking-[.7px] font-medium">
//                         {h}
//                     </span>
//                 ))}
//             </div>

//             {/* Rows */}
//             <div className="divide-y divide-border1/50 max-h-64 overflow-y-auto">
//                 {feed.length === 0 && (
//                     <div className="px-4 py-6 text-[12px] text-text3 text-center">
//                         Waiting for events…
//                     </div>
//                 )}
//                 {feed.slice(0, 8).map((entry, i) => (
//                     <div
//                         key={entry.id ?? i}
//                         className={`grid grid-cols-[100px_1fr_50px_1fr_72px] gap-2 px-3.5 py-2 items-center text-[11.5px] hover:bg-white/[.015] transition-colors ${i === 0 ? 'feed-new' : ''}`}
//                     >
//                         <span className="mono text-[11px] text-text3 truncate">
//                             {entry.timestamp}
//                         </span>
//                         <span className="mono text-[11px] text-blue truncate">
//                             {entry.ip}
//                         </span>
//                         <span className="text-text2">
//                             {entry.method}
//                         </span>
//                         <span
//                             className="mono text-[11px] truncate"
//                             style={{ color: PAYLOAD_COLOR[entry.action] ?? '#8899b0' }}
//                         >
//                             {entry.payload}
//                         </span>
//                         <span>
//                             <span className={ACTION_COLOR[entry.action] ?? 'badge-info'}>
//                                 {entry.action.toUpperCase()}
//                             </span>
//                         </span>
//                     </div>
//                 ))}
//             </div>

//         </div>
//     )
// }





// PATH: client/src/components/ThreatFeed.tsx
'use client'
import { useState, useEffect } from 'react'

interface FeedEntry {
    id: string; ts: string; ip: string; method: string; payload: string; action: 'blocked' | 'allowed'
}

const IPS = ['109.169.23.11', '185.220.4.17', '172.16.0.45', '45.155.205.4', '91.198.174.2', '103.21.244.0', '178.62.55.19']
const PAYLOADS: Array<{ text: string; color: string; action: FeedEntry['action'] }> = [
    { text: "1' OR '1'='1", color: '#fca5a5', action: 'blocked' },
    { text: '<img src=x onerror=alert(1)>', color: '#fdba74', action: 'blocked' },
    { text: '/api/search?q=hello', color: 'var(--text2)', action: 'allowed' },
    { text: '../../config/database.yml', color: '#fca5a5', action: 'blocked' },
    { text: 'http://169.254.169.254/metadata', color: '#fca5a5', action: 'blocked' },
    { text: "'; DROP TABLE users;--", color: '#fca5a5', action: 'blocked' },
]
const METHODS = ['POST', 'GET', 'PUT', 'DELETE']

function ts() {
    const n = new Date()
    return `${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}:${String(n.getSeconds()).padStart(2, '0')}.${String(n.getMilliseconds()).padStart(3, '0')}`
}
function rand<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }

function makeEntry(): FeedEntry & { color: string } {
    const p = rand(PAYLOADS)
    return { id: Math.random().toString(36).slice(2), ts: ts(), ip: rand(IPS), method: rand(METHODS), payload: p.text, action: p.action, color: p.color }
}

const SEED = Array.from({ length: 5 }, makeEntry)

export default function ThreatFeed() {
    const [feed, setFeed] = useState<Array<FeedEntry & { color: string }>>(SEED)

    useEffect(() => {
        const t = setInterval(() => setFeed(prev => [makeEntry(), ...prev].slice(0, 8)), 3500)
        return () => clearInterval(t)
    }, [])

    return (
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>

            {/* Header */}
            <div style={{ padding: '13px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: '#cbd5e1' }}>Live Attack Feed</span>
                <span style={{ fontSize: 11, color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span className="pulse-dot" />
                    Streaming
                </span>
            </div>

            {/* Col headers */}
            <div style={{
                display: 'grid', gridTemplateColumns: '110px 108px 44px 1fr 72px', gap: 8,
                alignItems: 'center', padding: '7px 14px',
                background: 'var(--bg3)', borderBottom: '1px solid var(--border)',
            }}>
                {['Timestamp', 'IP Address', 'Mthd', 'Payload Detected', 'Action'].map(h => (
                    <span key={h} style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.7px', fontWeight: 500 }}>{h}</span>
                ))}
            </div>

            {/* Rows */}
            <div>
                {feed.map((e, i) => (
                    <div
                        key={e.id}
                        className={i === 0 ? 'feed-new' : ''}
                        style={{
                            display: 'grid', gridTemplateColumns: '110px 108px 44px 1fr 72px', gap: 8,
                            alignItems: 'center', padding: '7px 14px',
                            borderBottom: '1px solid rgba(30,42,56,.7)', fontSize: 11.5,
                        }}
                    >
                        <span className="mono" style={{ fontSize: 11, color: 'var(--text3)' }}>{e.ts}</span>
                        <span className="mono" style={{ fontSize: 11, color: '#60a5fa' }}>{e.ip}</span>
                        <span style={{ color: 'var(--text2)' }}>{e.method}</span>
                        <span className="mono" style={{ fontSize: 11, color: e.color, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.payload}</span>
                        <span>
                            <span className={`badge ${e.action === 'blocked' ? 'b-blocked' : 'b-allowed'}`}>
                                {e.action.toUpperCase()}
                            </span>
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}