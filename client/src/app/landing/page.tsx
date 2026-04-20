'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const TICKER = [
    "SQL Injection blocked — 185.220.101.4",
    "XSS attempt blocked — 103.21.244.0",
    "Path Traversal blocked — 178.62.55.19",
    "Brute Force stopped — 172.16.0.45",
    "SSRF blocked — 5.188.10.51",
]

const FEATURES = [
    {
        icon: '⛔',
        title: 'Real-Time Blocking',
        desc: 'Instantly detect and block SQL injection, XSS, path traversal, and 20+ attack types before they hit your server.',
    },
    {
        icon: '⚡',
        title: 'Attack Simulator',
        desc: 'Test your WAF against OWASP Top 10 attacks with our interactive simulator. See how each payload is analyzed.',
    },
    {
        icon: '📊',
        title: 'Live Threat Feed',
        desc: 'Real-time stream of all incoming requests with risk scoring, geo-location, and payload inspection.',
    },
    {
        icon: '⚙',
        title: 'Custom Rules Engine',
        desc: 'Write and manage custom WAF rules. Enable, disable, or fine-tune detection sensitivity per attack category.',
    },
    {
        icon: '🌍',
        title: 'Geo Intelligence',
        desc: 'Visualise attack origins on a world map. Identify and block high-risk regions with one click.',
    },
    {
        icon: '🔐',
        title: 'Audit Logs',
        desc: 'Full audit trail of every blocked and allowed request. Filter by severity, attack type, IP, and more.',
    },
]

const STATS = [
    { value: '2.4M+', label: 'Requests Analyzed' },
    { value: '18K+', label: 'Attacks Blocked' },
    { value: '99.98%', label: 'WAF Uptime' },
    { value: '8', label: 'OWASP Rules Active' },
]

function TickerBar() {
    const [index, setIndex] = useState(0)
    const [visible, setVisible] = useState(true)

    useEffect(() => {
        const interval = setInterval(() => {
            setVisible(false)
            setTimeout(() => {
                setIndex(i => (i + 1) % TICKER.length)
                setVisible(true)
            }, 300)
        }, 2800)
        return () => clearInterval(interval)
    }, [])

    return (
        <div style={{
            background: 'rgba(239,68,68,0.08)',
            borderBottom: '1px solid rgba(239,68,68,0.15)',
            padding: '7px 0',
            textAlign: 'center',
            fontSize: 11,
            color: '#f87171',
            letterSpacing: '0.04em',
            fontFamily: 'IBM Plex Mono, monospace',
            transition: 'opacity 0.3s',
            opacity: visible ? 1 : 0,
        }}>
            🛡 LIVE — {TICKER[index]}
        </div>
    )
}

