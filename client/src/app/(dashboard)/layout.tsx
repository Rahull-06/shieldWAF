// PATH: client/src/app/(dashboard)/layout.tsx
'use client'
import { useState, useEffect, useRef } from 'react'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setSidebarOpen(false)
    }, [])

    return (
        <>
            <style>{`
        .dash-app { display: flex; height: 100vh; overflow: hidden; background: var(--bg); }
        .dash-sidebar-overlay {
          display: none; position: fixed; inset: 0; z-index: 30;
          background: rgba(0,0,0,.65); backdrop-filter: blur(2px);
        }
        .dash-sidebar-wrap {
          position: relative; z-index: 40; flex-shrink: 0;
          transition: transform .22s cubic-bezier(.4,0,.2,1);
        }
        .dash-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
        .dash-content { flex: 1; overflow-y: auto; padding: 20px 24px; }

        /* Mobile */
        @media (max-width: 1023px) {
          .dash-sidebar-wrap {
            position: fixed; top: 0; left: 0; bottom: 0;
            transform: translateX(-100%);
          }
          .dash-sidebar-wrap.open { transform: translateX(0); }
          .dash-sidebar-overlay.open { display: block; }
        }

        /* Tablet content padding */
        @media (max-width: 768px) {
          .dash-content { padding: 16px; }
        }
        @media (max-width: 480px) {
          .dash-content { padding: 12px; }
        }
      `}</style>

            <div className="dash-app">
                {/* Overlay */}
                <div
                    className={`dash-sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
                    onClick={() => setSidebarOpen(false)}
                />

                {/* Sidebar */}
                <div className={`dash-sidebar-wrap ${sidebarOpen ? 'open' : ''}`}>
                    <Sidebar onClose={() => setSidebarOpen(false)} />
                </div>

                {/* Main */}
                <div className="dash-main">
                    <Navbar onMenuClick={() => setSidebarOpen(v => !v)} />
                    <div className="dash-content">
                        <div className="animate-fadein">{children}</div>
                    </div>
                </div>
            </div>
        </>
    )
}