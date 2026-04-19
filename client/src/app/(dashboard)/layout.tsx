// // 'use client'
// // import { useState } from 'react'
// // import Sidebar from '@/components/Sidebar'
// // import Navbar from '@/components/Navbar'

// // export default function DashboardLayout({ children }: { children: React.ReactNode }) {
// //     const [sidebarOpen, setSidebarOpen] = useState(false)

// //     return (
// //         <div className="flex h-screen overflow-hidden bg-bg">
// //             {/* Sidebar overlay on mobile */}
// //             {sidebarOpen && (
// //                 <div
// //                     className="fixed inset-0 z-20 bg-black/60 lg:hidden"
// //                     onClick={() => setSidebarOpen(false)}
// //                 />
// //             )}

// //             {/* Sidebar */}
// //             <div
// //                 className={`
// //           fixed lg:static inset-y-0 left-0 z-30
// //           w-56 flex-shrink-0 transition-transform duration-200
// //           ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
// //         `}
// //             >
// //                 <Sidebar onClose={() => setSidebarOpen(false)} />
// //             </div>

// //             {/* Main */}
// //             <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
// //                 <Navbar onMenuClick={() => setSidebarOpen(s => !s)} />
// //                 <main className="flex-1 overflow-y-auto p-4 md:p-6">
// //                     {children}
// //                 </main>
// //             </div>
// //         </div>
// //     )
// // }





// // PATH: client/src/app/(dashboard)/layout.tsx
// 'use client'
// import { useState } from 'react'
// import Sidebar from '@/components/Sidebar'
// import Navbar from '@/components/Navbar'

// export default function DashboardLayout({ children }: { children: React.ReactNode }) {
//     const [sidebarOpen, setSidebarOpen] = useState(false)

//     return (
//         <div className="flex h-screen bg-bg overflow-hidden">

//             {/* ── Mobile overlay ── */}
//             {sidebarOpen && (
//                 <div
//                     className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
//                     onClick={() => setSidebarOpen(false)}
//                 />
//             )}

//             {/* ── Sidebar ── */}
//             <aside className={`
//         fixed inset-y-0 left-0 z-40 w-60 flex-shrink-0
//         transform transition-transform duration-300 ease-in-out
//         lg:relative lg:translate-x-0 lg:flex lg:flex-col
//         ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
//       `}>
//                 <Sidebar onClose={() => setSidebarOpen(false)} />
//             </aside>

//             {/* ── Main area ── */}
//             <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
//                 <Navbar onMenuClick={() => setSidebarOpen(true)} />
//                 <main className="flex-1 overflow-y-auto">
//                     <div className="px-4 py-5 sm:px-6 lg:px-8 max-w-screen-2xl mx-auto">
//                         {children}
//                     </div>
//                 </main>
//             </div>

//         </div>
//     )
// }



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