'use client'
import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
    id: string
    message: string
    type: ToastType
}

interface ToastCtx {
    toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastCtx>({ toast: () => { } })

const COLORS: Record<ToastType, { bg: string; border: string; icon: string; text: string }> = {
    success: { bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.25)', icon: '✓', text: '#4ade80' },
    error: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)', icon: '✕', text: '#f87171' },
    warning: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)', icon: '⚠', text: '#fbbf24' },
    info: { bg: 'rgba(26,108,255,0.1)', border: 'rgba(26,108,255,0.25)', icon: 'ℹ', text: '#60a5fa' },
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([])

    const toast = useCallback((message: string, type: ToastType = 'success') => {
        const id = Math.random().toString(36).slice(2)
        setToasts(prev => [...prev, { id, message, type }])
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
    }, [])

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}

            {/* Toast container */}
            <div style={{
                position: 'fixed', bottom: 20, right: 20, zIndex: 9999,
                display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 340, width: '90vw',
            }}>
                {toasts.map(t => {
                    const c = COLORS[t.type]
                    return (
                        <div key={t.id} style={{
                            background: '#0c1118',
                            border: `1px solid ${c.border}`,
                            borderLeft: `3px solid ${c.text}`,
                            borderRadius: 8, padding: '10px 14px',
                            display: 'flex', alignItems: 'center', gap: 10,
                            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                            animation: 'toast-in 0.25s ease',
                        }}>
                            <span style={{ color: c.text, fontSize: 13, flexShrink: 0 }}>{c.icon}</span>
                            <span style={{ fontSize: 13, color: '#dde6f0', flex: 1 }}>{t.message}</span>
                            <button
                                onClick={() => setToasts(p => p.filter(x => x.id !== t.id))}
                                style={{ background: 'none', border: 'none', color: '#3d5570', cursor: 'pointer', fontSize: 14, padding: 0, lineHeight: 1 }}
                            >✕</button>
                        </div>
                    )
                })}
            </div>

            <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </ToastContext.Provider>
    )
}

export function useToast() {
    return useContext(ToastContext)
}