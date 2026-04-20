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