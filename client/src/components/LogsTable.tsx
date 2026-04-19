// // PATH: client/src/components/LogsTable.tsx
// 'use client'
// import type { LogEntry } from '@/types'

// interface Props { logs: LogEntry[] }

// const SEV_STYLES: Record<string, string> = {
//     Critical: 'bg-red-500/10     text-red-400     border border-red-500/20',
//     High: 'bg-amber-500/10   text-amber-400   border border-amber-500/20',
//     Medium: 'bg-blue-500/10    text-blue-400    border border-blue-500/20',
//     Low: 'bg-green-500/10   text-green-400   border border-green-500/20',
// }

// const ACT_STYLES: Record<string, string> = {
//     Blocked: 'bg-red-500/10   text-red-400   border border-red-500/20',
//     Allowed: 'bg-green-500/10 text-green-400 border border-green-500/20',
//     Warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
// }

// const METHOD_STYLES: Record<string, string> = {
//     GET: 'text-blue-400',
//     POST: 'text-green-400',
//     PUT: 'text-amber-400',
//     DELETE: 'text-red-400',
//     PATCH: 'text-purple-400',
// }

// const RISK_COLOR = (score: number) => {
//     if (score >= 80) return '#ef4444'
//     if (score >= 50) return '#f59e0b'
//     return '#22c55e'
// }

// export default function LogsTable({ logs }: Props) {
//     if (logs.length === 0) {
//         return (
//             <div className="flex flex-col items-center justify-center py-16 text-center">
//                 <div className="text-3xl mb-3 opacity-30">🔍</div>
//                 <div className="text-[13px] font-medium text-text2">No logs match your filters</div>
//                 <div className="text-[11.5px] text-text3 mt-1">Try adjusting or clearing your search criteria</div>
//             </div>
//         )
//     }

//     return (
//         <div className="overflow-x-auto">
//             <table className="w-full min-w-[900px]">
//                 <thead>
//                     <tr className="border-b border-border1 bg-bg3">
//                         {['Timestamp', 'IP Address', 'Country', 'Method', 'Attack Type', 'Payload', 'Severity', 'Risk', 'Action'].map(h => (
//                             <th
//                                 key={h}
//                                 className="px-4 py-2.5 text-left text-[10.5px] font-semibold text-text3 uppercase tracking-[0.7px] whitespace-nowrap"
//                             >
//                                 {h}
//                             </th>
//                         ))}
//                     </tr>
//                 </thead>
//                 <tbody className="divide-y divide-border1/60">
//                     {logs.map(log => (
//                         <tr
//                             key={log.id}
//                             className="hover:bg-white/[.018] transition-colors group"
//                         >
//                             {/* Timestamp */}
//                             <td className="px-4 py-3 whitespace-nowrap">
//                                 <span className="font-mono text-[11px] text-text3">{log.timestamp}</span>
//                             </td>

//                             {/* IP */}
//                             <td className="px-4 py-3 whitespace-nowrap">
//                                 <span className="font-mono text-[12px] text-blue font-medium">{log.ip}</span>
//                             </td>

//                             {/* Country — flag THEN name, no code */}
//                             <td className="px-4 py-3 whitespace-nowrap">
//                                 <div className="flex items-center gap-1.5">
//                                     <span className="text-base leading-none">{log.countryFlag}</span>
//                                     <span className="text-[12px] text-text2">{log.country}</span>
//                                 </div>
//                             </td>

//                             {/* Method */}
//                             <td className="px-4 py-3 whitespace-nowrap">
//                                 <span className={`font-mono text-[11.5px] font-bold ${METHOD_STYLES[log.method] ?? 'text-text2'}`}>
//                                     {log.method}
//                                 </span>
//                             </td>

//                             {/* Attack type */}
//                             <td className="px-4 py-3 whitespace-nowrap">
//                                 <span className="text-[12px] text-text2 font-medium">{log.attackType}</span>
//                             </td>

//                             {/* Payload */}
//                             <td className="px-4 py-3 max-w-[220px]">
//                                 <span
//                                     className="font-mono text-[11px] text-text2/80 truncate block"
//                                     title={log.payload}
//                                 >
//                                     {log.payload}
//                                 </span>
//                             </td>

//                             {/* Severity badge */}
//                             <td className="px-4 py-3 whitespace-nowrap">
//                                 <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-semibold uppercase tracking-wide ${SEV_STYLES[log.severity] ?? ''}`}>
//                                     {log.severity}
//                                 </span>
//                             </td>

