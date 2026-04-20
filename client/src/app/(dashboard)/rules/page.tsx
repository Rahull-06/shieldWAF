// PATH: client/src/app/(dashboard)/rules/page.tsx
'use client'
import { useState } from 'react'
import type { WafRule, Severity } from '@/types'

const INITIAL_RULES: WafRule[] = [
    { id: '001', name: 'SQL Injection Blocker', description: 'Detects UNION, OR 1=1, DROP TABLE patterns', category: 'Injection', action: 'Block', severity: 'Critical', hits: 4821, enabled: true },
    { id: '002', name: 'XSS Filter', description: 'Sanitises <script>, on* handlers, data: URIs', category: 'XSS', action: 'Block', severity: 'High', hits: 3240, enabled: true },
    { id: '003', name: 'Path Traversal Guard', description: 'Blocks ../ and /etc/passwd sequences', category: 'LFI/RFI', action: 'Block', severity: 'High', hits: 2180, enabled: true },
    { id: '004', name: 'Command Injection Shield', description: 'Detects shell meta-chars: ;, |, &&, backtick', category: 'Injection', action: 'Block', severity: 'Critical', hits: 1540, enabled: true },
    { id: '005', name: 'Brute Force Rate Limiter', description: 'Limits >10 auth attempts/min per IP', category: 'Auth', action: 'Block', severity: 'Medium', hits: 980, enabled: true },
    { id: '006', name: 'SSRF Blocker', description: 'Blocks requests to 169.254.x, 10.x metadata', category: 'SSRF', action: 'Block', severity: 'Critical', hits: 620, enabled: true },
    { id: '007', name: 'XXE Injection Prevention', description: 'Strips ENTITY declarations from XML bodies', category: 'XXE', action: 'Block', severity: 'High', hits: 412, enabled: true },
    { id: '008', name: 'CSRF Token Validator', description: 'Enforces SameSite cookies + CSRF token', category: 'CSRF', action: 'Monitor', severity: 'Medium', hits: 286, enabled: false },
]

const SEV_STYLE: Record<Severity, React.CSSProperties> = {
    Critical: { background: 'var(--red-dim)', color: '#fca5a5' },
    High: { background: 'var(--amber-dim)', color: '#fdba74' },
    Medium: { background: '#2c2a0a', color: '#fde68a' },
    Low: { background: 'var(--green-dim)', color: '#4ade80' },
}
const ACT_STYLE: Record<string, React.CSSProperties> = {
    Block: { background: 'var(--red-dim)', color: '#fca5a5' },
    Allow: { background: 'var(--green-dim)', color: '#4ade80' },
    Monitor: { background: 'var(--amber-dim)', color: '#fdba74' },
}

const badge: React.CSSProperties = { fontSize: 10, padding: '2px 6px', borderRadius: 3, fontWeight: 600, display: 'inline-block' }

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
    return (
        <label className="toggle-wrap">
            <input type="checkbox" checked={checked} onChange={onChange} />
            <span className="toggle-track" />
            <span className="toggle-thumb" />
        </label>
    )
}

