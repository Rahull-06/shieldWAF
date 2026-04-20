// PATH: client/src/app/(dashboard)/dashboard/page.tsx
'use client'
import MetricCard from '@/components/MetricCard'
import Chart from '@/components/Chart'
import ThreatFeed from '@/components/ThreatFeed'
import type { Metric } from '@/types'

const METRICS: Metric[] = [
    { label: 'Total Requests', value: '2.4M', change: '+12% vs yesterday', changeType: 'neutral', color: 'blue', icon: '↑', sparkData: [420, 280, 190, 340, 780, 1240, 1580, 1820, 1650, 1420] },
    { label: 'Attacks Blocked', value: '18,421', change: '↑ 340 in last hour', changeType: 'bad', color: 'red', icon: '⛔', sparkData: [38, 22, 15, 41, 120, 230, 310, 480, 390, 280] },
    { label: 'Active Threats', value: '3', change: 'Critical level', changeType: 'bad', color: 'amber', icon: '⚠', sparkData: [1, 0, 2, 1, 3, 5, 4, 3, 2, 3] },
    { label: 'WAF Uptime', value: '99.98%', change: '31 days no downtime', changeType: 'good', color: 'green', icon: '✓', sparkData: [100, 100, 99, 100, 100, 100, 100, 100, 100, 100] },
]

const THREATS = [
    { name: 'SQL Injection', count: 4821, pct: 100, color: '#ef4444' },
    { name: 'XSS', count: 3240, pct: 67, color: '#f59e0b' },
    { name: 'Path Traversal', count: 2180, pct: 45, color: '#f59e0b' },
    { name: 'Cmd Injection', count: 1540, pct: 32, color: '#8b5cf6' },
    { name: 'Brute Force', count: 980, pct: 20, color: '#06b6d4' },
    { name: 'SSRF', count: 620, pct: 13, color: '#1a6cff' },
]

const OWASP = [
    { num: 'A01', name: 'Broken Access Control', val: 182, cls: 'ov-red' },
    { num: 'A03', name: 'Injection Attacks', val: 4821, cls: 'ov-red' },
    { num: 'A05', name: 'Security Misconfig', val: 94, cls: 'ov-amber' },
    { num: 'A07', name: 'Auth Failures', val: 980, cls: 'ov-amber' },
    { num: 'A09', name: 'Logging Failures', val: 12, cls: 'ov-green' },
    { num: 'A10', name: 'SSRF', val: 620, cls: 'ov-amber' },
]

const GEO = [
    { flag: '🇷🇺', name: 'Russia', count: 624, pct: 100, color: '#ef4444' },
    { flag: '🇨🇳', name: 'China', count: 412, pct: 66, color: '#ef4444' },
    { flag: '🇧🇷', name: 'Brazil', count: 218, pct: 35, color: '#f59e0b' },
    { flag: '🇮🇳', name: 'India', count: 156, pct: 25, color: '#f59e0b' },
    { flag: '🇺🇸', name: 'USA', count: 98, pct: 16, color: '#60a5fa' },
    { flag: '🌐', name: 'Others', count: 546, pct: 88, color: 'var(--text3)' },
]

const OWASP_COLOR: Record<string, string> = {
    'ov-red': 'var(--red)',
    'ov-amber': 'var(--amber)',
    'ov-green': 'var(--green)',
}

const panel: React.CSSProperties = {
    background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden',
}
const panelHeader: React.CSSProperties = {
    padding: '13px 16px', borderBottom: '1px solid var(--border)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
}
const panelTitle: React.CSSProperties = {
    fontSize: 12.5, fontWeight: 600, color: '#cbd5e1',
}

export default function DashboardPage() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Metrics row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
                {METRICS.map(m => <MetricCard key={m.label} {...m} />)}
            </div>

            {/* Chart + threat breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 14 }}>
                <Chart />

                {/* Top Attack Vectors */}
                <div style={panel}>
                    <div style={panelHeader}><span style={panelTitle}>Top Attack Vectors</span></div>
                    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {THREATS.map(t => (
                            <div key={t.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: 12, color: 'var(--text2)', minWidth: 90 }}>{t.name}</span>
                                <div style={{ flex: 1, margin: '0 12px', height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                                    <div style={{ height: '100%', borderRadius: 2, width: `${t.pct}%`, background: t.color }} />
                                </div>
                                <span style={{ fontSize: 12, color: '#f1f5f9', fontWeight: 500, minWidth: 36, textAlign: 'right' }}>{t.count.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* OWASP + Geo */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

                {/* OWASP */}
                <div style={panel}>
                    <div style={panelHeader}><span style={panelTitle}>OWASP Top 10 Coverage</span></div>
                    <div style={{ padding: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                        {OWASP.map(o => (
                            <div key={o.num} style={{ background: 'var(--bg3)', borderRadius: 7, padding: '9px 10px' }}>
                                <div style={{ fontSize: 9.5, color: 'var(--text4)', fontWeight: 600, letterSpacing: '.5px' }}>{o.num}</div>
                                <div style={{ fontSize: 10.5, color: 'var(--text2)', marginTop: 2 }}>{o.name}</div>
                                <div style={{ fontSize: 17, fontWeight: 600, marginTop: 4, letterSpacing: '-.5px', color: OWASP_COLOR[o.cls] }}>{o.val.toLocaleString()}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Geo */}
                <div style={panel}>
                    <div style={panelHeader}><span style={panelTitle}>Attack Origins</span></div>
                    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 7 }}>
                        {GEO.map(g => (
                            <div key={g.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                                <span style={{ fontSize: 14, width: 18, flexShrink: 0, display: 'flex', alignItems: 'center' }}>{g.flag}</span>
                                <span style={{ flex: 1, color: 'var(--text2)' }}>{g.name}</span>
                                <span style={{ color: '#f1f5f9', fontWeight: 500, minWidth: 36, textAlign: 'right' }}>{g.count}</span>
                                <div style={{ width: 72, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden', marginLeft: 8 }}>
                                    <div style={{ height: '100%', borderRadius: 2, width: `${g.pct}%`, background: g.color }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* Live Feed */}
            <ThreatFeed />

        </div>
    )
}