//                             {/* Risk score bar */}
//                             <td className="px-4 py-3 whitespace-nowrap">
//                                 <div className="flex items-center gap-2">
//                                     <div className="w-14 h-[3px] bg-border1 rounded-full overflow-hidden flex-shrink-0">
//                                         <div
//                                             className="h-full rounded-full"
//                                             style={{ width: `${log.riskScore}%`, background: RISK_COLOR(log.riskScore) }}
//                                         />
//                                     </div>
//                                     <span
//                                         className="text-[11px] font-semibold tabular-nums w-5"
//                                         style={{ color: RISK_COLOR(log.riskScore) }}
//                                     >
//                                         {log.riskScore}
//                                     </span>
//                                 </div>
//                             </td>

//                             {/* Action badge */}
//                             <td className="px-4 py-3 whitespace-nowrap">
//                                 <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-semibold uppercase tracking-wide ${ACT_STYLES[log.action] ?? ''}`}>
//                                     {log.action}
//                                 </span>
//                             </td>
//                         </tr>
//                     ))}
//                 </tbody>
//             </table>
//         </div>
//     )
// }






// PATH: client/src/components/LogsTable.tsx
'use client'
import type { LogEntry } from '@/types'

const SEV_CLS: Record<string, string> = {
    Critical: 'sev sev-critical',
    High: 'sev sev-high',
    Medium: 'sev sev-medium',
    Low: 'sev sev-low',
}
const ACT_CLS: Record<string, string> = {
    Blocked: 'badge b-blocked',
    Allowed: 'badge b-allowed',
    Warning: 'badge b-warning',
}
const METHOD_COLOR: Record<string, string> = {
    GET: '#60a5fa', POST: '#4ade80', PUT: '#fbbf24', DELETE: '#f87171', PATCH: '#a78bfa',
}
const RISK_COLOR = (s: number) => s >= 80 ? 'var(--red)' : s >= 50 ? 'var(--amber)' : 'var(--green)'

export default function LogsTable({ logs }: { logs: LogEntry[] }) {
    if (!logs.length) return (
        <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>
            No entries match your filters
        </div>
    )

    return (
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
            <thead>
                <tr>
                    {['Timestamp', 'IP Address', 'Country', 'Method', 'Attack Type', 'Payload', 'Severity', 'Risk Score', 'Action'].map(h => (
                        <th key={h} style={{
                            textAlign: 'left', padding: '8px 12px',
                            fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase',
                            letterSpacing: '.7px', fontWeight: 500,
                            background: 'var(--bg3)', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap',
                        }}>{h}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {logs.map((l, i) => (
                    <tr
                        key={l.id}
                        style={{ borderBottom: i < logs.length - 1 ? '1px solid rgba(30,42,56,.8)' : 'none' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,.015)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                        <td className="mono" style={{ padding: '9px 12px', fontSize: 11, color: 'var(--text3)', whiteSpace: 'nowrap' }}>{l.timestamp}</td>
                        <td className="mono" style={{ padding: '9px 12px', fontSize: 11.5, color: '#60a5fa', whiteSpace: 'nowrap' }}>{l.ip}</td>
                        <td style={{ padding: '9px 12px', fontSize: 12, color: 'var(--text2)', whiteSpace: 'nowrap' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                <span>{l.countryFlag}</span>
                                <span>{l.country}</span>
                            </span>
                        </td>
                        <td style={{ padding: '9px 12px', fontSize: 12, fontWeight: 600, color: METHOD_COLOR[l.method] ?? 'var(--text2)', whiteSpace: 'nowrap' }}>{l.method}</td>
                        <td style={{ padding: '9px 12px', fontSize: 12, color: 'var(--text2)', whiteSpace: 'nowrap' }}>{l.attackType}</td>
                        <td className="mono" style={{ padding: '9px 12px', fontSize: 11, color: 'var(--text2)', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={l.payload}>{l.payload}</td>
                        <td style={{ padding: '9px 12px', whiteSpace: 'nowrap' }}><span className={SEV_CLS[l.severity]}>{l.severity}</span></td>
                        <td style={{ padding: '9px 12px', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                <div style={{ width: 48, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden', flexShrink: 0 }}>
                                    <div style={{ height: '100%', width: `${l.riskScore}%`, background: RISK_COLOR(l.riskScore), borderRadius: 2 }} />
                                </div>
                                <span style={{ fontSize: 11, fontWeight: 600, color: RISK_COLOR(l.riskScore), minWidth: 20 }}>{l.riskScore}</span>
                            </div>
                        </td>
                        <td style={{ padding: '9px 12px', whiteSpace: 'nowrap' }}><span className={ACT_CLS[l.action]}>{l.action}</span></td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}