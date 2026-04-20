// PATH: client/src/app/(dashboard)/layout.tsx
'use client'
import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false)

    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg)' }}>

            {/* Mobile overlay */}
            {open && (
                <div
                    onClick={() => setOpen(false)}
                    style={{ position: 'fixed', inset: 0, zIndex: 30, background: 'rgba(0,0,0,.6)' }}
                    className="lg:hidden"
                />
            )}

            {/* Sidebar */}
            <div className={`
        fixed inset-y-0 left-0 z-40 lg:relative lg:flex lg:flex-col
        transition-transform duration-200
        ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
                <Sidebar onClose={() => setOpen(false)} />
            </div>

            {/* Main */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
                <Navbar onMenuClick={() => setOpen(true)} />
                <main style={{ flex: 1, overflowY: 'auto', background: 'var(--bg)', padding: '20px 24px' }}>
                    <div className="animate-fadein">
                        {children}
                    </div>
                </main>
            </div>

        </div>
    )
}