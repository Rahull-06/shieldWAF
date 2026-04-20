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

const SEV_S: Record<Severity, React.CSSProperties> = {
    Critical: { background: 'var(--red-dim)', color: '#fca5a5' },
    High: { background: 'var(--amber-dim)', color: '#fdba74' },
    Medium: { background: '#2c2a0a', color: '#fde68a' },
    Low: { background: 'var(--green-dim)', color: '#4ade80' },
}
const ACT_S: Record<string, React.CSSProperties> = {
    Block: { background: 'var(--red-dim)', color: '#fca5a5' },
    Allow: { background: 'var(--green-dim)', color: '#4ade80' },
    Monitor: { background: 'var(--amber-dim)', color: '#fdba74' },
}
const badge: React.CSSProperties = { fontSize: 10, padding: '2px 6px', borderRadius: 3, fontWeight: 600, display: 'inline-block', whiteSpace: 'nowrap' }

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
    return (
        <label className="toggle-wrap">
            <input type="checkbox" checked={checked} onChange={onChange} />
            <span className="toggle-track" /><span className="toggle-thumb" />
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

    const enabled = rules.filter(r => r.enabled).length
    const disabled = rules.length - enabled

    return (
        <>
            <style>{`
        /* Top bar */
        .rules-topbar { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px; margin-bottom:14px; }
        .rules-filters { display:flex; gap:8px; flex-wrap:wrap; }

        /* Table wrapper with horizontal scroll on mobile */
        .rules-table-wrap { overflow-x:auto; -webkit-overflow-scrolling:touch; }
        .rules-table { min-width:720px; }
        .rules-hdr {
          display:grid; grid-template-columns:42px 1fr 100px 80px 60px 56px;
          gap:10px; padding:8px 16px;
          background:var(--bg3); border-bottom:1px solid var(--border);
        }
        .rules-row {
          display:grid; grid-template-columns:42px 1fr 100px 80px 60px 56px;
          gap:10px; padding:10px 16px; align-items:center;
          border-bottom:1px solid rgba(30,42,56,.8); transition:background .12s;
        }
        .rules-row:last-child { border-bottom:none; }
        .rules-row:hover { background:rgba(255,255,255,.015); }

        /* Modal */
        .modal-overlay { position:fixed; inset:0; z-index:50; background:rgba(0,0,0,.72); display:flex; align-items:center; justify-content:center; padding:16px; }
        .modal-box { background:var(--bg2); border:1px solid var(--border); border-radius:12px; padding:24px; width:100%; max-width:440px; animation:fadein .15s ease; }
        .form-label { font-size:10px; color:var(--text3); text-transform:uppercase; letter-spacing:.7px; font-weight:500; margin-bottom:6px; display:block; }
      `}</style>

            {/* Top bar */}
            <div className="rules-topbar">
                <div style={{ fontSize: 12.5, color: 'var(--text3)' }}>
                    <span style={{ color: 'var(--text2)', fontWeight: 500 }}>{enabled}</span> active rules
                    {disabled > 0 && <span style={{ marginLeft: 6, color: 'var(--text4)' }}>· {disabled} disabled</span>}
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <input className="inp" style={{ width: 190 }} placeholder="Search rules…" value={search} onChange={e => setSearch(e.target.value)} />
                    <select className="inp" value={sevFilter} onChange={e => setSevFilter(e.target.value)}>
                        <option value="">All Severities</option>
                        {['Critical', 'High', 'Medium', 'Low'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Rule</button>
                </div>
            </div>

            {/* Table */}
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                <div className="rules-table-wrap">
                    <div className="rules-table">
                        {/* Header */}
                        <div className="rules-hdr">
                            {['ID', 'Rule Name & Description', 'Category', 'Action', 'Hits', 'Status'].map(h => (
                                <span key={h} style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.7px', fontWeight: 500 }}>{h}</span>
                            ))}
                        </div>
                        {/* Rows */}
                        {filtered.length === 0 && (
                            <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>No rules match</div>
                        )}
                        {filtered.map(rule => (
                            <div key={rule.id} className="rules-row" style={{ opacity: rule.enabled ? 1 : 0.5 }}>
                                <span className="mono" style={{ fontSize: 11, color: 'var(--text3)' }}>#{rule.id}</span>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                        <span style={{ fontSize: 12.5, color: '#e2e8f0', fontWeight: 500 }}>{rule.name}</span>
                                        <span style={{ ...badge, ...SEV_S[rule.severity] }}>{rule.severity}</span>
                                    </div>
                                    <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{rule.description}</div>
                                </div>
                                <span style={{ fontSize: 11.5, color: 'var(--text2)' }}>{rule.category}</span>
                                <span style={{ ...badge, ...ACT_S[rule.action] }}>{rule.action}</span>
                                <span style={{ fontSize: 11.5, color: 'var(--text2)', textAlign: 'right' }}>{rule.hits.toLocaleString()}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Toggle checked={rule.enabled} onChange={() => toggle(rule.id)} />
                                    <button
                                        onClick={() => del(rule.id)}
                                        style={{ background: 'none', border: 'none', color: 'var(--text4)', cursor: 'pointer', fontSize: 13, lineHeight: 1, transition: 'color .12s', padding: 2 }}
                                        onMouseEnter={e => ((e.target as HTMLElement).style.color = 'var(--red)')}
                                        onMouseLeave={e => ((e.target as HTMLElement).style.color = 'var(--text4)')}
                                    >✕</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <span style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9' }}>Add WAF Rule</span>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>✕</button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            {[{ label: 'Rule Name', k: 'name', ph: 'e.g. SQL Injection Blocker' }, { label: 'Description', k: 'description', ph: 'What does this rule detect?' }, { label: 'Category', k: 'category', ph: 'e.g. Injection, XSS, Auth' }].map(f => (
                                <div key={f.k}>
                                    <span className="form-label">{f.label}</span>
                                    <input className="inp" style={{ width: '100%' }} placeholder={f.ph}
                                        value={(newRule as Record<string, string>)[f.k]}
                                        onChange={e => setNewRule(p => ({ ...p, [f.k]: e.target.value }))} />
                                </div>
                            ))}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div>
                                    <span className="form-label">Severity</span>
                                    <select className="inp" style={{ width: '100%' }} value={newRule.severity} onChange={e => setNewRule(p => ({ ...p, severity: e.target.value as Severity }))}>
                                        {['Critical', 'High', 'Medium', 'Low'].map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <span className="form-label">Action</span>
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
        </>
    )
}