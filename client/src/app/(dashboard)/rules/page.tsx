'use client'
import { useState, useEffect, useCallback, useRef } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Rule {
    id: string
    name: string
    pattern: string
    type: 'sqli' | 'xss' | 'path_traversal' | 'cmd_injection' | 'ssrf' | 'custom'
    severity: 'low' | 'medium' | 'high' | 'critical'
    action: 'block' | 'flag' | 'allow'
    enabled: boolean
    hitCount: number
    createdAt: string
}

interface RuleForm {
    name: string
    pattern: string
    type: Rule['type']
    severity: Rule['severity']
    action: Rule['action']
    enabled: boolean
}

// ─── Constants ────────────────────────────────────────────────────────────────
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const DEMO_RULES: Rule[] = [
    { id: 'd1', name: 'SQL Injection Blocker', pattern: "(union|select|insert|drop|delete|update|exec|cast|convert)\\s", type: 'sqli', severity: 'critical', action: 'block', enabled: true, hitCount: 1423, createdAt: '2025-01-12' },
    { id: 'd2', name: 'XSS Script Tag', pattern: "<script[^>]*>.*?</script>", type: 'xss', severity: 'high', action: 'block', enabled: true, hitCount: 876, createdAt: '2025-01-14' },
    { id: 'd3', name: 'Path Traversal Guard', pattern: "(\\.\\./|\\.\\.\\\\|%2e%2e%2f)", type: 'path_traversal', severity: 'high', action: 'block', enabled: true, hitCount: 342, createdAt: '2025-01-18' },
    { id: 'd4', name: 'Command Injection', pattern: "(;|\\||&&|`|\\$\\()(\\s*)(cat|ls|whoami|id|uname|wget|curl)", type: 'cmd_injection', severity: 'critical', action: 'block', enabled: true, hitCount: 219, createdAt: '2025-01-20' },
    { id: 'd5', name: 'SSRF Internal Network', pattern: "(localhost|127\\.0\\.0\\.1|169\\.254|10\\.|192\\.168)", type: 'ssrf', severity: 'high', action: 'flag', enabled: false, hitCount: 88, createdAt: '2025-01-22' },
    { id: 'd6', name: 'XSS Event Handler', pattern: "on(load|error|click|mouseover|focus)\\s*=", type: 'xss', severity: 'medium', action: 'block', enabled: true, hitCount: 541, createdAt: '2025-02-01' },
    { id: 'd7', name: 'Admin Panel Access', pattern: "/(admin|wp-admin|phpmyadmin|cpanel)", type: 'custom', severity: 'medium', action: 'flag', enabled: true, hitCount: 193, createdAt: '2025-02-05' },
    { id: 'd8', name: 'Malicious Bot UA', pattern: "(sqlmap|nikto|nmap|masscan|zgrab)", type: 'custom', severity: 'low', action: 'flag', enabled: false, hitCount: 67, createdAt: '2025-02-10' },
]

const BLANK_FORM: RuleForm = { name: '', pattern: '', type: 'custom', severity: 'medium', action: 'block', enabled: true }

