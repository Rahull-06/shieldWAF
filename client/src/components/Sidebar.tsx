// // PATH: client/src/components/Sidebar.tsx
// 'use client'
// import Link from 'next/link'
// import { usePathname } from 'next/navigation'

// interface NavItem {
//     href: string
//     label: string
//     icon: React.ReactNode
//     badge?: { text: string; variant: 'red' | 'blue' | 'green' }
// }

// const ShieldIcon = () => (
//     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//         <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
//     </svg>
// )
// const GridIcon = () => (
//     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//         <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
//         <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
//     </svg>
// )
// const ListIcon = () => (
//     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//         <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" />
//         <line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" />
//         <line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
//     </svg>
// )
// const RulesIcon = () => (
//     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//         <circle cx="12" cy="12" r="3" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
//     </svg>
// )
// const ZapIcon = () => (
//     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//         <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
//     </svg>
// )
// const SettingsIcon = () => (
//     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//         <circle cx="12" cy="12" r="3" />
//         <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
//     </svg>
// )
// const LogoutIcon = () => (
//     <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//         <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
//         <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
//     </svg>
// )

// const NAV: NavItem[] = [
//     { href: '/dashboard', label: 'Overview', icon: <GridIcon />, },
//     { href: '/logs', label: 'Attack Logs', icon: <ListIcon />, badge: { text: 'Live', variant: 'red' } },
//     { href: '/rules', label: 'WAF Rules', icon: <RulesIcon />, },
//     { href: '/simulate', label: 'Simulator', icon: <ZapIcon />, },
//     { href: '/settings', label: 'Settings', icon: <SettingsIcon />, },
// ]

// interface SidebarProps { onClose?: () => void }

// export default function Sidebar({ onClose }: SidebarProps) {
//     const pathname = usePathname()

//     return (
//         <div className="flex flex-col h-full w-60 bg-bg2 border-r border-border1">

//             {/* Logo */}
//             <div className="flex items-center gap-3 px-5 h-14 border-b border-border1 flex-shrink-0">
//                 <div className="w-7 h-7 rounded-lg bg-blue flex items-center justify-center text-white flex-shrink-0">
//                     <ShieldIcon />
//                 </div>
//                 <div>
//                     <div className="text-[13px] font-bold text-text1 tracking-tight leading-none">ShieldWAF</div>
//                     <div className="text-[10px] text-text3 mt-0.5 tracking-wide">AI Firewall</div>
//                 </div>
//             </div>

//             {/* Nav */}
//             <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
//                 <div className="px-3 mb-3">
//                     <span className="text-[9.5px] font-semibold text-text4 uppercase tracking-[1px]">Navigation</span>
//                 </div>
//                 {NAV.map(item => {
//                     const active = pathname === item.href || pathname.startsWith(item.href + '/')
//                     return (
//                         <Link
//                             key={item.href}
//                             href={item.href}
//                             onClick={onClose}
//                             className={`
//                 group flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium
//                 transition-all duration-150 relative
//                 ${active
//                                     ? 'bg-blue/10 text-blue'
//                                     : 'text-text2 hover:bg-white/[.04] hover:text-text1'
//                                 }
//               `}
//                         >
//                             {/* Active indicator */}
//                             {active && (
//                                 <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue rounded-r-full" />
//                             )}
//                             <span className={`flex-shrink-0 transition-colors ${active ? 'text-blue' : 'text-text3 group-hover:text-text2'}`}>
//                                 {item.icon}
//                             </span>
//                             <span className="flex-1 truncate">{item.label}</span>
//                             {item.badge && (
//                                 <span className={`
//                   text-[9.5px] px-1.5 py-0.5 rounded font-semibold tracking-wide flex-shrink-0
//                   ${item.badge.variant === 'red' ? 'bg-red/10 text-red-400' : ''}
//                   ${item.badge.variant === 'blue' ? 'bg-blue/10 text-blue' : ''}
//                   ${item.badge.variant === 'green' ? 'bg-green/10 text-green-400' : ''}
//                 `}>
//                                     {item.badge.text}
//                                 </span>
//                             )}
//                         </Link>
//                     )
//                 })}
//             </nav>