export default function RulesPage() {
    const [rules, setRules] = useState(INITIAL_RULES)
    const [search, setSearch] = useState('')
    const [sevFilter, setSevFilter] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [newRule, setNewRule] = useState({ name: '', description: '', category: '', severity: 'High' as Severity, action: 'Block' as WafRule['action'] })

    const filtered = rules.filter(r => {
        if (search && !r.name.toLowerCase().includes(search.toLowerCase()) && !r.description.toLowerCase().includes(search.toLowerCase())) return false
        if (sevFilter && r.severity !== sevFilter) return false
        return true
    })

    const toggle = (id: string) => setRules(p => p.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r))
    const del = (id: string) => setRules(p => p.filter(r => r.id !== id))
    const addRule = () => {
        if (!newRule.name.trim()) return
        setRules(p => [{ ...newRule, id: String(Date.now()).slice(-4), hits: 0, enabled: true }, ...p])
        setNewRule({ name: '', description: '', category: '', severity: 'High', action: 'Block' })
        setShowModal(false)
    }

    const enabledCount = rules.filter(r => r.enabled).length
    const disabledCount = rules.length - enabledCount

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Top bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ fontSize: 12.5, color: 'var(--text3)' }}>
                    <span style={{ color: 'var(--text2)', fontWeight: 500 }}>{enabledCount}</span> active rules
                    {disabledCount > 0 && <span style={{ marginLeft: 6, color: 'var(--text4)' }}>· {disabledCount} disabled</span>}
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <input
                        className="inp"
                        style={{ width: 200 }}
                        placeholder="Search rules…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    <select className="inp" value={sevFilter} onChange={e => setSevFilter(e.target.value)}>
                        <option value="">All Severities</option>
                        {['Critical', 'High', 'Medium', 'Low'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Rule</button>
                </div>
            </div>

            {/* Table */}
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>

                {/* Header row */}
                <div style={{
                    display: 'grid', gridTemplateColumns: '42px 1fr 100px 80px 64px 56px',
                    gap: 10, padding: '8px 16px',
                    background: 'var(--bg3)', borderBottom: '1px solid var(--border)',
                }}>
                    {['ID', 'Rule Name & Description', 'Category', 'Action', 'Hits', 'Status'].map(h => (
                        <span key={h} style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.7px', fontWeight: 500 }}>{h}</span>
                    ))}
                </div>

                {/* Rows */}
                {filtered.length === 0 && (
                    <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>No rules match</div>
                )}
                {filtered.map((rule, i) => (
                    <div
                        key={rule.id}
                        style={{
                            display: 'grid', gridTemplateColumns: '42px 1fr 100px 80px 64px 56px',
                            gap: 10, padding: '10px 16px', alignItems: 'center',
                            borderBottom: i < filtered.length - 1 ? '1px solid rgba(30,42,56,.8)' : 'none',
                            opacity: rule.enabled ? 1 : 0.5, transition: 'all .12s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,.015)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                        <span className="mono" style={{ fontSize: 11, color: 'var(--text3)' }}>#{rule.id}</span>

                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                <span style={{ fontSize: 12.5, color: '#e2e8f0', fontWeight: 500 }}>{rule.name}</span>
                                <span style={{ ...badge, ...SEV_STYLE[rule.severity] }}>{rule.severity}</span>
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{rule.description}</div>
                        </div>

                        <span style={{ fontSize: 11.5, color: 'var(--text2)' }}>{rule.category}</span>

                        <span style={{ ...badge, ...ACT_STYLE[rule.action] }}>{rule.action}</span>

                        <span style={{ fontSize: 11.5, color: 'var(--text2)', textAlign: 'right' }}>{rule.hits.toLocaleString()}</span>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Toggle checked={rule.enabled} onChange={() => toggle(rule.id)} />
                            <button
                                onClick={() => del(rule.id)}
                                style={{ background: 'none', border: 'none', color: 'var(--text4)', cursor: 'pointer', fontSize: 13, lineHeight: 1, transition: 'color .12s' }}
                                onMouseEnter={e => ((e.target as HTMLElement).style.color = 'var(--red)')}
                                onMouseLeave={e => ((e.target as HTMLElement).style.color = 'var(--text4)')}
                                title="Delete"
                            >✕</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div
                    onClick={() => setShowModal(false)}
                    style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, width: '100%', maxWidth: 440, animation: 'fadein .18s ease' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <span style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9' }}>Add WAF Rule</span>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 16 }}>✕</button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            {[
                                { label: 'Rule Name', key: 'name', placeholder: 'e.g. SQL Injection Blocker' },
                                { label: 'Description', key: 'description', placeholder: 'What does this rule detect?' },
                                { label: 'Category', key: 'category', placeholder: 'e.g. Injection, XSS, Auth' },
                            ].map(f => (
                                <div key={f.key}>
                                    <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.7px', marginBottom: 6, fontWeight: 500 }}>{f.label}</div>
                                    <input
                                        className="inp"
                                        style={{ width: '100%' }}
                                        placeholder={f.placeholder}
                                        value={(newRule as Record<string, string>)[f.key]}
                                        onChange={e => setNewRule(p => ({ ...p, [f.key]: e.target.value }))}
                                    />
                                </div>
                            ))}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div>
                                    <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.7px', marginBottom: 6, fontWeight: 500 }}>Severity</div>
                                    <select className="inp" style={{ width: '100%' }} value={newRule.severity} onChange={e => setNewRule(p => ({ ...p, severity: e.target.value as Severity }))}>
                                        {['Critical', 'High', 'Medium', 'Low'].map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.7px', marginBottom: 6, fontWeight: 500 }}>Action</div>
                                    <select className="inp" style={{ width: '100%' }} value={newRule.action} onChange={e => setNewRule(p => ({ ...p, action: e.target.value as WafRule['action'] }))}>
                                        {['Block', 'Allow', 'Monitor'].map(a => <option key={a} value={a}>{a}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
                            <button className="btn" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                            <button className="btn btn-primary" style={{ flex: 1 }} onClick={addRule}>Add Rule</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}