// PATH: client/src/app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
    title: 'ShieldWAF — AI-Powered Web Application Firewall',
    description: 'Real-time WAF dashboard',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body style={{ height: '100vh', overflow: 'hidden' }}>{children}</body>
        </html>
    )
}