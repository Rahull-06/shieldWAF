// PATH: client/src/app/(dashboard)/settings/page.tsx
'use client'
import { useState } from 'react'

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
    return (
        <label className="toggle-wrap">
            <input type="checkbox" checked={checked} onChange={onChange} />
            <span className="toggle-track" />
            <span className="toggle-thumb" />
        </label>
    )
}

function ToggleRow({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: () => void }) {
    return (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
            padding: '13px 0', borderBottom: '1px solid rgba(30,42,56,.8)',
        }}>
            <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 11.5, color: 'var(--text3)' }}>{desc}</div>
            </div>
            <Toggle checked={checked} onChange={onChange} />
        </div>
    )
}

function SectionHeader({ title }: { title: string }) {
    return (
        <div style={{ padding: '13px 18px', borderBottom: '1px solid var(--border)', background: 'var(--bg3)' }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px' }}>{title}</span>
        </div>
    )
}

const inputStyle: React.CSSProperties = {
    background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)',
    padding: '7px 11px', borderRadius: 7, fontSize: 12.5, fontFamily: 'inherit',
    outline: 'none', width: '100%', boxSizing: 'border-box', transition: 'border-color .15s',
}

export default function SettingsPage() {
    const [t, setT] = useState({
        wafEnabled: true,
        learningMode: false,
        autoBlock: true,
        ipReputation: true,
        rateLimit: true,
        geoBlocking: true,
        ddos: true,
        ipWhitelist: false,
        emailAlerts: true,
        realtime: true,
        webhook: false,
        logPayloads: true,
    })
    const [saved, setSaved] = useState(false)
    const tog = (k: keyof typeof t) => setT(p => ({ ...p, [k]: !p[k] }))
    const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000) }

    const panel: React.CSSProperties = { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }

    return (
        <div>
            <style>{`@media(max-width:900px){.settings-grid{grid-template-columns:1fr!important}}`}</style>

            <div className="settings-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, alignItems: 'start' }}>

                {/* ── Left column ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                    {/* Detection & Protection */}
                    <div style={panel}>
                        <SectionHeader title="Detection & Protection" />
                        <div style={{ padding: '0 18px' }}>
                            <ToggleRow label="WAF Protection" desc="Master toggle for all WAF rules and filtering" checked={t.wafEnabled} onChange={() => tog('wafEnabled')} />
                            <ToggleRow label="AI Threat Detection" desc="Use ML models to identify novel attack patterns" checked={t.learningMode} onChange={() => tog('learningMode')} />
                            <ToggleRow label="Auto-Block Attacks" desc="Automatically block requests matching attack patterns" checked={t.autoBlock} onChange={() => tog('autoBlock')} />
                            <ToggleRow label="DDoS Protection" desc="Advanced volumetric attack mitigation" checked={t.ddos} onChange={() => tog('ddos')} />
                            <ToggleRow label="Geo-Blocking" desc="Block traffic from high-risk geographic regions" checked={t.geoBlocking} onChange={() => tog('geoBlocking')} />
                            <div style={{ paddingBottom: 4 }}>
                                <ToggleRow label="IP Reputation" desc="Cross-reference IPs against threat intelligence feeds" checked={t.ipReputation} onChange={() => tog('ipReputation')} />
                            </div>
                        </div>
                    </div>

                    {/* Rate limit thresholds */}
                    <div style={panel}>
                        <SectionHeader title="Rate Limit Thresholds" />
                        <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <ToggleRow label="Rate Limiting" desc="Enforce per-IP request rate limits" checked={t.rateLimit} onChange={() => tog('rateLimit')} />
                            {[
                                { label: 'Login endpoint (req/min)', def: '100' },
                                { label: 'API endpoints (req/min)', def: '500' },
                                { label: 'Block duration (minutes)', def: '30' },
                            ].map(f => (
                                <div key={f.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                                    <span style={{ fontSize: 12.5, color: 'var(--text2)' }}>{f.label}</span>
                                    <input
                                        type="number"
                                        defaultValue={f.def}
                                        style={{ ...inputStyle, width: 90, textAlign: 'right' }}
                                        onFocus={e => (e.target.style.borderColor = 'var(--blue)')}
                                        onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* ── Right column ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                    {/* Notifications */}
                    <div style={panel}>
                        <SectionHeader title="Notifications & Alerts" />
                        <div style={{ padding: '0 18px' }}>
                            <ToggleRow label="Real-Time Alerts" desc="Get instant notifications for critical attacks" checked={t.realtime} onChange={() => tog('realtime')} />
                            <ToggleRow label="Email Alerts" desc="Send alert summaries to your registered email" checked={t.emailAlerts} onChange={() => tog('emailAlerts')} />
                            <div style={{ paddingBottom: 4 }}>
                                <ToggleRow label="Webhook" desc="POST attack events to a custom endpoint" checked={t.webhook} onChange={() => tog('webhook')} />
                            </div>
                        </div>
                        <div style={{ padding: '12px 18px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div>
                                <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.7px', fontWeight: 500, marginBottom: 6 }}>Alert Email</div>
                                <input
                                    type="email"
                                    defaultValue="admin@shieldwaf.io"
                                    style={inputStyle}
                                    onFocus={e => (e.target.style.borderColor = 'var(--blue)')}
                                    onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                                />
                            </div>
                            {t.webhook && (
                                <div>
                                    <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.7px', fontWeight: 500, marginBottom: 6 }}>Webhook URL</div>
                                    <input
                                        placeholder="https://hooks.slack.com/services/…"
                                        style={inputStyle}
                                        onFocus={e => (e.target.style.borderColor = 'var(--blue)')}
                                        onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Logging */}
                    <div style={panel}>
                        <SectionHeader title="Logging" />
                        <div style={{ padding: '0 18px' }}>
                            <ToggleRow label="Log Attack Payloads" desc="Store full payload content in attack logs" checked={t.logPayloads} onChange={() => tog('logPayloads')} />
                        </div>
                        <div style={{ padding: '12px 18px 18px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                                <span style={{ fontSize: 12.5, color: 'var(--text2)' }}>Log Retention (days)</span>
                                <input
                                    type="number"
                                    defaultValue="90"
                                    style={{ ...inputStyle, width: 90, textAlign: 'right' }}
                                    onFocus={e => (e.target.style.borderColor = 'var(--blue)')}
                                    onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Danger zone */}
                    <div style={{ ...panel, borderColor: 'rgba(239,68,68,.2)' }}>
                        <div style={{ padding: '13px 18px', borderBottom: '1px solid rgba(239,68,68,.15)', background: 'rgba(239,68,68,.04)' }}>
                            <span style={{ fontSize: 10, fontWeight: 600, color: '#fca5a5', textTransform: 'uppercase', letterSpacing: '1px' }}>Danger Zone</span>
                        </div>
                        <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {['Reset All Rules to Default', 'Flush Attack Logs', 'Disable WAF (Emergency)'].map(label => (
                                <button
                                    key={label}
                                    style={{
                                        width: '100%', padding: '9px 14px', textAlign: 'left',
                                        background: 'transparent', border: '1px solid rgba(239,68,68,.2)',
                                        borderRadius: 7, color: '#fca5a5', fontSize: 12.5, cursor: 'pointer',
                                        fontFamily: 'inherit', transition: 'all .12s',
                                    }}
                                    onMouseEnter={e => { (e.currentTarget.style.background = 'rgba(239,68,68,.08)'); (e.currentTarget.style.borderColor = 'rgba(239,68,68,.4)') }}
                                    onMouseLeave={e => { (e.currentTarget.style.background = 'transparent'); (e.currentTarget.style.borderColor = 'rgba(239,68,68,.2)') }}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                </div>
            </div>

            {/* Save bar */}
            <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
                <button
                    className="btn btn-primary"
                    style={{ padding: '9px 20px', fontWeight: 600 }}
                    onClick={save}
                >
                    {saved ? '✓ Saved!' : 'Save Changes'}
                </button>
                <button className="btn" style={{ padding: '9px 16px' }}>Reset to Defaults</button>
            </div>
        </div>
    )
}