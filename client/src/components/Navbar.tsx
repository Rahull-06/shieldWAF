'use client'
// PATH: client/src/components/Navbar.tsx
import { usePathname } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

const PAGE_META: Record<string, { title: string; sub: string }> = {
    '/dashboard': { title: 'Security Overview', sub: 'Real-time threat intelligence' },
    '/logs': { title: 'Attack Logs', sub: 'Full audit trail of blocked requests' },
    '/rules': { title: 'WAF Rules', sub: 'Manage detection & filtering rules' },
    '/simulate': { title: 'Attack Simulator', sub: 'Test your WAF against OWASP attacks' },
    '/settings': { title: 'Settings', sub: 'Platform configuration' },
    '/profile': { title: 'Profile', sub: 'Account settings & usage' },
}

export default function Navbar({ onMenuClick }: { onMenuClick?: () => void }) {
    const pathname = usePathname()
    const meta = PAGE_META[pathname] || { title: 'ShieldWAF', sub: '' }
    const [dropOpen, setDropOpen] = useState(false)
    const dropRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    return (
        <header style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, padding: '0 20px', background: '#0c1118', borderBottom: '1px solid #1a2535' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button onClick={onMenuClick} style={{ background: 'none', border: 'none', color: '#8899b0', cursor: 'pointer', fontSize: 17, padding: 0, lineHeight: 1, display: 'none' }} className="hamburger-btn" aria-label="Toggle menu">☰</button>
                <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#dde6f0', letterSpacing: '-0.2px' }}>{meta.title}</div>
                    <div style={{ fontSize: 10.5, color: '#3d5570' }} className="page-sub">{meta.sub}</div>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 500, padding: '4px 10px', borderRadius: 99, background: 'rgba(239,68,68,0.08)', color: '#f87171', border: '1px solid rgba(239,68,68,0.15)' }} className="threat-pill">
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#ef4444', animation: 'blink 1.5s ease-in-out infinite' }} />
                    3 Active Threats
                </div>
                <div ref={dropRef} style={{ position: 'relative' }}>
                    <button onClick={() => setDropOpen(d => !d)} style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#1a6cff,#8b5cf6)', fontSize: 11, fontWeight: 700, color: '#fff' }}>AD</button>
                    {dropOpen && (
                        <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 100, background: '#0c1118', border: '1px solid #1a2535', borderRadius: 10, minWidth: 200, boxShadow: '0 12px 32px rgba(0,0,0,0.5)', animation: 'fadein 0.15s ease' }}>
                            <div style={{ padding: '14px 16px', borderBottom: '1px solid #1a2535' }}>
                                <div style={{ fontSize: 13, fontWeight: 600, color: '#dde6f0' }}>Admin User</div>
                                <div style={{ fontSize: 11, color: '#3d5570', marginTop: 2 }}>admin@shieldwaf.io</div>
                                <span style={{ display: 'inline-block', marginTop: 6, fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.07em', background: 'rgba(26,108,255,0.12)', color: '#60a5fa', border: '1px solid rgba(26,108,255,0.2)' }}>Administrator</span>
                            </div>
                            <div style={{ padding: '6px 0' }}>
                                {[{ href: '/profile', icon: '👤', label: 'Profile' }, { href: '/settings', icon: '⚙', label: 'Settings' }].map(item => (
                                    <Link key={item.href} href={item.href} onClick={() => setDropOpen(false)}
                                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', textDecoration: 'none', fontSize: 13, color: '#8899b0' }}
                                        onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = 'rgba(255,255,255,0.03)'; el.style.color = '#dde6f0' }}
                                        onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = 'transparent'; el.style.color = '#8899b0' }}>
                                        <span style={{ fontSize: 12 }}>{item.icon}</span>{item.label}
                                    </Link>
                                ))}
                            </div>
                            <div style={{ borderTop: '1px solid #1a2535', padding: '6px 0' }}>
                                <button onClick={() => setDropOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', width: '100%', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#f87171', textAlign: 'left' }}
                                    onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.06)')}
                                    onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = 'transparent')}>
                                    <span style={{ fontSize: 12 }}>⎋</span>Sign Out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
        @media (max-width:1023px){ .hamburger-btn{display:block!important;} .threat-pill{display:none!important;} }
        @media (max-width:480px){ .page-sub{display:none!important;} }
        @keyframes blink{0%,100%{opacity:1;}50%{opacity:0.4;}}
        @keyframes fadein{from{opacity:0;transform:translateY(4px);}to{opacity:1;transform:none;}}
      `}</style>
        </header>
    )
}