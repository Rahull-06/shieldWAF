'use client'
import { useState } from 'react'

interface ToggleRowProps {
    label: string
    desc: string
    checked: boolean
    onChange: () => void
}
function ToggleRow({ label, desc, checked, onChange }: ToggleRowProps) {
    return (
        <div className="flex items-center justify-between py-4 border-b border-border1/60 last:border-0">
            <div>
                <div className="text-[13px] font-medium text-text1">{label}</div>
                <div className="text-[11.5px] text-text3 mt-0.5">{desc}</div>
            </div>
            <label className="relative w-9 h-5 cursor-pointer inline-block flex-shrink-0 ml-4">
                <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
                <span className="toggle-track" />
                <span className="toggle-thumb" />
            </label>
        </div>
    )
}

export default function SettingsPage() {
    const [toggles, setToggles] = useState({
        wafEnabled: true,
        learningMode: false,
        geoBlocking: true,
        rateLimit: true,
        emailAlerts: true,
        slackWebhook: false,
        autoBlock: true,
        ipReputation: true,
    })
    const [saved, setSaved] = useState(false)

    const toggle = (key: keyof typeof toggles) => {
        setToggles(p => ({ ...p, [key]: !p[key] }))
    }

    const save = () => {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
    }

    return (
        <div className="animate-fadein max-w-2xl space-y-4">

            {/* WAF Settings */}
            <div className="bg-bg2 border border-border1 rounded-xl overflow-hidden">
                <div className="px-5 py-3.5 border-b border-border1">
                    <span className="text-[13px] font-semibold text-slate-300">WAF Configuration</span>
                </div>
                <div className="px-5">
                    <ToggleRow label="WAF Protection" desc="Master toggle for all WAF rules and filtering"
                        checked={toggles.wafEnabled} onChange={() => toggle('wafEnabled')} />
                    <ToggleRow label="Learning Mode" desc="Observe and learn traffic patterns without blocking"
                        checked={toggles.learningMode} onChange={() => toggle('learningMode')} />
                    <ToggleRow label="Auto-Block IPs" desc="Automatically block IPs exceeding threat thresholds"
                        checked={toggles.autoBlock} onChange={() => toggle('autoBlock')} />
                    <ToggleRow label="IP Reputation Checking" desc="Cross-reference IPs against threat intelligence feeds"
                        checked={toggles.ipReputation} onChange={() => toggle('ipReputation')} />
                </div>
            </div>

            {/* Rate Limits */}
            <div className="bg-bg2 border border-border1 rounded-xl overflow-hidden">
                <div className="px-5 py-3.5 border-b border-border1">
                    <span className="text-[13px] font-semibold text-slate-300">Rate Limiting & Geo</span>
                </div>
                <div className="px-5">
                    <ToggleRow label="Rate Limiting" desc="Enforce per-IP request rate limits (default: 100/min)"
                        checked={toggles.rateLimit} onChange={() => toggle('rateLimit')} />
                    <ToggleRow label="Geo-Blocking" desc="Block or challenge traffic from high-risk regions"
                        checked={toggles.geoBlocking} onChange={() => toggle('geoBlocking')} />
                </div>
                <div className="px-5 pb-5 pt-2 grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs text-text2 mb-1.5 uppercase tracking-wider">Requests / Minute</label>
                        <input className="inp w-full" defaultValue="100" type="number" />
                    </div>
                    <div>
                        <label className="block text-xs text-text2 mb-1.5 uppercase tracking-wider">Block Duration (min)</label>
                        <input className="inp w-full" defaultValue="30" type="number" />
                    </div>
                </div>
            </div>

            {/* Alerts */}
            <div className="bg-bg2 border border-border1 rounded-xl overflow-hidden">
                <div className="px-5 py-3.5 border-b border-border1">
                    <span className="text-[13px] font-semibold text-slate-300">Alerts & Notifications</span>
                </div>
                <div className="px-5">
                    <ToggleRow label="Email Alerts" desc="Receive attack notifications via email"
                        checked={toggles.emailAlerts} onChange={() => toggle('emailAlerts')} />
                    <ToggleRow label="Slack Webhook" desc="Forward critical alerts to your Slack channel"
                        checked={toggles.slackWebhook} onChange={() => toggle('slackWebhook')} />
                </div>
                <div className="px-5 pb-5 pt-2 space-y-3">
                    <div>
                        <label className="block text-xs text-text2 mb-1.5 uppercase tracking-wider">Alert Email</label>
                        <input className="inp w-full" defaultValue="admin@shieldwaf.io" type="email" />
                    </div>
                    {toggles.slackWebhook && (
                        <div>
                            <label className="block text-xs text-text2 mb-1.5 uppercase tracking-wider">Slack Webhook URL</label>
                            <input className="inp w-full" placeholder="https://hooks.slack.com/services/…" />
                        </div>
                    )}
                </div>
            </div>

            {/* Save */}
            <div className="flex items-center gap-3">
                <button
                    onClick={save}
                    className="px-5 py-2.5 bg-blue hover:bg-blue/90 text-white font-semibold text-sm rounded-lg transition-colors"
                >
                    {saved ? '✓ Saved!' : 'Save Settings'}
                </button>
                <button className="px-5 py-2.5 bg-bg3 border border-border1 hover:border-border2 text-text2 text-sm rounded-lg transition-colors">
                    Reset to Defaults
                </button>
            </div>
        </div>
    )
}