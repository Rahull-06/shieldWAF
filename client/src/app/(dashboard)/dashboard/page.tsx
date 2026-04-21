// PATH: client/src/app/(dashboard)/dashboard/page.tsx
'use client'
import { useAuth } from '@/hooks/useAuth'
import { useMetrics } from '@/hooks/useMetrics'
import MetricCard from '@/components/MetricCard'
import Chart from '@/components/Chart'
import ThreatFeed from '@/components/ThreatFeed'
import Loader from '@/components/Loader'
import Link from 'next/link'

export default function DashboardPage() {
    const { user } = useAuth()
    const { summary, traffic, threats, geo, loading, isDemo } = useMetrics()

    if (loading) return <Loader />

    const cards = [
        { label: 'Total Requests',  value: summary?.totalRequests?.toLocaleString()  ?? '—', sub: 'All time',          accent: '#3b82f6', icon: '📡', sparkData: [40,55,48,70,65,80,72] },
        { label: 'Blocked Attacks', value: summary?.blockedAttacks?.toLocaleString() ?? '—', sub: `${summary?.blockRate ?? 0}% block rate`, accent: '#ef4444', icon: '🛡️', sparkData: [20,35,28,45,38,52,48] },
        { label: 'Active Threats',  value: summary?.activeThreats?.toLocaleString()  ?? '—', sub: 'Last 24 hours',     accent: '#f59e0b', icon: '⚡', sparkData: [8,12,9,15,11,18,14] },
        { label: 'Active Rules',    value: summary?.activeRules?.toLocaleString()    ?? '—', sub: 'WAF rules enabled', accent: '#10b981', icon: '⚙️', sparkData: [6,6,7,7,8,8,8] },
    ]

    const quickStats = [
        { label: 'System Uptime',    value: summary?.uptime ?? '99.98%',                        color: '#10b981' },
        { label: 'Last 24h Blocked', value: summary?.last24hBlocked?.toLocaleString() ?? '—',   color: '#ef4444' },
        { label: 'Critical (7d)',    value: summary?.criticalCount?.toLocaleString()  ?? '—',    color: '#f59e0b' },
        { label: 'Top Threat',       value: summary?.topThreat ?? '—',                          color: '#3b82f6' },
    ]

    return (
        <>
            <style>{`
                /* ═══════════════════════════════════════════
                   PREMIUM DASHBOARD — MINIMAL & CLEAN
                   ═══════════════════════════════════════════ */

                /* ─── Reset & Base ───────────────────────── */
                * { box-sizing: border-box; }

                .db {
                    padding: 20px 24px 32px;
                    max-width: 1600px;
                    margin: 0 auto;
                    min-height: 100vh;
                }

                /* ─── Page Header ────────────────────────── */
                .db-header {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: 12px;
                    margin-bottom: 20px;
                    flex-wrap: wrap;
                }
                .db-title {
                    font-size: 22px;
                    font-weight: 700;
                    color: var(--text);
                    margin: 0;
                    letter-spacing: -0.5px;
                    line-height: 1.2;
                }
                .db-subtitle {
                    color: var(--text3);
                    font-size: 12px;
                    margin-top: 4px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                .db-live-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: #10b981;
                    box-shadow: 0 0 8px #10b98180;
                    animation: pulse-green 2s infinite;
                    flex-shrink: 0;
                }
                @keyframes pulse-green {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.6; transform: scale(1.3); }
                }

                /* ─── Demo Banner ────────────────────────── */
                .db-banner {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 10px;
                    background: rgba(59,130,246,0.06);
                    border: 1px solid rgba(59,130,246,0.18);
                    border-left: 3px solid #3b82f6;
                    border-radius: 10px;
                    padding: 11px 16px;
                    margin-bottom: 20px;
                }
                .db-banner-text {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    flex-wrap: wrap;
                }
                .db-banner-badge {
                    background: #3b82f6;
                    color: #fff;
                    font-size: 9px;
                    font-weight: 700;
                    letter-spacing: 1.2px;
                    padding: 3px 8px;
                    border-radius: 4px;
                    flex-shrink: 0;
                    text-transform: uppercase;
                }
                .db-banner-msg {
                    color: var(--text2);
                    font-size: 12.5px;
                }
                .db-banner-btn {
                    background: #3b82f6;
                    color: #fff;
                    padding: 7px 16px;
                    border-radius: 8px;
                    font-size: 12px;
                    font-weight: 600;
                    text-decoration: none;
                    flex-shrink: 0;
                    white-space: nowrap;
                    transition: background 0.2s, transform 0.15s;
                    display: inline-block;
                }
                .db-banner-btn:hover { background: #2563eb; transform: translateY(-1px); }

                /* ─── Metrics Grid ───────────────────────── */
                .db-metrics {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 14px;
                    margin-bottom: 16px;
                }

                /* ─── AI Insight ─────────────────────────── */
                .db-insight {
                    display: flex;
                    gap: 13px;
                    align-items: flex-start;
                    background: rgba(59,130,246,0.04);
                    border: 1px solid rgba(59,130,246,0.14);
                    border-left: 3px solid #3b82f6;
                    border-radius: 12px;
                    padding: 14px 16px;
                    margin-bottom: 16px;
                }
                .db-insight-icon { font-size: 17px; flex-shrink: 0; margin-top: 1px; }
                .db-insight-label {
                    font-size: 9px;
                    font-weight: 700;
                    letter-spacing: 1.4px;
                    color: #3b82f6;
                    margin-bottom: 5px;
                    text-transform: uppercase;
                }
                .db-insight-text {
                    color: var(--text);
                    font-size: 12.5px;
                    line-height: 1.65;
                    margin: 0;
                }

                /* ─── Main grid: chart + feed ────────────── */
                .db-row1 {
                    display: grid;
                    grid-template-columns: 1fr 340px;
                    gap: 14px;
                    margin-bottom: 16px;
                    align-items: stretch;
                }

                /* ─── Bottom row ─────────────────────────── */
                .db-row2 {
                    display: grid;
                    grid-template-columns: 1fr 1fr 220px;
                    gap: 14px;
                }

                /* ─── Panel base ─────────────────────────── */
                .panel {
                    background: var(--bg2);
                    border: 1px solid var(--border);
                    border-radius: 12px;
                    overflow: hidden;
                    min-width: 0;
                    display: flex;
                    flex-direction: column;
                }
                .panel-head {
                    padding: 14px 18px;
                    border-bottom: 1px solid var(--border);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 10px;
                    flex-shrink: 0;
                }
                .panel-title {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--text);
                    white-space: nowrap;
                }
                .panel-sub {
                    font-size: 11px;
                    color: var(--text3);
                    margin-top: 2px;
                }
                .panel-body {
                    padding: 16px 18px;
                    flex: 1;
                    min-width: 0;
                    overflow: hidden;
                }
                .panel-body-flush {
                    flex: 1;
                    min-width: 0;
                    overflow: hidden;
                }

                /* ─── Chart legend ───────────────────────── */
                .chart-legend {
                    display: flex;
                    gap: 16px;
                    flex-shrink: 0;
                    align-items: center;
                }
                .chart-legend-item {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 10.5px;
                    color: var(--text2);
                    white-space: nowrap;
                }

                /* ─── Feed panel fix ──────────────────────── */
                .feed-panel {
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    min-width: 0;
                }

                /* ─── Threat bars ────────────────────────── */
                .tbar {
                    display: grid;
                    grid-template-columns: 120px 1fr 80px;
                    align-items: center;
                    gap: 10px;
                    padding: 8px 0;
                    border-bottom: 1px solid rgba(26,37,53,0.5);
                }
                .tbar:last-child { border-bottom: none; }
                .tbar-name {
                    font-size: 12px;
                    color: var(--text2);
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                .tbar-track {
                    height: 3px;
                    background: var(--bg3);
                    border-radius: 99px;
                    overflow: hidden;
                }
                .tbar-fill {
                    height: 100%;
                    border-radius: 99px;
                    transition: width 0.8s cubic-bezier(.22,1,.36,1);
                }
                .tbar-meta {
                    font-size: 11px;
                    color: var(--text3);
                    text-align: right;
                    white-space: nowrap;
                    overflow: hidden;
                }

                /* ─── Geo ────────────────────────────────── */
                .geo-row {
                    display: grid;
                    grid-template-columns: 22px 1fr 40px 52px 28px;
                    align-items: center;
                    gap: 8px;
                    padding: 7px 0;
                    border-bottom: 1px solid rgba(26,37,53,0.5);
                }
                .geo-row:last-child { border-bottom: none; }
                .geo-flag { font-size: 14px; line-height: 1; text-align: center; }
                .geo-name {
                    font-size: 12px;
                    color: var(--text);
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                .geo-count { font-size: 11px; color: var(--text2); text-align: right; }
                .geo-track { height: 3px; background: var(--bg3); border-radius: 99px; overflow: hidden; }
                .geo-fill  { height: 100%; border-radius: 99px; transition: width 0.7s ease; }
                .geo-pct   { font-size: 10px; color: var(--text3); text-align: right; }

                /* ─── Quick stats ────────────────────────── */
                .qs-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 9px 0;
                    border-bottom: 1px solid rgba(26,37,53,0.5);
                    gap: 8px;
                }
                .qs-row:last-of-type { border-bottom: none; }
                .qs-label { font-size: 11.5px; color: var(--text2); }
                .qs-value { font-size: 12.5px; font-weight: 700; text-align: right; }

                /* ─── Status pill ────────────────────────── */
                .status-pill {
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    padding: 8px 12px;
                    border-radius: 8px;
                    font-size: 11px;
                    font-weight: 500;
                    margin-top: 12px;
                }
                .status-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    flex-shrink: 0;
                }

                /* ═══════════════════════════
                   RESPONSIVE BREAKPOINTS
                   ═══════════════════════════ */

                /* 1280px */
                @media (max-width: 1280px) {
                    .db-row1 { grid-template-columns: 1fr 300px; }
                    .db-row2 { grid-template-columns: 1fr 1fr; }
                    .db-row2 > :last-child { grid-column: 1 / -1; }
                }

                /* 1024px */
                @media (max-width: 1024px) {
                    .db-metrics { grid-template-columns: repeat(2, 1fr); }
                    .db-row1    { grid-template-columns: 1fr; }
                    .db-row2    { grid-template-columns: 1fr 1fr; }
                    .db-row2 > :last-child { grid-column: auto; }
                    .chart-legend { display: none; }
                }

                /* 768px */
                @media (max-width: 768px) {
                    .db { padding: 14px 12px 24px; }
                    .db-metrics { gap: 10px; }
                    .db-row2 { grid-template-columns: 1fr; }
                    .db-banner { flex-direction: column; align-items: flex-start; }
                    .tbar { grid-template-columns: 100px 1fr 68px; }
                    .tbar-name { font-size: 11px; }
                    .tbar-meta { font-size: 10px; }
                    .panel-body { padding: 12px 14px; }
                    .panel-head { padding: 12px 14px; }
                }

                /* 480px */
                @media (max-width: 480px) {
                    .db { padding: 10px 10px 20px; }
                    .db-metrics {
                        grid-template-columns: repeat(2, 1fr);
                        gap: 8px;
                    }
                    .db-title { font-size: 18px; }
                    .tbar { grid-template-columns: 86px 1fr 60px; gap: 7px; }
                    .geo-row { grid-template-columns: 20px 1fr 36px 44px 24px; gap: 6px; }
                    .panel-body { padding: 10px 12px; }
                    .panel-head { padding: 10px 12px; }
                }

                /* 360px */
                @media (max-width: 360px) {
                    .db { padding: 8px 8px 16px; }
                    .db-metrics { gap: 6px; }
                    .db-banner-msg { font-size: 11.5px; }
                }
            `}</style>

            <div className="db animate-fadein">

                {/* ── Demo Banner ──────────────────────────────────── */}
                {isDemo && (
                    <div className="db-banner">
                        <div className="db-banner-text">
                            <span className="db-banner-badge">Demo Mode</span>
                            <span className="db-banner-msg">
                                Viewing simulated data — login to see real WAF traffic &amp; AI insights.
                            </span>
                        </div>
                        <Link href="/login" className="db-banner-btn">
                            Login for Real Data →
                        </Link>
                    </div>
                )}

                {/* ── Page Header ──────────────────────────────────── */}
                <div className="db-header">
                    <div>
                        <h1 className="db-title">Security Overview</h1>
                        <div className="db-subtitle">
                            {!isDemo && <span className="db-live-dot" />}
                            {isDemo
                                ? 'Simulated dashboard — demo data only'
                                : `Live · ${user?.name ?? 'your account'} · updates every 30s`}
                        </div>
                    </div>
                </div>

                {/* ── Metric Cards ─────────────────────────────────── */}
                <div className="db-metrics">
                    {cards.map(c => <MetricCard key={c.label} {...c} isDemo={isDemo} />)}
                </div>

                {/* ── AI Insight ───────────────────────────────────── */}
                {!isDemo && summary?.aiInsight && (
                    <div className="db-insight">
                        <span className="db-insight-icon">🤖</span>
                        <div style={{ minWidth: 0 }}>
                            <div className="db-insight-label">AI Insight · Gemini</div>
                            <p className="db-insight-text">{summary.aiInsight}</p>
                        </div>
                    </div>
                )}

                {/* ── Chart + Live Feed ────────────────────────────── */}
                <div className="db-row1">

                    {/* Traffic Chart */}
                    <div className="panel">
                        <div className="panel-head">
                            <div style={{ minWidth: 0 }}>
                                <div className="panel-title">Traffic Overview</div>
                                <div className="panel-sub">Last 12 hours · requests vs blocked</div>
                            </div>
                            <div className="chart-legend">
                                {[
                                    { c: '#3b82f6', l: 'Requests', dash: false },
                                    { c: '#ef4444', l: 'Blocked',  dash: true  },
                                ].map(({ c, l, dash }) => (
                                    <span key={l} className="chart-legend-item">
                                        <span style={{
                                            width: 18,
                                            height: 2,
                                            background: dash
                                                ? `repeating-linear-gradient(90deg,${c} 0,${c} 4px,transparent 4px,transparent 7px)`
                                                : c,
                                            display: 'inline-block',
                                            borderRadius: dash ? 0 : 1,
                                            flexShrink: 0,
                                        }} />
                                        {l}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="panel-body">
                            <Chart data={traffic} />
                        </div>
                    </div>

                    {/* Live Feed — full height, no scroll leak */}
                    <div className="panel feed-panel">
                        <div className="panel-head">
                            <div style={{ minWidth: 0 }}>
                                <div className="panel-title">Live Threat Feed</div>
                                <div className="panel-sub">{isDemo ? 'Simulated events' : 'Real-time · MongoDB'}</div>
                            </div>
                            <span className="pulse-dot" style={{ flexShrink: 0 }} />
                        </div>
                        {/* flush — no extra padding so ThreatFeed controls its own layout */}
                        <div className="panel-body-flush">
                            <ThreatFeed />
                        </div>
                    </div>
                </div>

                {/* ── Bottom Row ───────────────────────────────────── */}
                <div className="db-row2">

                    {/* Attack Types */}
                    <div className="panel">
                        <div className="panel-head">
                            <div>
                                <div className="panel-title">Attack Types</div>
                                <div className="panel-sub">{isDemo ? 'Simulated breakdown' : 'Blocked logs · MongoDB'}</div>
                            </div>
                        </div>
                        <div className="panel-body">
                            {threats.map(t => (
                                <div key={t.name} className="tbar">
                                    <span className="tbar-name">{t.name}</span>
                                    <div className="tbar-track">
                                        <div className="tbar-fill" style={{ width: `${t.pct}%`, background: t.color }} />
                                    </div>
                                    <span className="tbar-meta">{t.count.toLocaleString()} · {t.pct}%</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Attack Origins */}
                    <div className="panel">
                        <div className="panel-head">
                            <div>
                                <div className="panel-title">Attack Origins</div>
                                <div className="panel-sub">{isDemo ? 'Simulated geography' : 'Real geo · attack logs'}</div>
                            </div>
                        </div>
                        <div className="panel-body">
                            {geo.map(g => (
                                <div key={g.name} className="geo-row">
                                    <span className="geo-flag">{g.flag}</span>
                                    <span className="geo-name">{g.name}</span>
                                    <span className="geo-count">{g.count.toLocaleString()}</span>
                                    <div className="geo-track">
                                        <div className="geo-fill" style={{ width: `${g.pct}%`, background: g.color }} />
                                    </div>
                                    <span className="geo-pct">{g.pct}%</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="panel">
                        <div className="panel-head">
                            <div className="panel-title">Quick Stats</div>
                        </div>
                        <div className="panel-body">
                            {quickStats.map(s => (
                                <div key={s.label} className="qs-row">
                                    <span className="qs-label">{s.label}</span>
                                    <span className="qs-value" style={{ color: s.color }}>{s.value}</span>
                                </div>
                            ))}
                            <div className="status-pill" style={{
                                background: isDemo ? 'rgba(59,130,246,0.07)' : 'rgba(16,185,129,0.07)',
                                border: `1px solid ${isDemo ? 'rgba(59,130,246,0.18)' : 'rgba(16,185,129,0.18)'}`,
                                color: isDemo ? '#3b82f6' : '#10b981',
                            }}>
                                <span className="status-dot" style={{
                                    background: isDemo ? '#3b82f6' : '#10b981',
                                    boxShadow: isDemo ? '0 0 6px #3b82f688' : '0 0 6px #10b98188',
                                }} />
                                {isDemo ? 'Demo · not your DB' : 'Live · MongoDB Atlas'}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </>
    )
}