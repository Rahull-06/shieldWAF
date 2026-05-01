// 'use client'
// // PATH: client/src/app/(auth)/login/page.tsx
// import { useState } from 'react'
// import { useRouter } from 'next/navigation'
// import Link from 'next/link'
// import { useAuth } from '@/hooks/useAuth'

// type Tab = 'login' | 'register'

// export default function LoginPage() {
//     const router = useRouter()
//     const { login, register } = useAuth()
//     const [tab, setTab] = useState<Tab>('login')
//     const [name, setName] = useState('')
//     const [email, setEmail] = useState('rahull123@gmail.com')
//     const [password, setPassword] = useState('rahull@123')
//     const [confirm, setConfirm] = useState('')
//     const [error, setError] = useState('')
//     const [loading, setLoading] = useState(false)

//     const switchTab = (t: Tab) => {
//         setTab(t); setError('')
//         if (t === 'login') { setEmail('rahull123@gmail.com'); setPassword('rahull@123') }
//         else { setEmail(''); setPassword('') }
//     }

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault(); setError(''); setLoading(true)
//         try {
//             if (tab === 'login') {
//                 await login(email, password)
//             } else {
//                 if (!name.trim()) throw new Error('Name is required.')
//                 if (password !== confirm) throw new Error('Passwords do not match.')
//                 if (password.length < 6) throw new Error('Password must be at least 6 characters.')
//                 await register(name, email, password)
//             }
//             router.push('/dashboard')
//         } catch (err: unknown) {
//             setError(err instanceof Error ? err.message : 'Something went wrong.')
//         } finally {
//             setLoading(false)
//         }
//     }

//     const inp: React.CSSProperties = {
//         width: '100%', background: '#101620', border: '1px solid #1a2535',
//         color: '#dde6f0', fontSize: 13, padding: '9px 12px', borderRadius: 7,
//         outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
//     }

//     return (
//         <div style={{ width: '100%', maxWidth: 380, animation: 'fadein 0.25s ease' }}>
//             {/* Logo */}
//             <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28, justifyContent: 'center' }}>
//                 <div style={{ width: 34, height: 34, background: '#1a6cff', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🛡</div>
//                 <div>
//                     <div style={{ fontSize: 15, fontWeight: 700, color: '#dde6f0', letterSpacing: '-0.3px' }}>ShieldWAF</div>
//                     <div style={{ fontSize: 9, color: '#3d5570', letterSpacing: '1.2px', textTransform: 'uppercase' }}>Security Dashboard</div>
//                 </div>
//             </div>

//             <div style={{ background: '#0c1118', border: '1px solid #1a2535', borderRadius: 14, overflow: 'hidden' }}>
//                 {/* Tabs */}
//                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid #1a2535' }}>
//                     {(['login', 'register'] as Tab[]).map(t => (
//                         <button key={t} onClick={() => switchTab(t)} style={{
//                             padding: '13px 0', background: 'none', border: 'none', cursor: 'pointer',
//                             fontSize: 13, fontWeight: tab === t ? 600 : 400,
//                             color: tab === t ? '#dde6f0' : '#3d5570',
//                             borderBottom: tab === t ? '2px solid #1a6cff' : '2px solid transparent',
//                             fontFamily: 'inherit',
//                         }}>{t === 'login' ? 'Sign In' : 'Register'}</button>
//                     ))}
//                 </div>

