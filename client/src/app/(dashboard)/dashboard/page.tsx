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
    { num: 'A01', name: 'Broken Access Control', val: 182, color: 'var(--red)' },
    { num: 'A03', name: 'Injection Attacks', val: 4821, color: 'var(--red)' },
    { num: 'A05', name: 'Security Misconfig', val: 94, color: 'var(--amber)' },
    { num: 'A07', name: 'Auth Failures', val: 980, color: 'var(--amber)' },
    { num: 'A09', name: 'Logging Failures', val: 12, color: 'var(--green)' },
    { num: 'A10', name: 'SSRF', val: 620, color: 'var(--amber)' },
]

// Country flag emoji by country code
const GEO = [
    { code: 'RU', flag: '🇷🇺', name: 'Russia', count: 624, pct: 100, color: '#ef4444' },
    { code: 'CN', flag: '🇨🇳', name: 'China', count: 412, pct: 66, color: '#ef4444' },
    { code: 'BR', flag: '🇧🇷', name: 'Brazil', count: 218, pct: 35, color: '#f59e0b' },
    { code: 'IN', flag: '🇮🇳', name: 'India', count: 156, pct: 25, color: '#f59e0b' },
    { code: 'US', flag: '🇺🇸', name: 'USA', count: 98, pct: 16, color: '#60a5fa' },
    { code: '🌐', flag: '🌐', name: 'Others', count: 546, pct: 88, color: 'var(--text3)' },
]

export default function DashboardPage() {
    return (
        <>
            <style>{`
        .db-metrics { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; margin-bottom: 14px; }
        .db-row2    { display: grid; grid-template-columns: 1fr 300px; gap: 14px; margin-bottom: 14px; }
        .db-row3    { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }

        /* Tablet */
        @media (max-width: 1100px) { .db-row2 { grid-template-columns: 1fr; } }
        @media (max-width: 900px)  { .db-metrics { grid-template-columns: repeat(2,1fr); } .db-row3 { grid-template-columns: 1fr; } }
        @media (max-width: 480px)  { .db-metrics { grid-template-columns: repeat(2,1fr); gap: 8px; } }

        /* Panel base */
        .panel { background: var(--bg2); border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
        .ph    { padding: 13px 16px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
        .pt    { font-size: 12.5px; font-weight: 600; color: #cbd5e1; }
        .pb    { padding: 16px; }

        /* Geo row */
        .geo-row { display: flex; align-items: center; gap: 8px; font-size: 12px; padding: 5px 0; }
        .geo-code { font-size: 9px; font-weight: 700; color: var(--text4); min-width: 16px; }
        .geo-bar-wrap { width: 72px; height: 4px; background: var(--border); border-radius: 2px; overflow: hidden; flex-shrink: 0; }
        .geo-bar-fill { height: 100%; border-radius: 2px; }

        /* OWASP grid */
        .owasp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; padding: 12px; }
        .owasp-item { background: var(--bg3); border-radius: 7px; padding: 9px 10px; transition: background .12s; }
        .owasp-item:hover { background: var(--border); }

        /* Threat bar */
        .tbar-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
        .tbar-row:last-child { margin-bottom: 0; }
      `}</style>

            {/* Metrics */}
            <div className="db-metrics">
                {METRICS.map(m => <MetricCard key={m.label} {...m} />)}
            </div>

            {/* Chart + Attack Vectors */}
            <div className="db-row2">
                <Chart />
                <div className="panel">
                    <div className="ph"><span className="pt">Top Attack Vectors</span></div>
                    <div className="pb">
                        {THREATS.map(t => (
                            <div key={t.name} className="tbar-row">
                                <span style={{ fontSize: 12, color: 'var(--text2)', minWidth: 90 }}>{t.name}</span>
                                <div style={{ flex: 1, margin: '0 12px', height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                                    <div style={{ height: '100%', borderRadius: 2, width: `${t.pct}%`, background: t.color, transition: 'width .5s' }} />
                                </div>
                                <span style={{ fontSize: 12, color: '#f1f5f9', fontWeight: 500, minWidth: 36, textAlign: 'right' }}>{t.count.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* OWASP + Geo */}
            <div className="db-row3">

                {/* OWASP */}
                <div className="panel">
                    <div className="ph"><span className="pt">OWASP Top 10 Coverage</span></div>
                    <div className="owasp-grid">
                        {OWASP.map(o => (
                            <div key={o.num} className="owasp-item">
                                <div style={{ fontSize: 9.5, color: 'var(--text4)', fontWeight: 600, letterSpacing: '.5px' }}>{o.num}</div>
                                <div style={{ fontSize: 10.5, color: 'var(--text2)', marginTop: 2 }}>{o.name}</div>
                                <div style={{ fontSize: 17, fontWeight: 600, marginTop: 4, letterSpacing: '-.5px', color: o.color }}>{o.val.toLocaleString()}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Geo — with flag emoji + country code label + bar */}
                <div className="panel">
                    <div className="ph"><span className="pt">Attack Origins</span></div>
                    <div className="pb" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {GEO.map(g => (
                            <div key={g.name} className="geo-row">
                                {/* Flag emoji */}
                                <span style={{ fontSize: 16, lineHeight: 1, flexShrink: 0 }}>{g.flag}</span>
                                {/* Country code label */}
                                <span className="geo-code">{g.code !== '🌐' ? g.code : ''}</span>
                                {/* Country name */}
                                <span style={{ flex: 1, color: 'var(--text2)' }}>{g.name}</span>
                                {/* Count */}
                                <span style={{ color: '#f1f5f9', fontWeight: 500, minWidth: 32, textAlign: 'right', fontSize: 12 }}>{g.count}</span>
                                {/* Bar */}
                                <div className="geo-bar-wrap" style={{ marginLeft: 8 }}>
                                    <div className="geo-bar-fill" style={{ width: `${g.pct}%`, background: g.color }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* Live Feed */}
            <ThreatFeed />
        </>
    )
}