//             {/* Footer */}
//             <div className="px-3 py-3 border-t border-border1 flex-shrink-0">
//                 <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-white/[.04] transition-colors group cursor-pointer">
//                     <div className="w-7 h-7 rounded-full bg-blue/10 border border-blue/20 flex items-center justify-center flex-shrink-0">
//                         <span className="text-[11px] font-bold text-blue">AD</span>
//                     </div>
//                     <div className="flex-1 min-w-0">
//                         <div className="text-[12px] font-semibold text-text1 truncate">Admin</div>
//                         <div className="text-[10px] text-text3 truncate">admin@shieldwaf.io</div>
//                     </div>
//                     <span className="text-text3 group-hover:text-text2 transition-colors flex-shrink-0">
//                         <LogoutIcon />
//                     </span>
//                 </div>
//             </div>

//         </div>
//     )
// }






// PATH: client/src/components/Sidebar.tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
    {
        href: '/dashboard', label: 'Overview',
        icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>,
    },
    {
        href: '/logs', label: 'Attack Logs',
        badge: { text: 'Live', cls: 'red' },
        icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>,
    },
    {
        href: '/rules', label: 'WAF Rules',
        badge: { text: '247', cls: 'blue' },
        icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
    },
    {
        href: '/simulate', label: 'Simulator',
        icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>,
    },
    {
        href: '/settings', label: 'Settings',
        icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>,
    },
]

const BADGE_STYLE: Record<string, React.CSSProperties> = {
    red: { background: 'var(--red-dim)', color: '#fca5a5' },
    blue: { background: 'var(--blue-dim)', color: '#60a5fa' },
}

export default function Sidebar({ onClose }: { onClose?: () => void }) {
    const pathname = usePathname()

    return (
        <div style={{
            width: 220, minWidth: 220,
            background: 'var(--bg2)',
            borderRight: '1px solid var(--border)',
            display: 'flex', flexDirection: 'column',
            height: '100vh', overflow: 'hidden',
        }}>

            {/* Logo */}
            <div style={{ padding: '18px 20px 16px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        width: 32, height: 32, background: 'var(--blue)', borderRadius: 8,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                    </div>
                    <div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: '#f1f5f9', letterSpacing: '-.3px' }}>ShieldWAF</div>
                        <div style={{ fontSize: 9, color: 'var(--text3)', marginTop: 1, letterSpacing: '1.4px', textTransform: 'uppercase' }}>AI Firewall</div>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
                <div style={{ fontSize: 10, color: 'var(--text4)', letterSpacing: '1.1px', textTransform: 'uppercase', padding: '10px 20px 5px', fontWeight: 500 }}>
                    Navigation
                </div>
                {NAV.map(item => {
                    const active = pathname === item.href || pathname.startsWith(item.href + '/')
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onClose}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 9,
                                padding: '8px 12px', margin: '1px 8px',
                                borderRadius: 7, cursor: 'pointer',
                                color: active ? '#60a5fa' : 'var(--text3)',
                                fontSize: 12.5, fontWeight: 500,
                                background: active ? 'var(--blue-dim)' : 'transparent',
                                textDecoration: 'none',
                                transition: 'all .12s',
                                position: 'relative',
                                userSelect: 'none',
                            }}
                            onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.03)'; (e.currentTarget as HTMLElement).style.color = 'var(--text2)'; } }}
                            onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text3)'; } }}
                        >
                            <span style={{ opacity: .85, flexShrink: 0, display: 'flex' }}>{item.icon}</span>
                            <span style={{ flex: 1 }}>{item.label}</span>
                            {item.badge && (
                                <span style={{
                                    marginLeft: 'auto', fontSize: 10, padding: '1px 6px',
                                    borderRadius: 10, fontWeight: 600,
                                    ...BADGE_STYLE[item.badge.cls],
                                }}>{item.badge.text}</span>
                            )}
                        </Link>
                    )
                })}
            </nav>

            {/* Footer */}
            <div style={{ marginTop: 'auto', padding: '14px 16px', borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'var(--text3)' }}>
                    <span className="pulse-dot" />
                    <span>WAF Protection Active</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text4)', marginTop: 3 }}>247 rules enforced</div>
            </div>

        </div>
    )
}