//                 <div style={{ padding: 24 }}>
//                     <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
//                         {tab === 'register' && (
//                             <div>
//                                 <label style={{ display: 'block', fontSize: 10.5, color: '#8899b0', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Full Name</label>
//                                 <input style={inp} placeholder="Your name" value={name} onChange={e => setName(e.target.value)}
//                                     onFocus={e => (e.target.style.borderColor = '#1a6cff')} onBlur={e => (e.target.style.borderColor = '#1a2535')} required />
//                             </div>
//                         )}
//                         <div>
//                             <label style={{ display: 'block', fontSize: 10.5, color: '#8899b0', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Email</label>
//                             <input style={inp} type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)}
//                                 onFocus={e => (e.target.style.borderColor = '#1a6cff')} onBlur={e => (e.target.style.borderColor = '#1a2535')} required />
//                         </div>
//                         <div>
//                             <label style={{ display: 'block', fontSize: 10.5, color: '#8899b0', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Password</label>
//                             <input style={inp} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
//                                 onFocus={e => (e.target.style.borderColor = '#1a6cff')} onBlur={e => (e.target.style.borderColor = '#1a2535')} required />
//                         </div>
//                         {tab === 'register' && (
//                             <div>
//                                 <label style={{ display: 'block', fontSize: 10.5, color: '#8899b0', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Confirm Password</label>
//                                 <input style={inp} type="password" placeholder="••••••••" value={confirm} onChange={e => setConfirm(e.target.value)}
//                                     onFocus={e => (e.target.style.borderColor = '#1a6cff')} onBlur={e => (e.target.style.borderColor = '#1a2535')} required />
//                             </div>
//                         )}
//                         {error && (
//                             <div style={{ fontSize: 12, color: '#f87171', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 7, padding: '9px 12px' }}>
//                                 {error}
//                             </div>
//                         )}
//                         <button type="submit" disabled={loading} style={{
//                             padding: '10px', background: loading ? '#0d1f40' : '#1a6cff', color: '#fff',
//                             border: 'none', borderRadius: 8, fontSize: 13.5, fontWeight: 600,
//                             cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: loading ? 0.8 : 1,
//                         }}>
//                             {loading ? 'Please wait…' : tab === 'login' ? 'Sign In' : 'Create Account'}
//                         </button>
//                     </form>

