// // PATH: client/src/components/Navbar.tsx
// 'use client'

// interface NavbarProps {
//     onMenuClick: () => void
// }

// const MenuIcon = () => (
//     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//         <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
//     </svg>
// )
// const BellIcon = () => (
//     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//         <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
//         <path d="M13.73 21a2 2 0 0 1-3.46 0" />
//     </svg>
// )

// export default function Navbar({ onMenuClick }: NavbarProps) {
//     return (
//         <header className="flex items-center justify-between h-14 px-4 sm:px-6 bg-bg2 border-b border-border1 flex-shrink-0">

//             {/* Left — hamburger (mobile) + page info */}
//             <div className="flex items-center gap-3">
//                 <button
//                     onClick={onMenuClick}
//                     className="lg:hidden p-1.5 rounded-lg text-text3 hover:text-text2 hover:bg-white/[.05] transition-colors"
//                 >
//                     <MenuIcon />
//                 </button>

//                 {/* Status pill */}
//                 <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green/[.08] border border-green/[.15]">
//                     <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse flex-shrink-0" />
//                     <span className="text-[11px] font-medium text-green-400 tracking-wide">WAF Active</span>
//                 </div>
//             </div>

//             {/* Right — threat pill + notifications + avatar */}
//             <div className="flex items-center gap-2">

//                 {/* Active threats */}
//                 <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red/[.08] border border-red/[.15]">
//                     <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse flex-shrink-0" />
//                     <span className="text-[11px] font-medium text-red-400">3 Active Threats</span>
//                 </div>

//                 {/* Notifications */}
//                 <button className="relative p-2 rounded-lg text-text3 hover:text-text2 hover:bg-white/[.05] transition-colors">
//                     <BellIcon />
//                     <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500" />
//                 </button>

//                 {/* Avatar */}
//                 <div className="w-8 h-8 rounded-full bg-blue/10 border border-blue/20 flex items-center justify-center cursor-pointer hover:border-blue/40 transition-colors">
//                     <span className="text-[11px] font-bold text-blue">AD</span>
//                 </div>

//             </div>
//         </header>
//     )
// }
// PATH: client/src/components/Navbar.tsx
'use client'
import { usePathname } from 'next/navigation'

const PAGE_TITLES: Record<string, { title: string; sub: string }> = {
    '/dashboard': { title: 'Security Overview', sub: 'Real-time threat intelligence' },
    '/logs': { title: 'Attack Logs', sub: 'Full audit trail of blocked requests' },
    '/rules': { title: 'WAF Rules', sub: 'Manage detection & filtering rules' },
    '/simulate': { title: 'Attack Simulator', sub: 'Test your WAF against OWASP attacks' },
    '/settings': { title: 'Settings', sub: 'Platform configuration' },
}

export default function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
    const pathname = usePathname()
    const page = PAGE_TITLES[pathname] ?? { title: 'ShieldWAF', sub: '' }

    return (
        <div style={{
            height: 52,
            background: 'var(--bg2)',
            borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 24px', flexShrink: 0,
        }}>

            {/* Left */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {/* Mobile hamburger */}
                <button
                    onClick={onMenuClick}
                    className="lg:hidden"
                    style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: 4, display: 'flex' }}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                    </svg>
                </button>
                <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', letterSpacing: '-.2px' }}>{page.title}</div>
                    {page.sub && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 1 }}>{page.sub}</div>}
                </div>
            </div>

            {/* Right */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

                {/* Threat pill */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    fontSize: 11, fontWeight: 500, padding: '4px 10px', borderRadius: 5,
                    background: 'var(--red-dim)', color: '#fca5a5',
                    border: '1px solid rgba(239,68,68,.2)',
                }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--red)', display: 'block', animation: 'pulse-glow 1s infinite' }} />
                    3 Active Threats
                </div>

                {/* Avatar */}
                <div style={{
                    width: 30, height: 30, borderRadius: '50%',
                    background: 'linear-gradient(135deg,#1a6cff,#7c3aed)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 600, cursor: 'pointer',
                }}>AD</div>

            </div>
        </div>
    )
}