const TYPE_LABELS: Record<Rule['type'], string> = {
    sqli: 'SQLi', xss: 'XSS', path_traversal: 'Path Trav.', cmd_injection: 'CMDi', ssrf: 'SSRF', custom: 'Custom'
}
const TYPE_COLORS: Record<Rule['type'], string> = {
    sqli: '#ef4444', xss: '#f59e0b', path_traversal: '#8b5cf6', cmd_injection: '#ef4444', ssrf: '#3b82f6', custom: '#10b981'
}
const SEV_COLORS: Record<Rule['severity'], string> = {
    low: '#10b981', medium: '#f59e0b', high: '#f97316', critical: '#ef4444'
}
const ACTION_COLORS: Record<Rule['action'], string> = {
    block: '#ef4444', flag: '#f59e0b', allow: '#10b981'
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function useToast() {
    const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
    const show = (msg: string, ok = true) => {
        setToast({ msg, ok })
        if (timer.current) clearTimeout(timer.current)
        timer.current = setTimeout(() => setToast(null), 3000)
    }
    return { toast, show }
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
    useEffect(() => {
        const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
        window.addEventListener('keydown', fn)
        return () => window.removeEventListener('keydown', fn)
    }, [onClose])
    return (
        <div className="rp-overlay" onClick={onClose}>
            <div className="rp-modal" onClick={e => e.stopPropagation()}>
                <div className="rp-modal-head">
                    <span className="rp-modal-title">{title}</span>
                    <button className="rp-modal-close" onClick={onClose}>✕</button>
                </div>
                {children}
            </div>
        </div>
    )
}

// ─── RuleFormFields ───────────────────────────────────────────────────────────
function RuleFormFields({ form, setForm }: { form: RuleForm; setForm: (f: RuleForm) => void }) {
    const set = (k: keyof RuleForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        setForm({ ...form, [k]: e.target.value })
    return (
        <div className="rp-form">
            <div className="rp-form-row">
                <label className="rp-label">Rule Name</label>
                <input className="rp-inp" placeholder="e.g. SQL Injection Blocker" value={form.name} onChange={set('name')} />
            </div>
            <div className="rp-form-row">
                <label className="rp-label">Pattern (Regex)</label>
                <textarea className="rp-inp rp-mono rp-ta" placeholder="e.g. (union|select)\\s" value={form.pattern} onChange={set('pattern')} rows={3} />
            </div>
            <div className="rp-form-grid2">
                <div className="rp-form-row">
                    <label className="rp-label">Attack Type</label>
                    <select className="rp-inp rp-sel" value={form.type} onChange={set('type')}>
                        <option value="sqli">SQL Injection</option>
                        <option value="xss">XSS</option>
                        <option value="path_traversal">Path Traversal</option>
                        <option value="cmd_injection">Command Injection</option>
                        <option value="ssrf">SSRF</option>
                        <option value="custom">Custom</option>
                    </select>
                </div>
                <div className="rp-form-row">
                    <label className="rp-label">Severity</label>
                    <select className="rp-inp rp-sel" value={form.severity} onChange={set('severity')}>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                    </select>
                </div>
            </div>
            <div className="rp-form-grid2">
                <div className="rp-form-row">
                    <label className="rp-label">Action</label>
                    <select className="rp-inp rp-sel" value={form.action} onChange={set('action')}>
                        <option value="block">Block</option>
                        <option value="flag">Flag</option>
                        <option value="allow">Allow</option>
                    </select>
                </div>
                <div className="rp-form-row">
                    <label className="rp-label">Status</label>
                    <select className="rp-inp rp-sel" value={form.enabled ? 'true' : 'false'} onChange={e => setForm({ ...form, enabled: e.target.value === 'true' })}>
                        <option value="true">Enabled</option>
                        <option value="false">Disabled</option>
                    </select>
                </div>
            </div>
        </div>
    )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function RulesPage() {
    const [rules, setRules] = useState<Rule[]>([])
    const [loading, setLoading] = useState(true)
    const [isDemo, setIsDemo] = useState(false)
    const [filterType, setFilterType] = useState('')
    const [filterSev, setFilterSev] = useState('')
    const [filterAction, setFilterAction] = useState('')
    const [filterEnabled, setFilterEnabled] = useState('')
    const [search, setSearch] = useState('')
    const [showCreate, setShowCreate] = useState(false)
    const [editRule, setEditRule] = useState<Rule | null>(null)
    const [deleteRule, setDeleteRule] = useState<Rule | null>(null)
    const [form, setForm] = useState<RuleForm>(BLANK_FORM)
    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [togglingId, setTogglingId] = useState<string | null>(null)
    const { toast, show } = useToast()

    const fetchRules = useCallback(async () => {
        const token = localStorage.getItem('token')
        if (!token) { setRules(DEMO_RULES); setIsDemo(true); setLoading(false); return }
        try {
            const r = await fetch(`${API}/rules`, { headers: { Authorization: `Bearer ${token}` } })
            if (r.status === 401) { localStorage.removeItem('token'); setRules(DEMO_RULES); setIsDemo(true); setLoading(false); return }
            const d = await r.json()
            const raw = d.data ?? []
            setRules(raw.map((x: any) => ({ ...x, id: x._id ?? x.id }))); setIsDemo(false)
        } catch { setRules(DEMO_RULES); setIsDemo(true) }
        finally { setLoading(false) }
    }, [])

    useEffect(() => { fetchRules() }, [fetchRules])

    const filtered = rules.filter(r => {
        if (filterType && r.type !== filterType) return false
        if (filterSev && r.severity !== filterSev) return false
        if (filterAction && r.action !== filterAction) return false
        if (filterEnabled === 'true' && !r.enabled) return false
        if (filterEnabled === 'false' && r.enabled) return false
        if (search) {
            const s = search.toLowerCase()
            return r.name.toLowerCase().includes(s) || r.pattern.toLowerCase().includes(s)
        }
        return true
    })

    const hasFilters = !!(filterType || filterSev || filterAction || filterEnabled || search)
    const totalRules = rules.length
    const activeRules = rules.filter(r => r.enabled).length
    const totalHits = rules.reduce((s, r) => s + (r.hitCount || 0), 0)
    const criticalRules = rules.filter(r => r.severity === 'critical').length

    const handleToggle = async (rule: Rule) => {
        if (isDemo) { setRules(prev => prev.map(r => r.id === rule.id ? { ...r, enabled: !r.enabled } : r)); show(`Rule ${rule.enabled ? 'disabled' : 'enabled'}`); return }
        setTogglingId(rule.id)
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`${API}/rules/${rule.id}/toggle`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } })
            const d = await res.json()
            if (d.success) { setRules(prev => prev.map(r => r.id === rule.id ? { ...r, enabled: !r.enabled } : r)); show(`Rule ${rule.enabled ? 'disabled' : 'enabled'}`) }
            else show(d.message || 'Toggle failed', false)
        } catch { show('Network error', false) }
        finally { setTogglingId(null) }
    }

    const openCreate = () => { setForm(BLANK_FORM); setShowCreate(true) }
    const handleCreate = async () => {
        if (!form.name.trim() || !form.pattern.trim()) { show('Name and pattern are required', false); return }
        setSaving(true)
        if (isDemo) { setRules(prev => [{ ...form, id: `d${Date.now()}`, hitCount: 0, createdAt: new Date().toISOString().slice(0, 10) }, ...prev]); setShowCreate(false); show('Rule created (demo)'); setSaving(false); return }
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`${API}/rules`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(form) })
            const d = await res.json()
            if (d.success) { await fetchRules(); setShowCreate(false); show('Rule created') }
            else show(d.message || 'Create failed', false)
        } catch { show('Network error', false) }
        finally { setSaving(false) }
    }

    const openEdit = (rule: Rule) => { setEditRule(rule); setForm({ name: rule.name, pattern: rule.pattern, type: rule.type, severity: rule.severity, action: rule.action, enabled: rule.enabled }) }
    const handleEdit = async () => {
        if (!editRule || !form.name.trim() || !form.pattern.trim()) { show('Name and pattern are required', false); return }
        setSaving(true)
        if (isDemo) { setRules(prev => prev.map(r => r.id === editRule.id ? { ...r, ...form } : r)); setEditRule(null); show('Rule updated (demo)'); setSaving(false); return }
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`${API}/rules/${editRule.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(form) })
            const d = await res.json()
            if (d.success) { await fetchRules(); setEditRule(null); show('Rule updated') }
            else show(d.message || 'Update failed', false)
        } catch { show('Network error', false) }
        finally { setSaving(false) }
    }

    const handleDelete = async () => {
        if (!deleteRule) return
        setDeleting(true)
        if (isDemo) { setRules(prev => prev.filter(r => r.id !== deleteRule.id)); setDeleteRule(null); show('Rule deleted (demo)'); setDeleting(false); return }
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`${API}/rules/${deleteRule.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
            const d = await res.json()
            if (d.success) { setRules(prev => prev.filter(r => r.id !== deleteRule.id)); setDeleteRule(null); show('Rule deleted') }
            else show(d.message || 'Delete failed', false)
        } catch { show('Network error', false) }
        finally { setDeleting(false) }
    }

    return (
        <>
            <style>{`
        /* ── Base ── */
        .rp { padding: 28px; max-width: 1440px; margin: 0 auto; display: flex; flex-direction: column; gap: 20px; }

        /* ── Demo banner ── */
        .rp-demo { display: flex; align-items: center; justify-content: space-between; gap: 12px; background: rgba(59,130,246,.05); border: 1px solid rgba(59,130,246,.14); border-radius: 8px; padding: 10px 16px; flex-wrap: wrap; }
        .rp-demo-txt { font-size: 12px; color: #93c5fd; font-family: 'IBM Plex Mono', monospace; }
        .rp-demo-cta { font-size: 11px; font-weight: 600; color: #3b82f6; background: rgba(59,130,246,.1); border: 1px solid rgba(59,130,246,.22); border-radius: 5px; padding: 5px 12px; cursor: pointer; font-family: 'IBM Plex Mono', monospace; transition: background .15s; white-space: nowrap; text-decoration: none; }
        .rp-demo-cta:hover { background: rgba(59,130,246,.18); }

        /* ── Page header ── */
        .rp-hdr { display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; flex-wrap: wrap; }
        .rp-title { font-size: 19px; font-weight: 700; color: var(--text); font-family: Syne, sans-serif; letter-spacing: -.3px; }
        .rp-sub { display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--text3); margin-top: 5px; font-family: 'IBM Plex Mono', monospace; }
        .rp-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
        .rp-dot-live { background: #10b981; box-shadow: 0 0 0 3px rgba(16,185,129,.2); }
        .rp-dot-demo { background: #4b5563; }

        /* ── Stats ── */
        .rp-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
        .rp-stat { background: var(--bg2); border: 1px solid var(--border); border-radius: 10px; padding: 14px 16px; display: flex; align-items: center; gap: 12px; transition: border-color .2s; }
        .rp-stat:hover { border-color: var(--border2); }
        .rp-stat-bar { width: 3px; height: 30px; border-radius: 2px; flex-shrink: 0; opacity: .85; }
        .rp-stat-val { font-size: 20px; font-weight: 700; color: var(--text); font-family: Syne, sans-serif; line-height: 1; }
        .rp-stat-lbl { font-size: 9.5px; color: var(--text3); margin-top: 3px; font-family: 'IBM Plex Mono', monospace; text-transform: uppercase; letter-spacing: .07em; }

        /* ── Toolbar ── */
        .rp-toolbar { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .rp-srch-wrap { position: relative; flex: 1; min-width: 200px; }
        .rp-srch-ico { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text3); font-size: 13px; pointer-events: none; line-height: 1; }
        .rp-srch { width: 100%; padding: 9px 12px 9px 36px; background: var(--bg2); border: 1px solid var(--border); border-radius: 8px; color: var(--text); font-size: 12px; outline: none; font-family: 'IBM Plex Mono', monospace; transition: border-color .18s; }
        .rp-srch:focus { border-color: rgba(59,130,246,.35); }
        .rp-srch::placeholder { color: var(--text3); }
        .rp-sel { padding: 9px 28px 9px 11px; background: var(--bg2); border: 1px solid var(--border); border-radius: 8px; color: var(--text); font-size: 12px; outline: none; cursor: pointer; font-family: 'IBM Plex Mono', monospace; transition: border-color .18s; min-width: 120px; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%238899b0' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 9px center; }
        .rp-sel:focus { border-color: rgba(59,130,246,.35); }
        .rp-sel option { background: var(--bg3); }
        .rp-fcount { font-size: 11px; color: var(--text3); font-family: 'IBM Plex Mono', monospace; white-space: nowrap; margin-left: auto; }
        .rp-clear-btn { font-size: 11px; font-weight: 600; color: var(--text3); background: transparent; border: 1px solid transparent; border-radius: 8px; padding: 9px 10px; cursor: pointer; font-family: 'IBM Plex Mono', monospace; white-space: nowrap; transition: all .15s; }
        .rp-clear-btn:hover { color: var(--text2); background: var(--bg3); border-color: var(--border); }

        /* ── Table panel ── */
        .rp-panel { background: var(--bg2); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
        .rp-panel-head { display: flex; align-items: center; justify-content: space-between; padding: 13px 20px; border-bottom: 1px solid var(--border); gap: 12px; flex-wrap: wrap; }
        .rp-panel-title { font-size: 10.5px; font-weight: 700; color: var(--text3); font-family: 'IBM Plex Mono', monospace; text-transform: uppercase; letter-spacing: .08em; }
        .rp-panel-count { font-size: 11px; color: var(--text3); font-family: 'IBM Plex Mono', monospace; }
        .rp-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        .rp-tbl { width: 100%; border-collapse: collapse; min-width: 640px; }
        .rp-tbl thead tr { background: var(--bg3); }
        .rp-tbl th { padding: 10px 16px; font-size: 9.5px; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: .08em; text-align: left; border-bottom: 1px solid var(--border); white-space: nowrap; font-family: 'IBM Plex Mono', monospace; }
        .rp-tbl tbody tr { border-bottom: 1px solid rgba(26,37,53,.65); transition: background .1s; }
        .rp-tbl tbody tr:last-child { border-bottom: none; }
        .rp-tbl tbody tr:hover td { background: rgba(255,255,255,.016); }
        .rp-tbl td { padding: 11px 16px; vertical-align: middle; }

        /* ── Cell helpers ── */
        .rp-rule-name { font-size: 12.5px; font-weight: 600; color: var(--text); font-family: Syne, sans-serif; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .rp-rule-pattern { font-size: 10.5px; color: var(--text3); margin-top: 2px; font-family: 'IBM Plex Mono', monospace; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px; }
        .rp-hits { font-size: 12px; color: var(--text2); font-family: 'IBM Plex Mono', monospace; }
        .rp-date { font-size: 11px; color: var(--text3); white-space: nowrap; font-family: 'IBM Plex Mono', monospace; }

        /* ── Pill badge ── */
        .pill { display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 4px; font-size: 9.5px; font-weight: 700; letter-spacing: .05em; text-transform: uppercase; white-space: nowrap; font-family: 'IBM Plex Mono', monospace; border-width: 1px; border-style: solid; }

        /* ── Toggle ── */
        .rp-toggle { display: flex; align-items: center; gap: 8px; cursor: pointer; user-select: none; }
        .rp-toggle-track { position: relative; width: 32px; height: 18px; border-radius: 9px; border: 1px solid var(--border); background: var(--bg3); transition: background .18s, border-color .18s; flex-shrink: 0; }
        .rp-toggle-track.on { background: rgba(16,185,129,.25); border-color: rgba(16,185,129,.5); }
        .rp-toggle-thumb { position: absolute; top: 2px; left: 2px; width: 12px; height: 12px; border-radius: 50%; background: var(--text3); transition: transform .18s, background .18s; }
        .rp-toggle-track.on .rp-toggle-thumb { transform: translateX(14px); background: #10b981; }
        .rp-toggle-lbl { font-size: 10.5px; color: var(--text3); white-space: nowrap; font-family: 'IBM Plex Mono', monospace; }
        .rp-toggle-lbl.on { color: #10b981; }

        /* ── Row actions ── */
        .rp-row-actions { display: flex; align-items: center; gap: 6px; }
        .rp-icon-btn { background: none; border: 1px solid var(--border); border-radius: 6px; padding: 5px 8px; cursor: pointer; color: var(--text3); font-size: 13px; transition: background .12s, color .12s, border-color .12s; line-height: 1; }
        .rp-icon-btn:hover { background: var(--bg3); color: var(--text); }
        .rp-icon-btn.danger:hover { border-color: rgba(239,68,68,.4); color: #ef4444; background: rgba(239,68,68,.08); }

        /* ── Loading / Empty ── */
        .rp-loading { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 60px 20px; color: var(--text3); font-size: 12px; font-family: 'IBM Plex Mono', monospace; }
        .rp-spin { width: 16px; height: 16px; border: 2px solid var(--border2); border-top-color: #3b82f6; border-radius: 50%; animation: rp-spin .6s linear infinite; flex-shrink: 0; }
        @keyframes rp-spin { to { transform: rotate(360deg); } }
        .rp-empty { padding: 60px 20px; text-align: center; }
        .rp-empty-ico { font-size: 30px; margin-bottom: 10px; opacity: .45; }
        .rp-empty-msg { font-size: 13px; color: var(--text2); font-family: Syne, sans-serif; }
        .rp-empty-sub { font-size: 11px; color: var(--text3); margin-top: 3px; font-family: 'IBM Plex Mono', monospace; }

        /* ── Buttons ── */
        .rp-btn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 15px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; border: 1px solid var(--border); background: var(--bg2); color: var(--text2); transition: all .15s; font-family: Syne, sans-serif; line-height: 1; white-space: nowrap; }
        .rp-btn:hover { border-color: var(--border2); color: var(--text); }
        .rp-btn:disabled { opacity: .38; cursor: not-allowed; }
        .rp-btn-primary { background: #3b82f6; border-color: #3b82f6; color: #fff; }
        .rp-btn-primary:hover { background: #2563eb; border-color: #2563eb; color: #fff; }
        .rp-btn-danger { background: rgba(239,68,68,.1); border-color: rgba(239,68,68,.4); color: #ef4444; }
        .rp-btn-danger:hover { background: rgba(239,68,68,.2); }
        .rp-btn-sm { padding: 7px 13px; font-size: 11.5px; }

        /* ── Modal ── */
        .rp-overlay { position: fixed; inset: 0; z-index: 1000; background: rgba(0,0,0,.7); display: flex; align-items: center; justify-content: center; padding: 16px; backdrop-filter: blur(4px); }
        .rp-modal { background: var(--bg2); border: 1px solid var(--border2); border-radius: 14px; width: 100%; max-width: 520px; box-shadow: 0 20px 60px rgba(0,0,0,.5); animation: rp-modal-in .18s ease; }
        @keyframes rp-modal-in { from { opacity: 0; transform: scale(.96); } to { opacity: 1; transform: scale(1); } }
        .rp-modal-head { display: flex; align-items: center; justify-content: space-between; padding: 15px 18px; border-bottom: 1px solid var(--border); }
        .rp-modal-title { font-size: 14px; font-weight: 700; color: var(--text); font-family: Syne, sans-serif; }
        .rp-modal-close { background: none; border: none; cursor: pointer; color: var(--text3); font-size: 14px; padding: 2px 6px; border-radius: 5px; transition: background .12s, color .12s; }
        .rp-modal-close:hover { background: var(--bg3); color: var(--text); }
        .rp-modal-body { padding: 18px; }
        .rp-modal-foot { padding: 14px 18px; border-top: 1px solid var(--border); display: flex; align-items: center; justify-content: flex-end; gap: 8px; }
        .rp-del-text { font-size: 13px; color: var(--text2); line-height: 1.6; font-family: 'IBM Plex Mono', monospace; }
        .rp-del-name { color: var(--text); font-weight: 600; font-family: Syne, sans-serif; }

        /* ── Form ── */
        .rp-form { display: flex; flex-direction: column; gap: 14px; }
        .rp-form-row { display: flex; flex-direction: column; gap: 5px; }
        .rp-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: var(--text3); font-family: 'IBM Plex Mono', monospace; }
        .rp-inp { width: 100%; padding: 9px 12px; background: var(--bg3); border: 1px solid var(--border); border-radius: 8px; color: var(--text); font-size: 12px; outline: none; font-family: 'IBM Plex Mono', monospace; transition: border-color .18s; box-sizing: border-box; }
        .rp-inp:focus { border-color: rgba(59,130,246,.35); }
        .rp-inp::placeholder { color: var(--text3); }
        .rp-inp option { background: var(--bg3); }
        .rp-mono { font-family: 'IBM Plex Mono', monospace !important; }
        .rp-ta { resize: vertical; }
        .rp-sel { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%238899b0' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 10px center; padding-right: 28px; cursor: pointer; }
        .rp-form-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

        /* ── Toast ── */
        .rp-toast { position: fixed; bottom: 24px; right: 24px; z-index: 2000; display: flex; align-items: center; gap: 8px; padding: 11px 18px; border-radius: 8px; font-size: 12px; font-family: 'IBM Plex Mono', monospace; box-shadow: 0 8px 32px rgba(0,0,0,.38); animation: rp-toast-in .2s ease; }
        @keyframes rp-toast-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        .rp-toast.ok { background: var(--bg2); border: 1px solid rgba(16,185,129,.22); color: #4ade80; }
        .rp-toast.err { background: var(--bg2); border: 1px solid rgba(239,68,68,.22); color: #f87171; }

        /* ── Responsive ── */
        @media (max-width: 1024px) { .rp-stats { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 768px) {
          .rp { padding: 16px 16px 36px; gap: 14px; }
          .rp-toolbar { flex-direction: column; align-items: stretch; }
          .rp-srch-wrap { min-width: unset; }
          .rp-sel { min-width: unset; width: 100%; }
          .rp-fcount { margin-left: 0; }
          .rp-hide-md { display: none; }
          .rp-tbl { min-width: 500px; }
        }
        @media (max-width: 480px) {
          .rp { padding: 12px 12px 30px; }
          .rp-stats { gap: 8px; }
          .rp-stat-val { font-size: 18px; }
          .rp-hdr { flex-direction: column; gap: 10px; }
          .rp-hide-sm { display: none; }
          .rp-form-grid2 { grid-template-columns: 1fr; }
          .rp-modal { max-width: 100%; }
        }
        @media (max-width: 360px) {
          .rp-stat { padding: 10px 12px; gap: 8px; }
          .rp-stat-val { font-size: 16px; }
        }
      `}</style>

            <div className="rp animate-fadein">
                {/* Toast */}
                {toast && <div className={`rp-toast ${toast.ok ? 'ok' : 'err'}`}>{toast.ok ? '✓' : '✕'} {toast.msg}</div>}

                {/* Demo banner */}
                {isDemo && (
                    <div className="rp-demo">
                        <span className="rp-demo-txt">⚠ Demo mode — sample rules, changes won't persist</span>
                        <a href="/login" className="rp-demo-cta">Login to use real data →</a>
                    </div>
                )}

                {/* Header */}
                <div className="rp-hdr">
                    <div>
                        <div className="rp-title">Firewall Rules</div>
                        <div className="rp-sub">
                            <span className={`rp-dot ${isDemo ? 'rp-dot-demo' : 'rp-dot-live'}`} />
                            {isDemo ? 'demo mode · sample rules' : `live · ${totalRules} total rules`}
                        </div>
                    </div>
                    <button className="rp-btn rp-btn-primary" onClick={openCreate}>+ New Rule</button>
                </div>

                {/* Stats */}
                <div className="rp-stats">
                    {[
                        { lbl: 'Total Rules', val: totalRules, accent: '#60a5fa' },
                        { lbl: 'Active', val: activeRules, accent: '#10b981' },
                        { lbl: 'Total Hits', val: totalHits.toLocaleString(), accent: '#f59e0b' },
                        { lbl: 'Critical', val: criticalRules, accent: '#ef4444' },
                    ].map(s => (
                        <div key={s.lbl} className="rp-stat">
                            <span className="rp-stat-bar" style={{ background: s.accent }} />
                            <div>
                                <div className="rp-stat-val">{s.val}</div>
                                <div className="rp-stat-lbl">{s.lbl}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Toolbar */}
                <div className="rp-toolbar">
                    <div className="rp-srch-wrap">
                        <span className="rp-srch-ico">⌕</span>
                        <input className="rp-srch" placeholder="Search name or pattern…" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <select className="rp-sel" value={filterType} onChange={e => setFilterType(e.target.value)}>
                        <option value="">All Types</option>
                        <option value="sqli">SQLi</option>
                        <option value="xss">XSS</option>
                        <option value="path_traversal">Path Traversal</option>
                        <option value="cmd_injection">CMDi</option>
                        <option value="ssrf">SSRF</option>
                        <option value="custom">Custom</option>
                    </select>
                    <select className="rp-sel" value={filterSev} onChange={e => setFilterSev(e.target.value)}>
                        <option value="">All Severity</option>
                        <option value="critical">Critical</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>
                    <select className="rp-sel rp-hide-sm" value={filterAction} onChange={e => setFilterAction(e.target.value)}>
                        <option value="">All Actions</option>
                        <option value="block">Block</option>
                        <option value="flag">Flag</option>
                        <option value="allow">Allow</option>
                    </select>
                    <select className="rp-sel rp-hide-md" value={filterEnabled} onChange={e => setFilterEnabled(e.target.value)}>
                        <option value="">All Status</option>
                        <option value="true">Enabled</option>
                        <option value="false">Disabled</option>
                    </select>
                    {hasFilters && <button className="rp-clear-btn" onClick={() => { setFilterType(''); setFilterSev(''); setFilterAction(''); setFilterEnabled(''); setSearch('') }}>✕ Clear</button>}
                    <span className="rp-fcount">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
                </div>

                {/* Table */}
                <div className="rp-panel">
                    <div className="rp-panel-head">
                        <div className="rp-panel-title">Rules</div>
                        <div className="rp-panel-count">{filtered.length}{filtered.length !== totalRules ? ` of ${totalRules}` : ''} rule{filtered.length !== 1 ? 's' : ''}</div>
                    </div>
                    <div className="rp-scroll">
                        {loading ? (
                            <div className="rp-loading"><div className="rp-spin" />Loading rules…</div>
                        ) : filtered.length === 0 ? (
                            <div className="rp-empty">
                                <div className="rp-empty-ico">🛡️</div>
                                <div className="rp-empty-msg">{hasFilters ? 'No rules match current filters' : 'No rules yet'}</div>
                                <div className="rp-empty-sub">{hasFilters ? 'Try adjusting your filters' : 'Create your first WAF rule above'}</div>
                            </div>
                        ) : (
                            <table className="rp-tbl">
                                <thead>
                                    <tr>
                                        <th>Rule</th>
                                        <th className="rp-hide-sm">Type</th>
                                        <th>Severity</th>
                                        <th className="rp-hide-sm">Action</th>
                                        <th className="rp-hide-md">Hits</th>
                                        <th>Status</th>
                                        <th className="rp-hide-md">Created</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map(rule => {
                                        const typeColor = TYPE_COLORS[rule.type]
                                        const sevColor = SEV_COLORS[rule.severity]
                                        const actionColor = ACTION_COLORS[rule.action]
                                        return (
                                            <tr key={rule.id}>
                                                <td>
                                                    <div className="rp-rule-name">{rule.name}</div>
                                                    <div className="rp-rule-pattern">{rule.pattern}</div>
                                                </td>
                                                <td className="rp-hide-sm">
                                                    <span className="pill" style={{ background: `${typeColor}18`, color: typeColor, borderColor: `${typeColor}33` }}>{TYPE_LABELS[rule.type]}</span>
                                                </td>
                                                <td>
                                                    <span className="pill" style={{ background: `${sevColor}18`, color: sevColor, borderColor: `${sevColor}33` }}>{rule.severity}</span>
                                                </td>
                                                <td className="rp-hide-sm">
                                                    <span className="pill" style={{ background: `${actionColor}18`, color: actionColor, borderColor: `${actionColor}33` }}>{rule.action}</span>
                                                </td>
                                                <td className="rp-hide-md">
                                                    <span className="rp-hits">{(rule.hitCount || 0).toLocaleString()}</span>
                                                </td>
                                                <td>
                                                    <div
                                                        className="rp-toggle"
                                                        onClick={() => togglingId !== rule.id && handleToggle(rule)}
                                                        style={{ opacity: togglingId === rule.id ? .5 : 1 }}
                                                    >
                                                        <div className={`rp-toggle-track ${rule.enabled ? 'on' : ''}`}>
                                                            <div className="rp-toggle-thumb" />
                                                        </div>
                                                        <span className={`rp-toggle-lbl ${rule.enabled ? 'on' : ''}`}>{rule.enabled ? 'On' : 'Off'}</span>
                                                    </div>
                                                </td>
                                                <td className="rp-hide-md">
                                                    <span className="rp-date">{rule.createdAt ? rule.createdAt.slice(0, 10) : '—'}</span>
                                                </td>
                                                <td>
                                                    <div className="rp-row-actions">
                                                        <button className="rp-icon-btn" title="Edit" onClick={() => openEdit(rule)}>✏️</button>
                                                        <button className="rp-icon-btn danger" title="Delete" onClick={() => setDeleteRule(rule)}>🗑️</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {/* Create Modal */}
            {showCreate && (
                <Modal title="Create New Rule" onClose={() => setShowCreate(false)}>
                    <div className="rp-modal-body"><RuleFormFields form={form} setForm={setForm} /></div>
                    <div className="rp-modal-foot">
                        <button className="rp-btn rp-btn-sm" onClick={() => setShowCreate(false)}>Cancel</button>
                        <button className="rp-btn rp-btn-primary rp-btn-sm" onClick={handleCreate} disabled={saving}>{saving ? 'Creating…' : '+ Create Rule'}</button>
                    </div>
                </Modal>
            )}

            {/* Edit Modal */}
            {editRule && (
                <Modal title="Edit Rule" onClose={() => setEditRule(null)}>
                    <div className="rp-modal-body"><RuleFormFields form={form} setForm={setForm} /></div>
                    <div className="rp-modal-foot">
                        <button className="rp-btn rp-btn-sm" onClick={() => setEditRule(null)}>Cancel</button>
                        <button className="rp-btn rp-btn-primary rp-btn-sm" onClick={handleEdit} disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
                    </div>
                </Modal>
            )}

            {/* Delete Modal */}
            {deleteRule && (
                <Modal title="Delete Rule" onClose={() => setDeleteRule(null)}>
                    <div className="rp-modal-body">
                        <p className="rp-del-text">Are you sure you want to delete <span className="rp-del-name">"{deleteRule.name}"</span>? This action cannot be undone and will remove the rule from active WAF protection.</p>
                    </div>
                    <div className="rp-modal-foot">
                        <button className="rp-btn rp-btn-sm" onClick={() => setDeleteRule(null)}>Cancel</button>
                        <button className="rp-btn rp-btn-danger rp-btn-sm" onClick={handleDelete} disabled={deleting}>{deleting ? 'Deleting…' : 'Delete Rule'}</button>
                    </div>
                </Modal>
            )}
        </>
    )
}