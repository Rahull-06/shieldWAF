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

const SEV_CLASS: Record<Severity, string> = {
    Critical: 'sev-critical',
    High: 'sev-high',
    Medium: 'sev-medium',
    Low: 'sev-low',
}

const ACTION_COLOR: Record<string, string> = {
    Block: 'badge-blocked',
    Allow: 'badge-allowed',
    Monitor: 'badge-warning',
}

export default function RulesPage() {
    const [rules, setRules] = useState(INITIAL_RULES)
    const [search, setSearch] = useState('')
    const [sevFilter, setSevFilter] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [newRule, setNewRule] = useState({ name: '', description: '', category: '', severity: 'High' as Severity, action: 'Block' as WafRule['action'] })

    const filtered = rules.filter(r => {
        if (search && !r.name.toLowerCase().includes(search.toLowerCase()) &&
            !r.description.toLowerCase().includes(search.toLowerCase())) return false
        if (sevFilter && r.severity !== sevFilter) return false
        return true
    })

    const toggle = (id: string) => {
        setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r))
    }

    const deleteRule = (id: string) => {
        setRules(prev => prev.filter(r => r.id !== id))
    }

    const addRule = () => {
        if (!newRule.name.trim()) return
        const rule: WafRule = {
            ...newRule,
            id: String(Date.now()).slice(-4),
            hits: 0,
            enabled: true,
        }
        setRules(prev => [rule, ...prev])
        setNewRule({ name: '', description: '', category: '', severity: 'High', action: 'Block' })
        setShowModal(false)
    }

    return (
        <div className="animate-fadein space-y-4">

            {/* Controls */}
            <div className="flex flex-wrap gap-2 items-center justify-between">
                <div className="flex flex-wrap gap-2">
                    <input className="inp text-sm" style={{ width: 200 }} placeholder="Search rules…"
                        value={search} onChange={e => setSearch(e.target.value)} />
                    <select className="inp text-sm" value={sevFilter} onChange={e => setSevFilter(e.target.value)}>
                        <option value="">All Severities</option>
                        {['Critical', 'High', 'Medium', 'Low'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="px-4 py-2 bg-blue hover:bg-blue/90 text-white text-[12.5px] font-medium rounded-lg transition-colors"
                >
                    + Add Rule
                </button>
            </div>

            {/* Rules table */}
            <div className="bg-bg2 border border-border1 rounded-xl overflow-hidden">
                {/* Header */}
                <div className="grid grid-cols-[48px_1fr_110px_80px_70px_52px] gap-3 px-4 py-2.5 bg-bg3 border-b border-border1">
                    {['ID', 'Rule / Description', 'Category', 'Action', 'Hits', 'On/Off'].map(h => (
                        <span key={h} className="text-[10px] text-text3 uppercase tracking-[.7px] font-medium">{h}</span>
                    ))}
                </div>

                <div className="divide-y divide-border1/50">
                    {filtered.length === 0 && (
                        <div className="py-10 text-center text-sm text-text3">No rules match</div>
                    )}
                    {filtered.map(rule => (
                        <div
                            key={rule.id}
                            className="grid grid-cols-[48px_1fr_110px_80px_70px_52px] gap-3 px-4 py-3 items-center hover:bg-white/[.015] transition-colors"
                        >
                            <span className="mono text-[11px] text-text3">#{rule.id}</span>
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-[12.5px] text-text1 font-medium">{rule.name}</span>
                                    <span className={SEV_CLASS[rule.severity]}>{rule.severity}</span>
                                </div>
                                <div className="text-[11px] text-text3 mt-0.5">{rule.description}</div>
                            </div>
                            <span className="text-[11.5px] text-text2">{rule.category}</span>
                            <span className={ACTION_COLOR[rule.action] ?? 'badge-info'}>{rule.action}</span>
                            <span className="text-[11.5px] text-text2 tabular-nums">{rule.hits.toLocaleString()}</span>
                            <div className="flex items-center gap-2">
                                {/* Toggle */}
                                <label className="relative w-9 h-5 cursor-pointer inline-block flex-shrink-0">
                                    <input type="checkbox" className="sr-only" checked={rule.enabled} onChange={() => toggle(rule.id)} />
                                    <span className="toggle-track" />
                                    <span className="toggle-thumb" />
                                </label>
                                <button
                                    onClick={() => deleteRule(rule.id)}
                                    className="text-text4 hover:text-red-400 transition-colors text-sm leading-none"
                                    title="Delete rule"
                                >✕</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Add Rule Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4" onClick={() => setShowModal(false)}>
                    <div className="bg-bg2 border border-border1 rounded-2xl p-6 w-full max-w-md animate-fadein" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-[15px] font-semibold text-text1">Add WAF Rule</h2>
                            <button onClick={() => setShowModal(false)} className="text-text3 hover:text-text2 text-lg">✕</button>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs text-text2 mb-1.5 uppercase tracking-wider">Rule Name</label>
                                <input className="inp w-full" placeholder="e.g. SQL Injection Blocker"
                                    value={newRule.name} onChange={e => setNewRule(p => ({ ...p, name: e.target.value }))} />
                            </div>
                            <div>
                                <label className="block text-xs text-text2 mb-1.5 uppercase tracking-wider">Description</label>
                                <input className="inp w-full" placeholder="What does this rule detect?"
                                    value={newRule.description} onChange={e => setNewRule(p => ({ ...p, description: e.target.value }))} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs text-text2 mb-1.5 uppercase tracking-wider">Severity</label>
                                    <select className="inp w-full" value={newRule.severity} onChange={e => setNewRule(p => ({ ...p, severity: e.target.value as Severity }))}>
                                        {['Critical', 'High', 'Medium', 'Low'].map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-text2 mb-1.5 uppercase tracking-wider">Action</label>
                                    <select className="inp w-full" value={newRule.action} onChange={e => setNewRule(p => ({ ...p, action: e.target.value as WafRule['action'] }))}>
                                        {['Block', 'Allow', 'Monitor'].map(a => <option key={a} value={a}>{a}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs text-text2 mb-1.5 uppercase tracking-wider">Category</label>
                                <input className="inp w-full" placeholder="e.g. Injection, XSS, Auth"
                                    value={newRule.category} onChange={e => setNewRule(p => ({ ...p, category: e.target.value }))} />
                            </div>
                        </div>
                        <div className="flex gap-2 mt-5">
                            <button onClick={() => setShowModal(false)} className="flex-1 py-2 text-sm bg-bg3 border border-border1 text-text2 rounded-lg hover:border-border2 transition-colors">Cancel</button>
                            <button onClick={addRule} className="flex-1 py-2 text-sm bg-blue text-white rounded-lg hover:bg-blue/90 transition-colors font-medium">Add Rule</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}