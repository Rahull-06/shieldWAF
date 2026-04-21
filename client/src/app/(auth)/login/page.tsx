'use client'
// PATH: client/src/app/(auth)/login/page.tsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

type Tab = 'login' | 'register'

export default function LoginPage() {
    const router = useRouter()
    const { login, register } = useAuth()
    const [tab, setTab] = useState<Tab>('login')
    const [name, setName] = useState('')
    const [email, setEmail] = useState('admin@shieldwaf.io')
    const [password, setPassword] = useState('password123')
    const [confirm, setConfirm] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const switchTab = (t: Tab) => {
        setTab(t); setError('')
        if (t === 'login') { setEmail('admin@shieldwaf.io'); setPassword('password123') }
        else { setEmail(''); setPassword('') }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setError(''); setLoading(true)
        try {
            if (tab === 'login') {
                await login(email, password)
            } else {
                if (!name.trim()) throw new Error('Name is required.')
                if (password !== confirm) throw new Error('Passwords do not match.')
                if (password.length < 6) throw new Error('Password must be at least 6 characters.')
                await register(name, email, password)
            }
            router.push('/dashboard')
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Something went wrong.')
        } finally {
            setLoading(false)
        }
    }

    const inp: React.CSSProperties = {
        width: '100%', background: '#101620', border: '1px solid #1a2535',
        color: '#dde6f0', fontSize: 13, padding: '9px 12px', borderRadius: 7,
        outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
    }

    return (
        <div style={{ width: '100%', maxWidth: 380, animation: 'fadein 0.25s ease' }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28, justifyContent: 'center' }}>
                <div style={{ width: 34, height: 34, background: '#1a6cff', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🛡</div>
                <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#dde6f0', letterSpacing: '-0.3px' }}>ShieldWAF</div>
                    <div style={{ fontSize: 9, color: '#3d5570', letterSpacing: '1.2px', textTransform: 'uppercase' }}>Security Dashboard</div>
                </div>
            </div>

            <div style={{ background: '#0c1118', border: '1px solid #1a2535', borderRadius: 14, overflow: 'hidden' }}>
                {/* Tabs */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid #1a2535' }}>
                    {(['login', 'register'] as Tab[]).map(t => (
                        <button key={t} onClick={() => switchTab(t)} style={{
                            padding: '13px 0', background: 'none', border: 'none', cursor: 'pointer',
                            fontSize: 13, fontWeight: tab === t ? 600 : 400,
                            color: tab === t ? '#dde6f0' : '#3d5570',
                            borderBottom: tab === t ? '2px solid #1a6cff' : '2px solid transparent',
                            fontFamily: 'inherit',
                        }}>{t === 'login' ? 'Sign In' : 'Register'}</button>
                    ))}
                </div>

                <div style={{ padding: 24 }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {tab === 'register' && (
                            <div>
                                <label style={{ display: 'block', fontSize: 10.5, color: '#8899b0', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Full Name</label>
                                <input style={inp} placeholder="Your name" value={name} onChange={e => setName(e.target.value)}
                                    onFocus={e => (e.target.style.borderColor = '#1a6cff')} onBlur={e => (e.target.style.borderColor = '#1a2535')} required />
                            </div>
                        )}
                        <div>
                            <label style={{ display: 'block', fontSize: 10.5, color: '#8899b0', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Email</label>
                            <input style={inp} type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)}
                                onFocus={e => (e.target.style.borderColor = '#1a6cff')} onBlur={e => (e.target.style.borderColor = '#1a2535')} required />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 10.5, color: '#8899b0', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Password</label>
                            <input style={inp} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
                                onFocus={e => (e.target.style.borderColor = '#1a6cff')} onBlur={e => (e.target.style.borderColor = '#1a2535')} required />
                        </div>
                        {tab === 'register' && (
                            <div>
                                <label style={{ display: 'block', fontSize: 10.5, color: '#8899b0', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Confirm Password</label>
                                <input style={inp} type="password" placeholder="••••••••" value={confirm} onChange={e => setConfirm(e.target.value)}
                                    onFocus={e => (e.target.style.borderColor = '#1a6cff')} onBlur={e => (e.target.style.borderColor = '#1a2535')} required />
                            </div>
                        )}
                        {error && (
                            <div style={{ fontSize: 12, color: '#f87171', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 7, padding: '9px 12px' }}>
                                {error}
                            </div>
                        )}
                        <button type="submit" disabled={loading} style={{
                            padding: '10px', background: loading ? '#0d1f40' : '#1a6cff', color: '#fff',
                            border: 'none', borderRadius: 8, fontSize: 13.5, fontWeight: 600,
                            cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: loading ? 0.8 : 1,
                        }}>
                            {loading ? 'Please wait…' : tab === 'login' ? 'Sign In' : 'Create Account'}
                        </button>
                    </form>

                    {tab === 'login' && (
                        <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid #1a2535', fontSize: 11, color: '#3d5570', textAlign: 'center' }}>
                            Demo credentials pre-filled above
                        </div>
                    )}
                    <div style={{ marginTop: 12, textAlign: 'center' }}>
                        <Link href="/dashboard" style={{ fontSize: 11, color: '#3d5570', textDecoration: 'none' }}>
                            Continue without login →
                        </Link>
                    </div>
                </div>
            </div>
            <style>{`@keyframes fadein{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}`}</style>
        </div>
    )
}