//                     {tab === 'login' && (
//                         <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid #1a2535', fontSize: 11, color: '#3d5570', textAlign: 'center' }}>
//                             Demo credentials pre-filled above
//                         </div>
//                     )}
//                     <div style={{ marginTop: 12, textAlign: 'center' }}>
//                         <Link href="/dashboard" style={{ fontSize: 11, color: '#3d5570', textDecoration: 'none' }}>
//                             Continue without login →
//                         </Link>
//                     </div>
//                 </div>
//             </div>
//             <style>{`@keyframes fadein{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}`}</style>
//         </div>
//     )
// }












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

    const [tab, setTab]         = useState<Tab>('login')
    const [name, setName]       = useState('')
    const [email, setEmail]     = useState('rahull123@gmail.com')
    const [password, setPassword] = useState('rahull@123')
    const [confirm, setConfirm] = useState('')
    const [error, setError]     = useState('')
    const [success, setSuccess] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPass, setShowPass]       = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    const switchTab = (t: Tab) => {
        setTab(t); setError(''); setSuccess('')
        if (t === 'login') {
            setEmail('rahull123@gmail.com')
            setPassword('rahull@123')
        } else {
            setEmail(''); setPassword(''); setName(''); setConfirm('')
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(''); setSuccess(''); setLoading(true)
        try {
            if (tab === 'login') {
                await login(email, password)
                setSuccess('Login successful! Redirecting…')
                setTimeout(() => router.push('/dashboard'), 800)
            } else {
                if (!name.trim())           throw new Error('Full name is required.')
                if (password !== confirm)   throw new Error('Passwords do not match.')
                if (password.length < 6)    throw new Error('Password must be at least 6 characters.')
                await register(name, email, password)
                setSuccess('Account created! Redirecting…')
                setTimeout(() => router.push('/dashboard'), 800)
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Something went wrong.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <style>{`
                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

                .auth-root {
                    min-height: 100vh;
                    background: #080d14;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    font-family: 'Segoe UI', system-ui, sans-serif;
                }

                /* Subtle grid background */
                .auth-root::before {
                    content: '';
                    position: fixed;
                    inset: 0;
                    background-image:
                        linear-gradient(rgba(26,108,255,0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(26,108,255,0.03) 1px, transparent 1px);
                    background-size: 40px 40px;
                    pointer-events: none;
                }

                .auth-card {
                    width: 100%;
                    max-width: 420px;
                    position: relative;
                    animation: slideUp 0.3s ease;
                }

                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(16px); }
                    to   { opacity: 1; transform: none; }
                }

                /* ── Logo ── */
                .logo {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    justify-content: center;
                    margin-bottom: 32px;
                }
                .logo-icon {
                    width: 40px; height: 40px;
                    background: linear-gradient(135deg, #1a6cff, #0a4fcf);
                    border-radius: 11px;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 18px;
                    box-shadow: 0 4px 20px rgba(26,108,255,0.35);
                }
                .logo-name {
                    font-size: 17px; font-weight: 700;
                    color: #dde6f0; letter-spacing: -0.4px;
                }
                .logo-sub {
                    font-size: 9.5px; color: #2e4060;
                    letter-spacing: 1.5px; text-transform: uppercase;
                    margin-top: 1px;
                }

                /* ── Panel ── */
                .panel {
                    background: #0b1220;
                    border: 1px solid #182030;
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 24px 60px rgba(0,0,0,0.5);
                }

                /* ── Tabs ── */
                .tabs {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    border-bottom: 1px solid #182030;
                }
                .tab-btn {
                    padding: 14px 0;
                    background: none; border: none; cursor: pointer;
                    font-size: 13px; font-family: inherit;
                    transition: color 0.15s;
                    border-bottom: 2px solid transparent;
                    position: relative;
                }
                .tab-btn.active {
                    font-weight: 600; color: #dde6f0;
                    border-bottom-color: #1a6cff;
                }
                .tab-btn:not(.active) { color: #3d5570; }
                .tab-btn:not(.active):hover { color: #7a90a8; }

                /* ── Form ── */
                .form-body { padding: 28px 24px 24px; }

                .field { margin-bottom: 16px; }
                .field label {
                    display: block;
                    font-size: 10.5px; font-weight: 600;
                    color: #4a6080; text-transform: uppercase;
                    letter-spacing: 0.08em; margin-bottom: 6px;
                }

                .input-wrap { position: relative; }
                .input-wrap input {
                    width: 100%;
                    background: #0d1826;
                    border: 1px solid #1a2840;
                    color: #c8d8ec;
                    font-size: 13.5px;
                    padding: 10px 14px;
                    border-radius: 8px;
                    outline: none;
                    font-family: inherit;
                    transition: border-color 0.15s, box-shadow 0.15s;
                }
                .input-wrap input:focus {
                    border-color: #1a6cff;
                    box-shadow: 0 0 0 3px rgba(26,108,255,0.12);
                }
                .input-wrap input::placeholder { color: #2e4560; }
                .input-wrap input.has-toggle { padding-right: 42px; }

                .toggle-btn {
                    position: absolute; right: 12px; top: 50%;
                    transform: translateY(-50%);
                    background: none; border: none; cursor: pointer;
                    color: #3d5570; font-size: 14px; padding: 2px;
                    transition: color 0.15s;
                }
                .toggle-btn:hover { color: #7a90a8; }

                /* ── Alerts ── */
                .alert {
                    border-radius: 8px;
                    padding: 10px 13px;
                    font-size: 12.5px;
                    margin-bottom: 16px;
                    display: flex; align-items: flex-start; gap: 8px;
                }
                .alert-error {
                    background: rgba(239,68,68,0.07);
                    border: 1px solid rgba(239,68,68,0.2);
                    color: #f87171;
                }
                .alert-success {
                    background: rgba(34,197,94,0.07);
                    border: 1px solid rgba(34,197,94,0.2);
                    color: #4ade80;
                }

                /* ── Submit ── */
                .submit-btn {
                    width: 100%;
                    padding: 11px;
                    background: linear-gradient(135deg, #1a6cff, #0a55d4);
                    color: #fff; border: none;
                    border-radius: 9px;
                    font-size: 14px; font-weight: 600;
                    cursor: pointer; font-family: inherit;
                    transition: opacity 0.15s, transform 0.1s, box-shadow 0.15s;
                    box-shadow: 0 4px 16px rgba(26,108,255,0.3);
                    margin-top: 4px;
                }
                .submit-btn:hover:not(:disabled) {
                    opacity: 0.92;
                    box-shadow: 0 6px 22px rgba(26,108,255,0.4);
                    transform: translateY(-1px);
                }
                .submit-btn:active:not(:disabled) { transform: translateY(0); }
                .submit-btn:disabled {
                    background: #0d1f40; opacity: 0.7; cursor: not-allowed;
                    box-shadow: none;
                }

                /* Spinner */
                .spinner {
                    display: inline-block;
                    width: 12px; height: 12px;
                    border: 2px solid rgba(255,255,255,0.3);
                    border-top-color: #fff;
                    border-radius: 50%;
                    animation: spin 0.6s linear infinite;
                    margin-right: 8px;
                    vertical-align: middle;
                }
                @keyframes spin { to { transform: rotate(360deg); } }

                /* ── Footer ── */
                .card-footer {
                    padding: 14px 24px 20px;
                    border-top: 1px solid #111c2a;
                    text-align: center;
                }
                .hint { font-size: 11px; color: #2e4060; margin-bottom: 8px; }
                .skip-link {
                    font-size: 11.5px; color: #2e4060;
                    text-decoration: none;
                    transition: color 0.15s;
                }
                .skip-link:hover { color: #5a7a9a; }

                /* ── Demo badge ── */
                .demo-badge {
                    display: inline-flex; align-items: center; gap: 5px;
                    background: rgba(26,108,255,0.08);
                    border: 1px solid rgba(26,108,255,0.15);
                    border-radius: 20px;
                    padding: 3px 10px;
                    font-size: 10.5px; color: #3a6aaa;
                    margin-bottom: 10px;
                }

                /* ── Responsive ── */
                @media (max-width: 480px) {
                    .auth-root { padding: 16px; align-items: flex-start; padding-top: 40px; }
                    .auth-card { max-width: 100%; }
                    .form-body { padding: 22px 18px 18px; }
                    .card-footer { padding: 12px 18px 18px; }
                    .logo { margin-bottom: 24px; }
                }
            `}</style>

            <div className="auth-root">
                <div className="auth-card">

                    {/* Logo */}
                    <div className="logo">
                        <div className="logo-icon">🛡</div>
                        <div>
                            <div className="logo-name">ShieldWAF</div>
                            <div className="logo-sub">Security Dashboard</div>
                        </div>
                    </div>

                    <div className="panel">
                        {/* Tabs */}
                        <div className="tabs">
                            {(['login', 'register'] as Tab[]).map(t => (
                                <button
                                    key={t}
                                    className={`tab-btn ${tab === t ? 'active' : ''}`}
                                    onClick={() => switchTab(t)}
                                >
                                    {t === 'login' ? 'Sign In' : 'Register'}
                                </button>
                            ))}
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} noValidate>
                            <div className="form-body">

                                {tab === 'register' && (
                                    <div className="field">
                                        <label htmlFor="name">Full Name</label>
                                        <div className="input-wrap">
                                            <input
                                                id="name"
                                                type="text"
                                                placeholder="Your full name"
                                                value={name}
                                                onChange={e => setName(e.target.value)}
                                                autoComplete="name"
                                                required
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="field">
                                    <label htmlFor="email">Email</label>
                                    <div className="input-wrap">
                                        <input
                                            id="email"
                                            type="email"
                                            placeholder="you@example.com"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            autoComplete="email"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="field">
                                    <label htmlFor="password">Password</label>
                                    <div className="input-wrap">
                                        <input
                                            id="password"
                                            type={showPass ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                                            className="has-toggle"
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="toggle-btn"
                                            onClick={() => setShowPass(v => !v)}
                                            aria-label={showPass ? 'Hide password' : 'Show password'}
                                        >
                                            {showPass ? '🙈' : '👁'}
                                        </button>
                                    </div>
                                </div>

                                {tab === 'register' && (
                                    <div className="field">
                                        <label htmlFor="confirm">Confirm Password</label>
                                        <div className="input-wrap">
                                            <input
                                                id="confirm"
                                                type={showConfirm ? 'text' : 'password'}
                                                placeholder="••••••••"
                                                value={confirm}
                                                onChange={e => setConfirm(e.target.value)}
                                                autoComplete="new-password"
                                                className="has-toggle"
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="toggle-btn"
                                                onClick={() => setShowConfirm(v => !v)}
                                                aria-label={showConfirm ? 'Hide password' : 'Show password'}
                                            >
                                                {showConfirm ? '🙈' : '👁'}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {error && (
                                    <div className="alert alert-error" role="alert">
                                        <span>⚠️</span>
                                        <span>{error}</span>
                                    </div>
                                )}

                                {success && (
                                    <div className="alert alert-success" role="status">
                                        <span>✅</span>
                                        <span>{success}</span>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="submit-btn"
                                    disabled={loading}
                                >
                                    {loading && <span className="spinner" />}
                                    {loading
                                        ? 'Please wait…'
                                        : tab === 'login' ? 'Sign In' : 'Create Account'
                                    }
                                </button>
                            </div>
                        </form>

                        {/* Footer */}
                        <div className="card-footer">
                            {tab === 'login' && (
                                <>
                                    <div className="demo-badge">
                                        🔑 Demo credentials pre-filled
                                    </div>
                                    <br />
                                </>
                            )}
                            <Link href="/dashboard" className="skip-link">
                                Continue without login →
                            </Link>
                        </div>
                    </div>

                </div>
            </div>
        </>
    )
}