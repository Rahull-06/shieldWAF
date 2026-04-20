// PATH: client/src/app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'
import { ToastProvider } from '@/components/Toast'

export const metadata: Metadata = {
    title: 'ShieldWAF — AI-Powered Web Application Firewall',
    description: 'Real-time WAF protection and attack simulation dashboard',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Syne:wght@400;500;600;700&display=swap" rel="stylesheet" />
            </head>
            <body style={{ margin: 0, background: '#080c10', color: '#dde6f0' }}>
                <ToastProvider>
                    {children}
                </ToastProvider>
            </body>
        </html>
    )
}