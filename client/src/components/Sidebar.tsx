'use client'
// PATH: client/src/components/Sidebar.tsx
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const NAV = [
    { href: '/dashboard', label: 'Overview', icon: '▦' },
    { href: '/logs', label: 'Attack Logs', icon: '≡', badge: 'Live' },
    { href: '/rules', label: 'WAF Rules', icon: '⚙', badge: '7' },
    { href: '/simulate', label: 'Simulator', icon: '⚡' },
    { href: '/settings', label: 'Settings', icon: '☰' },
    { href: '/profile', label: 'Profile', icon: '👤' },
]

interface SidebarProps { onClose?: () => void }

export default function Sidebar({ onClose }: SidebarProps) {
    const pathname = usePathname()
    const [collapsed, setCollapsed] = useState(false)

    const W = collapsed ? 56 : 220

    return (
        <aside style={{
            width: W, minWidth: W, height: '100%',
            background: '#0c1118', borderRight: '1px solid #1a2535',
            display: 'flex', flexDirection: 'column',
            transition: 'width 0.2s ease, min-width 0.2s ease',
            overflow: 'hidden', flexShrink: 0,
        }}>
            {/* Logo */}
            <div style={{
                height: 52, display: 'flex', alignItems: 'center',
                padding: collapsed ? '0 14px' : '0 14px',
                borderBottom: '1px solid #1a2535', gap: 10, flexShrink: 0,
            }}>
                <div style={{
                    width: 28, height: 28, background: '#1a6cff', borderRadius: 7,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, flexShrink: 0,
                }}>🛡</div>
                {!collapsed && (
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#dde6f0', letterSpacing: '-0.3px', whiteSpace: 'nowrap' }}>ShieldWAF</div>
                        <div style={{ fontSize: 9, color: '#3d5570', letterSpacing: '1.1px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>AI Firewall</div>
                    </div>
                )}
                <button onClick={() => setCollapsed(c => !c)} title={collapsed ? 'Expand' : 'Collapse'}
                    style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#3d5570', cursor: 'pointer', fontSize: 13, padding: 3, flexShrink: 0, lineHeight: 1, display: 'none' }}
                    className="collapse-btn">
                    {collapsed ? '›' : '‹'}
                </button>
                {onClose && (
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#3d5570', cursor: 'pointer', fontSize: 15, padding: 0, marginLeft: 'auto', lineHeight: 1, display: 'none' }} className="close-btn">✕</button>
                )}
            </div>

            {/* Demo badge */}
            {!collapsed && (
                <div style={{ margin: '8px 10px 0', padding: '6px 10px', borderRadius: 7, background: 'rgba(26,108,255,0.07)', border: '1px solid rgba(26,108,255,0.15)', fontSize: 10.5, color: '#60a5fa', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#1a6cff', flexShrink: 0 }} />
                    Demo Mode · simulated data
                </div>
            )}

            {/* Nav */}
            <nav style={{ flex: 1, padding: '8px 8px 0', overflowY: 'auto', overflowX: 'hidden' }}>
                {!collapsed && <div style={{ fontSize: 9, color: '#243044', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '10px 8px 4px', fontWeight: 600 }}>Navigation</div>}
                {NAV.map(item => {
                    const active = pathname === item.href || pathname.startsWith(item.href + '/')
                    return (
                        <div key={item.href} style={{ marginBottom: 2, position: 'relative' }}>
                            <Link href={item.href} onClick={onClose} title={collapsed ? item.label : undefined}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: collapsed ? 0 : 9,
                                    padding: collapsed ? '9px 0' : '8px 10px',
                                    justifyContent: collapsed ? 'center' : 'flex-start',
                                    borderRadius: 7, textDecoration: 'none', fontSize: 12.5,
                                    color: active ? '#1a6cff' : '#8899b0',
                                    background: active ? 'rgba(26,108,255,0.1)' : 'transparent',
                                    fontWeight: active ? 600 : 400,
                                    whiteSpace: 'nowrap', overflow: 'hidden',
                                    transition: 'background 0.15s, color 0.15s',
                                }}
                                onMouseEnter={e => { if (!active) { const el = e.currentTarget as HTMLAnchorElement; el.style.background = 'rgba(255,255,255,0.03)'; el.style.color = '#dde6f0' } }}
                                onMouseLeave={e => { if (!active) { const el = e.currentTarget as HTMLAnchorElement; el.style.background = 'transparent'; el.style.color = '#8899b0' } }}
                            >
                                <span style={{ fontSize: 12, flexShrink: 0, width: 14, textAlign: 'center' }}>{item.icon}</span>
                                {!collapsed && (
                                    <>
                                        <span style={{ flex: 1 }}>{item.label}</span>
                                        {item.badge && (
                                            <span style={{ fontSize: 9.5, padding: '1px 6px', borderRadius: 99, fontWeight: 600, background: item.badge === 'Live' ? 'rgba(239,68,68,0.12)' : 'rgba(26,108,255,0.12)', color: item.badge === 'Live' ? '#f87171' : '#60a5fa', border: `1px solid ${item.badge === 'Live' ? 'rgba(239,68,68,0.2)' : 'rgba(26,108,255,0.2)'}` }}>{item.badge}</span>
                                        )}
                                    </>
                                )}
                            </Link>
                        </div>
                    )
                })}
            </nav>

            {/* Footer status */}
            {!collapsed && (
                <div style={{ borderTop: '1px solid #1a2535', padding: '12px 14px', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#3d5570' }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', flexShrink: 0, animation: 'pulse-ring 1.5s ease-in-out infinite' }} />
                        WAF Active · 7 rules enforced
                    </div>
                </div>
            )}

            <style>{`
        @media (min-width: 1024px) { .collapse-btn { display: block !important; } }
        @media (max-width: 1023px) { .close-btn { display: block !important; } }
        @keyframes pulse-ring {
          0%,100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.5); }
          50% { box-shadow: 0 0 0 4px rgba(34,197,94,0); }
        }
      `}</style>
        </aside>
    )
}