export default function LandingPage() {
    const [menuOpen, setMenuOpen] = useState(false)

    return (
        <div style={{ background: '#080c10', minHeight: '100vh', color: '#dde6f0' }}>

            {/* Live ticker */}
            <TickerBar />

            {/* Navbar */}
            <nav style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 24px', height: 56,
                borderBottom: '1px solid #1a2535',
                background: 'rgba(8,12,16,0.95)',
                backdropFilter: 'blur(12px)',
                position: 'sticky', top: 0, zIndex: 50,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        width: 30, height: 30, background: '#1a6cff', borderRadius: 8,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 14, flexShrink: 0,
                    }}>🛡</div>
                    <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#dde6f0', letterSpacing: '-0.3px' }}>ShieldWAF</div>
                        <div style={{ fontSize: 9, color: '#3d5570', letterSpacing: '1.2px', textTransform: 'uppercase' }}>AI Firewall</div>
                    </div>
                </div>

                {/* Desktop nav */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} className="desktop-nav">
                    <Link href="/dashboard" style={{ fontSize: 13, color: '#8899b0', padding: '6px 12px', borderRadius: 6, textDecoration: 'none', transition: 'color 0.15s' }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#dde6f0')}
                        onMouseLeave={e => (e.currentTarget.style.color = '#8899b0')}>
                        Dashboard
                    </Link>
                    <Link href="/dashboard/simulate" style={{ fontSize: 13, color: '#8899b0', padding: '6px 12px', borderRadius: 6, textDecoration: 'none' }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#dde6f0')}
                        onMouseLeave={e => (e.currentTarget.style.color = '#8899b0')}>
                        Simulator
                    </Link>
                    <Link href="/login" style={{
                        fontSize: 13, color: '#8899b0', padding: '6px 12px', borderRadius: 6,
                        border: '1px solid #1a2535', textDecoration: 'none', marginLeft: 4,
                    }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#dde6f0'; e.currentTarget.style.borderColor = '#243044' }}
                        onMouseLeave={e => { e.currentTarget.style.color = '#8899b0'; e.currentTarget.style.borderColor = '#1a2535' }}>
                        Login
                    </Link>
                    <Link href="/dashboard" style={{
                        fontSize: 13, color: '#fff', padding: '6px 16px', borderRadius: 6,
                        background: '#1a6cff', textDecoration: 'none', fontWeight: 600,
                        transition: 'opacity 0.15s',
                    }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
                        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                        Try Demo →
                    </Link>
                </div>

                {/* Mobile hamburger */}
                <button onClick={() => setMenuOpen(m => !m)} style={{
                    background: 'none', border: 'none', color: '#8899b0', cursor: 'pointer',
                    fontSize: 18, padding: 4, display: 'none',
                }} className="mobile-menu-btn">☰</button>
            </nav>

            {/* Mobile menu */}
            {menuOpen && (
                <div style={{
                    background: '#0c1118', borderBottom: '1px solid #1a2535',
                    padding: '12px 24px', display: 'flex', flexDirection: 'column', gap: 4,
                }}>
                    {[
                        { href: '/dashboard', label: 'Dashboard' },
                        { href: '/dashboard/simulate', label: 'Simulator' },
                        { href: '/login', label: 'Login' },
                    ].map(item => (
                        <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} style={{
                            fontSize: 14, color: '#8899b0', padding: '10px 0',
                            borderBottom: '1px solid #1a2535', textDecoration: 'none',
                        }}>
                            {item.label}
                        </Link>
                    ))}
                    <Link href="/dashboard" style={{
                        fontSize: 14, color: '#fff', padding: '10px 16px', borderRadius: 6,
                        background: '#1a6cff', textDecoration: 'none', textAlign: 'center',
                        fontWeight: 600, marginTop: 8,
                    }}>
                        Try Demo →
                    </Link>
                </div>
            )}

            {/* Hero */}
            <section style={{ padding: '80px 24px 72px', textAlign: 'center', maxWidth: 760, margin: '0 auto' }}>
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    fontSize: 11, color: '#1a6cff', letterSpacing: '0.08em', textTransform: 'uppercase',
                    background: 'rgba(26,108,255,0.08)', border: '1px solid rgba(26,108,255,0.2)',
                    padding: '5px 12px', borderRadius: 99, marginBottom: 28, fontWeight: 600,
                }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#1a6cff', display: 'inline-block', animation: 'pulse-ring 1.5s ease-in-out infinite' }} />
                    Final Year Security Project
                </div>

                <h1 style={{
                    fontSize: 'clamp(32px, 6vw, 58px)', fontWeight: 700, lineHeight: 1.1,
                    letterSpacing: '-1.5px', marginBottom: 20, color: '#dde6f0',
                }}>
                    AI-Powered Web{' '}
                    <span style={{ color: '#1a6cff' }}>Application</span>{' '}
                    Firewall
                </h1>

                <p style={{
                    fontSize: 'clamp(14px, 2vw, 17px)', color: '#8899b0', lineHeight: 1.7,
                    marginBottom: 36, maxWidth: 560, margin: '0 auto 36px',
                }}>
                    ShieldWAF detects and blocks OWASP Top 10 attacks in real time. Monitor traffic, simulate attacks, and manage security rules — all from one clean dashboard.
                </p>

                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link href="/dashboard" style={{
                        fontSize: 14, color: '#fff', padding: '11px 24px', borderRadius: 8,
                        background: '#1a6cff', textDecoration: 'none', fontWeight: 600,
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                    }}>
                        🚀 Try Live Demo
                    </Link>
                    <Link href="/dashboard/simulate" style={{
                        fontSize: 14, color: '#dde6f0', padding: '11px 24px', borderRadius: 8,
                        border: '1px solid #1a2535', textDecoration: 'none', fontWeight: 500,
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                    }}>
                        ⚡ Attack Simulator
                    </Link>
                </div>

                {/* Hero note */}
                <p style={{ fontSize: 11, color: '#3d5570', marginTop: 16 }}>
                    No login required · Demo mode · All data is simulated
                </p>
            </section>

            {/* Stats strip */}
            <div style={{ borderTop: '1px solid #1a2535', borderBottom: '1px solid #1a2535', background: '#0c1118' }}>
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                    maxWidth: 900, margin: '0 auto',
                }}>
                    {STATS.map((s, i) => (
                        <div key={s.label} style={{
                            padding: '24px 16px', textAlign: 'center',
                            borderRight: i < STATS.length - 1 ? '1px solid #1a2535' : 'none',
                        }}>
                            <div style={{ fontSize: 28, fontWeight: 700, color: '#dde6f0', letterSpacing: '-1px', lineHeight: 1 }}>
                                {s.value}
                            </div>
                            <div style={{ fontSize: 11, color: '#3d5570', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                                {s.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Features */}
            <section style={{ padding: '72px 24px', maxWidth: 960, margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: 48 }}>
                    <div style={{ fontSize: 11, color: '#3d5570', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
                        What ShieldWAF does
                    </div>
                    <h2 style={{ fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 700, color: '#dde6f0', letterSpacing: '-0.8px' }}>
                        Everything you need, nothing you don't
                    </h2>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                    gap: 16,
                }}>
                    {FEATURES.map(f => (
                        <div key={f.title} style={{
                            background: '#0c1118', border: '1px solid #1a2535', borderRadius: 12,
                            padding: '22px 24px',
                            transition: 'border-color 0.2s, transform 0.2s',
                            cursor: 'default',
                        }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLDivElement).style.borderColor = '#243044'
                                    ; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLDivElement).style.borderColor = '#1a2535'
                                    ; (e.currentTarget as HTMLDivElement).style.transform = 'none'
                            }}
                        >
                            <div style={{ fontSize: 22, marginBottom: 12 }}>{f.icon}</div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: '#dde6f0', marginBottom: 6 }}>{f.title}</div>
                            <div style={{ fontSize: 13, color: '#8899b0', lineHeight: 1.6 }}>{f.desc}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Simulator CTA */}
            <section style={{
                margin: '0 24px 72px', maxWidth: 760, marginLeft: 'auto', marginRight: 'auto',
                background: 'linear-gradient(135deg, rgba(26,108,255,0.08) 0%, rgba(139,92,246,0.06) 100%)',
                border: '1px solid rgba(26,108,255,0.15)', borderRadius: 16, padding: '40px 32px',
                textAlign: 'center',
            }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>⚡</div>
                <h3 style={{ fontSize: 'clamp(18px, 3vw, 24px)', fontWeight: 700, color: '#dde6f0', marginBottom: 10, letterSpacing: '-0.5px' }}>
                    Try the Attack Simulator
                </h3>
                <p style={{ fontSize: 13, color: '#8899b0', lineHeight: 1.6, marginBottom: 24, maxWidth: 420, margin: '0 auto 24px' }}>
                    Simulate SQL injection, XSS, path traversal and more. See exactly how ShieldWAF analyzes and blocks each attack in real time.
                </p>
                <Link href="/dashboard/simulate" style={{
                    fontSize: 14, color: '#fff', padding: '11px 28px', borderRadius: 8,
                    background: '#1a6cff', textDecoration: 'none', fontWeight: 600,
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                }}>
                    ⚡ Open Simulator
                </Link>
            </section>

            {/* Footer */}
            <footer style={{
                borderTop: '1px solid #1a2535', padding: '24px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
                maxWidth: 960, margin: '0 auto',
            }}>
                <div style={{ fontSize: 12, color: '#3d5570' }}>
                    ShieldWAF · Final Year Project · Built with Next.js + MongoDB
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                    {[
                        { href: '/dashboard', label: 'Dashboard' },
                        { href: '/dashboard/simulate', label: 'Simulator' },
                        { href: '/login', label: 'Login' },
                    ].map(l => (
                        <Link key={l.href} href={l.href} style={{ fontSize: 12, color: '#3d5570', textDecoration: 'none' }}
                            onMouseEnter={e => (e.currentTarget.style.color = '#8899b0')}
                            onMouseLeave={e => (e.currentTarget.style.color = '#3d5570')}>
                            {l.label}
                        </Link>
                    ))}
                </div>
            </footer>

            <style>{`
        @media (max-width: 640px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
        @media (min-width: 641px) {
          .desktop-nav { display: flex !important; }
          .mobile-menu-btn { display: none !important; }
        }
        @keyframes pulse-ring {
          0%, 100% { box-shadow: 0 0 0 0 rgba(26,108,255,0.5); }
          50% { box-shadow: 0 0 0 5px rgba(26,108,255,0); }
        }
      `}</style>
        </div>
    )
}