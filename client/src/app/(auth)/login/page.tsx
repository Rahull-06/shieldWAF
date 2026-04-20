// 'use client'
// import { useState, useEffect, useRef } from 'react'
// import { useRouter } from 'next/navigation'
// import { useAuth } from '@/hooks/useAuth'

// export default function AuthPage() {
//     const router = useRouter()
//     const { login, register, user, loading } = useAuth()

//     const [mode, setMode] = useState<'signin' | 'signup'>('signin')
//     const [mounted, setMounted] = useState(false)

//     // Sign in fields
//     const [email, setEmail] = useState('admin@shieldwaf.io')
//     const [password, setPassword] = useState('password')

//     // Sign up fields
//     const [name, setName] = useState('')
//     const [regEmail, setRegEmail] = useState('')
//     const [regPassword, setRegPassword] = useState('')
//     const [confirmPassword, setConfirmPassword] = useState('')

//     const [showPass, setShowPass] = useState(false)
//     const [showRegPass, setShowRegPass] = useState(false)
//     const [err, setErr] = useState('')
//     const [success, setSuccess] = useState('')
//     const [submitting, setSubmitting] = useState(false)

//     // Track if redirect was triggered by a form submit (not a stale session)
//     const didSubmit = useRef(false)

//     useEffect(() => {
//         setMounted(true)
//     }, [])

//     // Only redirect if the user actively logged in via form submit
//     useEffect(() => {
//         if (mounted && !loading && user && didSubmit.current) {
//             router.replace('/dashboard')
//         }
//     }, [mounted, loading, user, router])

//     const switchMode = (m: 'signin' | 'signup') => {
//         setMode(m)
//         setErr('')
//         setSuccess('')
//     }

//     const handleSignIn = async (e: React.FormEvent) => {
//         e.preventDefault()
//         setErr('')
//         setSubmitting(true)
//         try {
//             await login(email, password)
//             didSubmit.current = true
//             router.replace('/dashboard')
//         } catch (e: unknown) {
//             setErr(e instanceof Error ? e.message : 'Invalid credentials. Please try again.')
//         } finally {
//             setSubmitting(false)
//         }
//     }

//     const handleSignUp = async (e: React.FormEvent) => {
//         e.preventDefault()
//         setErr('')
//         setSuccess('')
//         if (!name.trim()) return setErr('Full name is required.')
//         if (regPassword.length < 6) return setErr('Password must be at least 6 characters.')
//         if (regPassword !== confirmPassword) return setErr('Passwords do not match.')
//         setSubmitting(true)
//         try {
//             await register(name.trim(), regEmail, regPassword)
//             didSubmit.current = true
//             setSuccess('Account created! Signing you in…')
//             setTimeout(() => router.replace('/dashboard'), 1000)
//         } catch (e: unknown) {
//             setErr(e instanceof Error ? e.message : 'Registration failed. Try again.')
//         } finally {
//             setSubmitting(false)
//         }
//     }

//     // Show spinner only while auth state is being resolved on first load
//     if (!mounted || loading) {
//         return (
//             <div style={{ minHeight: '100vh', background: '#080c10', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//                 <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid #1a6cff', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
//                 <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
//             </div>
//         )
//     }

//     return (
//         <>
//             <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap');

//         *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

//         .auth-root {
//           min-height: 100vh;
//           background: #080c10;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           padding: 20px;
//           font-family: 'Syne', sans-serif;
//           position: relative;
//           overflow: hidden;
//         }

//         .auth-root::before {
//           content: '';
//           position: fixed;
//           top: -30%;
//           left: -20%;
//           width: 60vw;
//           height: 60vw;
//           background: radial-gradient(ellipse, rgba(26,108,255,0.07) 0%, transparent 70%);
//           pointer-events: none;
//           z-index: 0;
//         }
//         .auth-root::after {
//           content: '';
//           position: fixed;
//           bottom: -30%;
//           right: -20%;
//           width: 50vw;
//           height: 50vw;
//           background: radial-gradient(ellipse, rgba(26,108,255,0.05) 0%, transparent 70%);
//           pointer-events: none;
//           z-index: 0;
//         }

//         .auth-grid {
//           position: fixed;
//           inset: 0;
//           background-image:
//             linear-gradient(rgba(26,108,255,0.03) 1px, transparent 1px),
//             linear-gradient(90deg, rgba(26,108,255,0.03) 1px, transparent 1px);
//           background-size: 48px 48px;
//           pointer-events: none;
//           z-index: 0;
//         }

//         .auth-card {
//           position: relative;
//           z-index: 1;
//           width: 100%;
//           max-width: 420px;
//           background: #0c1118;
//           border: 1px solid #1a2535;
//           border-radius: 16px;
//           overflow: hidden;
//           animation: cardIn 0.5s cubic-bezier(0.16,1,0.3,1) both;
//         }
//         @keyframes cardIn {
//           from { opacity: 0; transform: translateY(24px) scale(0.98); }
//           to   { opacity: 1; transform: translateY(0) scale(1); }
//         }

//         .auth-card::before {
//           content: '';
//           position: absolute;
//           top: 0; left: 0; right: 0;
//           height: 1px;
//           background: linear-gradient(90deg, transparent, #1a6cff 50%, transparent);
//           opacity: 0.8;
//         }

//         .auth-brand {
//           display: flex;
//           align-items: center;
//           gap: 12px;
//           padding: 28px 28px 0;
//         }

//         .auth-shield {
//           width: 38px;
//           height: 38px;
//           background: linear-gradient(135deg, #1a6cff 0%, #0d4acc 100%);
//           border-radius: 10px;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           box-shadow: 0 0 20px rgba(26,108,255,0.3);
//         }

//         .auth-brand-text h1 {
//           font-size: 16px;
//           font-weight: 700;
//           color: #dde6f0;
//           letter-spacing: 0.5px;
//         }
//         .auth-brand-text p {
//           font-size: 10px;
//           color: #3d5570;
//           letter-spacing: 1.5px;
//           text-transform: uppercase;
//           font-family: 'IBM Plex Mono', monospace;
//           margin-top: 2px;
//         }

//         .auth-tabs {
//           display: flex;
//           gap: 0;
//           padding: 24px 28px 0;
//         }
//         .auth-tab {
//           flex: 1;
//           padding: 10px;
//           background: none;
//           border: none;
//           font-family: 'Syne', sans-serif;
//           font-size: 13px;
//           font-weight: 600;
//           cursor: pointer;
//           transition: all 0.2s;
//           border-bottom: 2px solid transparent;
//           color: #3d5570;
//           letter-spacing: 0.3px;
//         }
//         .auth-tab.active {
//           color: #dde6f0;
//           border-bottom-color: #1a6cff;
//         }
//         .auth-tab:hover:not(.active) {
//           color: #8899b0;
//         }

//         .auth-body {
//           padding: 24px 28px 28px;
//         }

//         .auth-heading {
//           margin-bottom: 6px;
//         }
//         .auth-heading h2 {
//           font-size: 22px;
//           font-weight: 700;
//           color: #dde6f0;
//           line-height: 1.2;
//         }
//         .auth-heading p {
//           font-size: 13px;
//           color: #8899b0;
//           margin-top: 4px;
//         }

//         .auth-form {
//           margin-top: 20px;
//           display: flex;
//           flex-direction: column;
//           gap: 14px;
//         }

//         .field-label {
//           display: block;
//           font-size: 10.5px;
//           font-weight: 600;
//           color: #3d5570;
//           letter-spacing: 1px;
//           text-transform: uppercase;
//           font-family: 'IBM Plex Mono', monospace;
//           margin-bottom: 6px;
//         }

//         .field-wrap {
//           position: relative;
//         }

//         .auth-input {
//           width: 100%;
//           padding: 11px 14px;
//           background: #101620;
//           border: 1px solid #1a2535;
//           border-radius: 8px;
//           color: #dde6f0;
//           font-size: 13.5px;
//           font-family: 'Syne', sans-serif;
//           outline: none;
//           transition: border-color 0.2s, box-shadow 0.2s;
//           -webkit-appearance: none;
//         }
//         .auth-input::placeholder { color: #3d5570; }
//         .auth-input:focus {
//           border-color: #1a6cff;
//           box-shadow: 0 0 0 3px rgba(26,108,255,0.12);
//         }
//         .auth-input.has-toggle { padding-right: 42px; }

//         .toggle-vis {
//           position: absolute;
//           right: 12px;
//           top: 50%;
//           transform: translateY(-50%);
//           background: none;
//           border: none;
//           cursor: pointer;
//           padding: 2px;
//           color: #3d5570;
//           display: flex;
//           align-items: center;
//           transition: color 0.15s;
//         }
//         .toggle-vis:hover { color: #8899b0; }

//         .strength-bar {
//           margin-top: 6px;
//           height: 3px;
//           border-radius: 2px;
//           background: #1a2535;
//           overflow: hidden;
//         }
//         .strength-fill {
//           height: 100%;
//           border-radius: 2px;
//           transition: width 0.3s, background 0.3s;
//         }

//         .auth-btn {
//           width: 100%;
//           padding: 12px;
//           background: #1a6cff;
//           border: none;
//           border-radius: 8px;
//           color: #fff;
//           font-family: 'Syne', sans-serif;
//           font-size: 14px;
//           font-weight: 700;
//           letter-spacing: 0.3px;
//           cursor: pointer;
//           transition: all 0.2s;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           gap: 8px;
//           margin-top: 6px;
//           position: relative;
//           overflow: hidden;
//         }
//         .auth-btn::after {
//           content: '';
//           position: absolute;
//           inset: 0;
//           background: linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 100%);
//         }
//         .auth-btn:hover:not(:disabled) {
//           background: #1d5ce8;
//           transform: translateY(-1px);
//           box-shadow: 0 4px 20px rgba(26,108,255,0.35);
//         }
//         .auth-btn:active:not(:disabled) { transform: translateY(0); }
//         .auth-btn:disabled { opacity: 0.6; cursor: not-allowed; }

//         .auth-error {
//           background: rgba(239,68,68,0.08);
//           border: 1px solid rgba(239,68,68,0.2);
//           border-radius: 8px;
//           padding: 10px 13px;
//           font-size: 12.5px;
//           color: #fca5a5;
//           display: flex;
//           align-items: center;
//           gap: 8px;
//         }

//         .auth-success {
//           background: rgba(34,197,94,0.08);
//           border: 1px solid rgba(34,197,94,0.2);
//           border-radius: 8px;
//           padding: 10px 13px;
//           font-size: 12.5px;
//           color: #86efac;
//           display: flex;
//           align-items: center;
//           gap: 8px;
//         }

//         .demo-badge {
//           background: rgba(26,108,255,0.07);
//           border: 1px solid rgba(26,108,255,0.15);
//           border-radius: 8px;
//           padding: 9px 13px;
//           display: flex;
//           align-items: center;
//           justify-content: space-between;
//           gap: 8px;
//         }
//         .demo-badge p {
//           font-size: 11.5px;
//           color: #8899b0;
//         }
//         .demo-badge strong {
//           color: #60a5fa;
//           font-family: 'IBM Plex Mono', monospace;
//           font-size: 11px;
//           font-weight: 500;
//         }

//         .auth-footer {
//           padding: 14px 28px;
//           border-top: 1px solid #1a2535;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           gap: 6px;
//         }
//         .auth-footer p { font-size: 12px; color: #3d5570; }
//         .auth-footer button {
//           background: none;
//           border: none;
//           font-family: 'Syne', sans-serif;
//           font-size: 12px;
//           color: #1a6cff;
//           cursor: pointer;
//           font-weight: 600;
//           transition: color 0.15s;
//         }
//         .auth-footer button:hover { color: #60a5fa; }

//         .spinner {
//           width: 16px;
//           height: 16px;
//           border: 2px solid rgba(255,255,255,0.3);
//           border-top-color: #fff;
//           border-radius: 50%;
//           animation: spin 0.7s linear infinite;
//         }
//         @keyframes spin { to { transform: rotate(360deg); } }

//         .form-slide {
//           animation: slideIn 0.3s cubic-bezier(0.16,1,0.3,1) both;
//         }
//         @keyframes slideIn {
//           from { opacity: 0; transform: translateX(12px); }
//           to   { opacity: 1; transform: translateX(0); }
//         }

//         @media (max-width: 480px) {
//           .auth-card { border-radius: 12px; }
//           .auth-brand, .auth-body, .auth-footer { padding-left: 20px; padding-right: 20px; }
//           .auth-tabs { padding-left: 20px; padding-right: 20px; }
//         }
//       `}</style>

//             <div className="auth-root">
//                 <div className="auth-grid" />

//                 <div className="auth-card">
//                     {/* Brand */}
//                     <div className="auth-brand">
//                         <div className="auth-shield">
//                             <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
//                                 <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C16.5 22.15 20 17.25 20 12V6L12 2z" fill="rgba(255,255,255,0.15)" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
//                                 <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
//                             </svg>
//                         </div>
//                         <div className="auth-brand-text">
//                             <h1>ShieldWAF</h1>
//                             <p>Security Dashboard</p>
//                         </div>
//                     </div>

//                     {/* Tabs */}
//                     <div className="auth-tabs">
//                         <button className={`auth-tab ${mode === 'signin' ? 'active' : ''}`} onClick={() => switchMode('signin')}>
//                             Sign In
//                         </button>
//                         <button className={`auth-tab ${mode === 'signup' ? 'active' : ''}`} onClick={() => switchMode('signup')}>
//                             Create Account
//                         </button>
//                     </div>

//                     {/* Body */}
//                     <div className="auth-body">
//                         {mode === 'signin' ? (
//                             <div className="form-slide" key="signin">
//                                 <div className="auth-heading">
//                                     <h2>Welcome back</h2>
//                                     <p>Sign in to your WAF dashboard</p>
//                                 </div>

//                                 <form className="auth-form" onSubmit={handleSignIn}>
//                                     <div className="demo-badge">
//                                         <p>Demo credentials pre-filled</p>
//                                         <strong>admin@shieldwaf.io</strong>
//                                     </div>

//                                     {err && (
//                                         <div className="auth-error">
//                                             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
//                                             {err}
//                                         </div>
//                                     )}

//                                     <div>
//                                         <label className="field-label">Email</label>
//                                         <input
//                                             className="auth-input"
//                                             type="email"
//                                             autoComplete="email"
//                                             placeholder="you@example.com"
//                                             value={email}
//                                             onChange={e => setEmail(e.target.value)}
//                                             required
//                                         />
//                                     </div>

//                                     <div>
//                                         <label className="field-label">Password</label>
//                                         <div className="field-wrap">
//                                             <input
//                                                 className="auth-input has-toggle"
//                                                 type={showPass ? 'text' : 'password'}
//                                                 autoComplete="current-password"
//                                                 placeholder="••••••••"
//                                                 value={password}
//                                                 onChange={e => setPassword(e.target.value)}
//                                                 required
//                                             />
//                                             <button type="button" className="toggle-vis" onClick={() => setShowPass(p => !p)} tabIndex={-1}>
//                                                 {showPass
//                                                     ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
//                                                     : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
//                                                 }
//                                             </button>
//                                         </div>
//                                     </div>

//                                     <button className="auth-btn" type="submit" disabled={submitting}>
//                                         {submitting ? <span className="spinner" /> : null}
//                                         {submitting ? 'Signing in…' : 'Sign In'}
//                                     </button>
//                                 </form>
//                             </div>
//                         ) : (
//                             <div className="form-slide" key="signup">
//                                 <div className="auth-heading">
//                                     <h2>Create account</h2>
//                                     <p>Start monitoring your web traffic</p>
//                                 </div>

//                                 <form className="auth-form" onSubmit={handleSignUp}>
//                                     {err && (
//                                         <div className="auth-error">
//                                             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
//                                             {err}
//                                         </div>
//                                     )}
//                                     {success && (
//                                         <div className="auth-success">
//                                             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
//                                             {success}
//                                         </div>
//                                     )}

//                                     <div>
//                                         <label className="field-label">Full Name</label>
//                                         <input
//                                             className="auth-input"
//                                             type="text"
//                                             autoComplete="name"
//                                             placeholder="John Doe"
//                                             value={name}
//                                             onChange={e => setName(e.target.value)}
//                                             required
//                                         />
//                                     </div>

//                                     <div>
//                                         <label className="field-label">Email</label>
//                                         <input
//                                             className="auth-input"
//                                             type="email"
//                                             autoComplete="email"
//                                             placeholder="you@example.com"
//                                             value={regEmail}
//                                             onChange={e => setRegEmail(e.target.value)}
//                                             required
//                                         />
//                                     </div>

//                                     <div>
//                                         <label className="field-label">Password</label>
//                                         <div className="field-wrap">
//                                             <input
//                                                 className="auth-input has-toggle"
//                                                 type={showRegPass ? 'text' : 'password'}
//                                                 autoComplete="new-password"
//                                                 placeholder="Min. 6 characters"
//                                                 value={regPassword}
//                                                 onChange={e => setRegPassword(e.target.value)}
//                                                 required
//                                             />
//                                             <button type="button" className="toggle-vis" onClick={() => setShowRegPass(p => !p)} tabIndex={-1}>
//                                                 {showRegPass
//                                                     ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
//                                                     : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
//                                                 }
//                                             </button>
//                                         </div>
//                                         {regPassword.length > 0 && (
//                                             <div className="strength-bar">
//                                                 <div className="strength-fill" style={{
//                                                     width: regPassword.length < 6 ? '25%' : regPassword.length < 10 ? '60%' : '100%',
//                                                     background: regPassword.length < 6 ? '#ef4444' : regPassword.length < 10 ? '#f59e0b' : '#22c55e'
//                                                 }} />
//                                             </div>
//                                         )}
//                                     </div>

//                                     <div>
//                                         <label className="field-label">Confirm Password</label>
//                                         <input
//                                             className="auth-input"
//                                             type="password"
//                                             autoComplete="new-password"
//                                             placeholder="Repeat password"
//                                             value={confirmPassword}
//                                             onChange={e => setConfirmPassword(e.target.value)}
//                                             required
//                                         />
//                                     </div>

//                                     <button className="auth-btn" type="submit" disabled={submitting}>
//                                         {submitting ? <span className="spinner" /> : null}
//                                         {submitting ? 'Creating account…' : 'Create Account'}
//                                     </button>
//                                 </form>
//                             </div>
//                         )}
//                     </div>

//                     {/* Footer */}
//                     <div className="auth-footer">
//                         {mode === 'signin' ? (
//                             <>
//                                 <p>Don't have an account?</p>
//                                 <button onClick={() => switchMode('signup')}>Create one</button>
//                             </>
//                         ) : (
//                             <>
//                                 <p>Already have an account?</p>
//                                 <button onClick={() => switchMode('signin')}>Sign in</button>
//                             </>
//                         )}
//                     </div>
//                 </div>
//             </div>
//         </>
//     )
// }





'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export default function AuthPage() {
    const router = useRouter()
    const { login, register, user, loading } = useAuth()

    const [mode, setMode] = useState<'signin' | 'signup'>('signin')
    const [mounted, setMounted] = useState(false)

    // Sign in fields
    const [email, setEmail] = useState('admin@shieldwaf.io')
    const [password, setPassword] = useState('password')

    // Sign up fields
    const [name, setName] = useState('')
    const [regEmail, setRegEmail] = useState('')
    const [regPassword, setRegPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    const [showPass, setShowPass] = useState(false)
    const [showRegPass, setShowRegPass] = useState(false)
    const [showConfirmPass, setShowConfirmPass] = useState(false)
    const [err, setErr] = useState('')
    const [success, setSuccess] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const didSubmit = useRef(false)

    useEffect(() => { setMounted(true) }, [])

    useEffect(() => {
        if (mounted && !loading && user && didSubmit.current) {
            router.replace('/dashboard')
        }
    }, [mounted, loading, user, router])

    const switchMode = (m: 'signin' | 'signup') => {
        setMode(m); setErr(''); setSuccess('')
    }

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault(); setErr(''); setSubmitting(true)
        try {
            await login(email, password)
            didSubmit.current = true
            router.replace('/dashboard')
        } catch (e: unknown) {
            setErr(e instanceof Error ? e.message : 'Invalid credentials. Please try again.')
        } finally { setSubmitting(false) }
    }

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault(); setErr(''); setSuccess('')
        if (!name.trim()) return setErr('Full name is required.')
        if (regPassword.length < 6) return setErr('Password must be at least 6 characters.')
        if (regPassword !== confirmPassword) return setErr('Passwords do not match.')
        setSubmitting(true)
        try {
            await register(name.trim(), regEmail, regPassword)
            didSubmit.current = true
            setSuccess('Account created! Redirecting…')
            setTimeout(() => router.replace('/dashboard'), 1200)
        } catch (e: unknown) {
            setErr(e instanceof Error ? e.message : 'Registration failed. Please try again.')
        } finally { setSubmitting(false) }
    }

    const pwStrength = (pw: string) => {
        if (pw.length === 0) return { w: '0%', color: 'transparent', label: '' }
        if (pw.length < 6) return { w: '25%', color: '#ef4444', label: 'Weak' }
        if (pw.length < 10) return { w: '60%', color: '#f59e0b', label: 'Fair' }
        return { w: '100%', color: '#22c55e', label: 'Strong' }
    }
    const strength = pwStrength(regPassword)

    if (!mounted || loading) return (
        <div style={{ minHeight: '100vh', background: '#060a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', border: '2.5px solid #1a6cff', borderTopColor: 'transparent', animation: 'spin 0.75s linear infinite' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    )

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

                html, body { height: 100%; }

                .ar {
                    min-height: 100vh;
                    min-height: 100dvh;
                    background: #060a0f;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 16px;
                    font-family: 'Syne', sans-serif;
                    position: relative;
                    overflow-x: hidden;
                }

                /* Ambient blobs */
                .ar-blob1 {
                    position: fixed; top: -20vh; left: -15vw;
                    width: 55vw; height: 55vw; max-width: 600px; max-height: 600px;
                    background: radial-gradient(ellipse, rgba(26,108,255,0.09) 0%, transparent 65%);
                    pointer-events: none; z-index: 0; border-radius: 50%;
                }
                .ar-blob2 {
                    position: fixed; bottom: -20vh; right: -15vw;
                    width: 50vw; height: 50vw; max-width: 550px; max-height: 550px;
                    background: radial-gradient(ellipse, rgba(26,108,255,0.06) 0%, transparent 65%);
                    pointer-events: none; z-index: 0; border-radius: 50%;
                }

                /* Grid */
                .ar-grid {
                    position: fixed; inset: 0;
                    background-image:
                        linear-gradient(rgba(26,108,255,0.028) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(26,108,255,0.028) 1px, transparent 1px);
                    background-size: 44px 44px;
                    pointer-events: none; z-index: 0;
                }

                /* Card */
                .ac {
                    position: relative; z-index: 1;
                    width: 100%;
                    max-width: 440px;
                    background: #0b1019;
                    border: 1px solid rgba(255,255,255,0.07);
                    border-radius: 20px;
                    overflow: hidden;
                    box-shadow:
                        0 0 0 1px rgba(26,108,255,0.06),
                        0 24px 64px rgba(0,0,0,0.5),
                        0 4px 16px rgba(0,0,0,0.3);
                    animation: cardIn 0.55s cubic-bezier(0.16,1,0.3,1) both;
                }
                @keyframes cardIn {
                    from { opacity: 0; transform: translateY(20px) scale(0.97); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }

                /* Top glow line */
                .ac::before {
                    content: '';
                    position: absolute; top: 0; left: 0; right: 0; height: 1px;
                    background: linear-gradient(90deg, transparent 0%, #1a6cff 40%, #60a5fa 60%, transparent 100%);
                    opacity: 0.7;
                }

                /* Brand header */
                .ac-brand {
                    display: flex; align-items: center; gap: 14px;
                    padding: 28px 28px 0;
                }
                .ac-shield {
                    flex-shrink: 0;
                    width: 42px; height: 42px;
                    background: linear-gradient(140deg, #1a6cff 0%, #0a43cc 100%);
                    border-radius: 12px;
                    display: flex; align-items: center; justify-content: center;
                    box-shadow: 0 0 24px rgba(26,108,255,0.35), 0 2px 8px rgba(0,0,0,0.3);
                }
                .ac-brand-text h1 {
                    font-size: 17px; font-weight: 700; color: #e8f0fa; letter-spacing: 0.3px;
                    line-height: 1.2;
                }
                .ac-brand-text p {
                    font-size: 9.5px; color: #2d4a6a; letter-spacing: 2px;
                    text-transform: uppercase; font-family: 'IBM Plex Mono', monospace;
                    margin-top: 3px;
                }

                /* Tabs */
                .ac-tabs {
                    display: flex; padding: 22px 28px 0; gap: 4px;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                    margin-top: 20px;
                }
                .ac-tab {
                    flex: 1; padding: 10px 8px 12px;
                    background: none; border: none; border-bottom: 2px solid transparent;
                    font-family: 'Syne', sans-serif; font-size: 13.5px; font-weight: 600;
                    cursor: pointer; transition: all 0.2s; color: #2d4a6a;
                    letter-spacing: 0.2px; white-space: nowrap;
                    margin-bottom: -1px;
                }
                .ac-tab.on { color: #e8f0fa; border-bottom-color: #1a6cff; }
                .ac-tab:hover:not(.on) { color: #6b8aad; }

                /* Body */
                .ac-body { padding: 24px 28px 28px; }

                .ac-head h2 {
                    font-size: 24px; font-weight: 700; color: #e8f0fa;
                    line-height: 1.2; letter-spacing: -0.3px;
                }
                .ac-head p {
                    font-size: 13px; color: #6b8aad; margin-top: 5px; line-height: 1.4;
                }

                /* Form */
                .ac-form { margin-top: 22px; display: flex; flex-direction: column; gap: 16px; }

                .fl { display: block; font-size: 10px; font-weight: 600; color: #2d4a6a;
                    letter-spacing: 1.2px; text-transform: uppercase;
                    font-family: 'IBM Plex Mono', monospace; margin-bottom: 7px; }

                .fw { position: relative; }

                .ai {
                    width: 100%; padding: 12px 16px;
                    background: #0d1520; border: 1px solid rgba(255,255,255,0.07);
                    border-radius: 10px; color: #e8f0fa; font-size: 14px;
                    font-family: 'Syne', sans-serif; outline: none;
                    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
                    -webkit-appearance: none; appearance: none;
                    line-height: 1.4;
                }
                .ai::placeholder { color: #2d4a6a; }
                .ai:focus {
                    border-color: #1a6cff;
                    box-shadow: 0 0 0 3px rgba(26,108,255,0.14), 0 1px 4px rgba(0,0,0,0.2);
                    background: #0f1a28;
                }
                .ai.pt { padding-right: 46px; }

                .tv {
                    position: absolute; right: 13px; top: 50%; transform: translateY(-50%);
                    background: none; border: none; cursor: pointer; padding: 4px;
                    color: #2d4a6a; display: flex; align-items: center;
                    transition: color 0.15s; border-radius: 4px;
                    -webkit-tap-highlight-color: transparent;
                }
                .tv:hover { color: #6b8aad; }

                /* Strength bar */
                .sb { margin-top: 7px; height: 3px; border-radius: 3px; background: rgba(255,255,255,0.06); overflow: hidden; }
                .sf { height: 100%; border-radius: 3px; transition: width 0.35s ease, background 0.35s ease; }
                .sl { font-size: 10px; font-family: 'IBM Plex Mono', monospace; margin-top: 4px; transition: color 0.3s; }

                /* Button */
                .ab {
                    width: 100%; padding: 13px 16px;
                    background: linear-gradient(135deg, #1a6cff 0%, #1558e0 100%);
                    border: none; border-radius: 10px; color: #fff;
                    font-family: 'Syne', sans-serif; font-size: 14.5px; font-weight: 700;
                    letter-spacing: 0.2px; cursor: pointer;
                    transition: all 0.2s; display: flex; align-items: center;
                    justify-content: center; gap: 8px; margin-top: 4px;
                    position: relative; overflow: hidden;
                    box-shadow: 0 4px 20px rgba(26,108,255,0.25), 0 1px 4px rgba(0,0,0,0.2);
                    -webkit-tap-highlight-color: transparent;
                }
                .ab::after {
                    content: ''; position: absolute; inset: 0;
                    background: linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 60%);
                }
                .ab:hover:not(:disabled) {
                    background: linear-gradient(135deg, #1d72ff 0%, #1860f0 100%);
                    transform: translateY(-1px);
                    box-shadow: 0 8px 28px rgba(26,108,255,0.38), 0 2px 8px rgba(0,0,0,0.2);
                }
                .ab:active:not(:disabled) { transform: translateY(0); }
                .ab:disabled { opacity: 0.55; cursor: not-allowed; }

                /* Alerts */
                .ae {
                    background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.22);
                    border-radius: 10px; padding: 11px 14px; font-size: 13px; color: #fca5a5;
                    display: flex; align-items: flex-start; gap: 9px; line-height: 1.4;
                }
                .ae svg { flex-shrink: 0; margin-top: 1px; }
                .as {
                    background: rgba(34,197,94,0.08); border: 1px solid rgba(34,197,94,0.22);
                    border-radius: 10px; padding: 11px 14px; font-size: 13px; color: #86efac;
                    display: flex; align-items: center; gap: 9px;
                }

                /* Demo badge */
                .db {
                    background: rgba(26,108,255,0.07); border: 1px solid rgba(26,108,255,0.18);
                    border-radius: 10px; padding: 10px 14px;
                    display: flex; align-items: center; justify-content: space-between; gap: 8px;
                    flex-wrap: wrap;
                }
                .db p { font-size: 12px; color: #6b8aad; }
                .db strong {
                    color: #60a5fa; font-family: 'IBM Plex Mono', monospace;
                    font-size: 11.5px; font-weight: 500;
                }

                /* Footer */
                .ac-foot {
                    padding: 15px 28px 18px; border-top: 1px solid rgba(255,255,255,0.05);
                    display: flex; align-items: center; justify-content: center; gap: 5px;
                    flex-wrap: wrap;
                }
                .ac-foot p { font-size: 12.5px; color: #2d4a6a; }
                .ac-foot button {
                    background: none; border: none; font-family: 'Syne', sans-serif;
                    font-size: 12.5px; color: #1a6cff; cursor: pointer; font-weight: 700;
                    transition: color 0.15s; padding: 2px 0;
                    -webkit-tap-highlight-color: transparent;
                }
                .ac-foot button:hover { color: #60a5fa; }

                /* Spinner */
                .sp {
                    width: 17px; height: 17px; border-radius: 50%;
                    border: 2px solid rgba(255,255,255,0.3);
                    border-top-color: #fff; animation: spin 0.7s linear infinite;
                    flex-shrink: 0;
                }
                @keyframes spin { to { transform: rotate(360deg); } }

                /* Slide animation */
                .fs { animation: fslide 0.3s cubic-bezier(0.16,1,0.3,1) both; }
                @keyframes fslide {
                    from { opacity: 0; transform: translateX(10px); }
                    to   { opacity: 1; transform: translateX(0); }
                }

                /* ── RESPONSIVE ── */
                @media (max-width: 480px) {
                    .ar { padding: 12px; align-items: flex-start; padding-top: max(16px, env(safe-area-inset-top)); }
                    .ac { border-radius: 16px; margin: auto; }
                    .ac-brand { padding: 22px 20px 0; }
                    .ac-tabs { padding: 18px 20px 0; }
                    .ac-body { padding: 20px 20px 24px; }
                    .ac-foot { padding: 13px 20px 16px; }
                    .ac-head h2 { font-size: 21px; }
                    .ab { padding: 13px; font-size: 14px; }
                    .ac-tab { font-size: 13px; }
                }

                @media (max-width: 360px) {
                    .ac-brand { gap: 10px; }
                    .ac-shield { width: 36px; height: 36px; border-radius: 10px; }
                    .ac-brand-text h1 { font-size: 15px; }
                }

                /* Landscape phone */
                @media (max-height: 600px) and (orientation: landscape) {
                    .ar { align-items: flex-start; padding-top: 12px; }
                    .ac-brand { padding-top: 18px; }
                    .ac-form { gap: 12px; }
                    .ac-head h2 { font-size: 20px; }
                }
            `}</style>

            <div className="ar">
                <div className="ar-blob1" />
                <div className="ar-blob2" />
                <div className="ar-grid" />

                <div className="ac">
                    {/* Brand */}
                    <div className="ac-brand">
                        <div className="ac-shield">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                                <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C16.5 22.15 20 17.25 20 12V6L12 2z"
                                    fill="rgba(255,255,255,0.18)" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
                                <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="1.8"
                                    strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <div className="ac-brand-text">
                            <h1>ShieldWAF</h1>
                            <p>Security Dashboard</p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="ac-tabs">
                        <button className={`ac-tab${mode === 'signin' ? ' on' : ''}`} onClick={() => switchMode('signin')}>
                            Sign In
                        </button>
                        <button className={`ac-tab${mode === 'signup' ? ' on' : ''}`} onClick={() => switchMode('signup')}>
                            Create Account
                        </button>
                    </div>

                    {/* Body */}
                    <div className="ac-body">
                        {mode === 'signin' ? (
                            <div className="fs" key="signin">
                                <div className="ac-head">
                                    <h2>Welcome back</h2>
                                    <p>Sign in to your WAF dashboard</p>
                                </div>
                                <form className="ac-form" onSubmit={handleSignIn}>
                                    <div className="db">
                                        <p>Demo credentials pre-filled</p>
                                        <strong>admin@shieldwaf.io</strong>
                                    </div>

                                    {err && (
                                        <div className="ae">
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                                            </svg>
                                            <span>{err}</span>
                                        </div>
                                    )}

                                    <div>
                                        <label className="fl">Email</label>
                                        <input className="ai" type="email" autoComplete="email"
                                            placeholder="you@example.com" value={email}
                                            onChange={e => setEmail(e.target.value)} required />
                                    </div>

                                    <div>
                                        <label className="fl">Password</label>
                                        <div className="fw">
                                            <input className="ai pt" type={showPass ? 'text' : 'password'}
                                                autoComplete="current-password" placeholder="••••••••"
                                                value={password} onChange={e => setPassword(e.target.value)} required />
                                            <button type="button" className="tv" onClick={() => setShowPass(p => !p)} tabIndex={-1}>
                                                <EyeIcon open={showPass} />
                                            </button>
                                        </div>
                                    </div>

                                    <button className="ab" type="submit" disabled={submitting}>
                                        {submitting && <span className="sp" />}
                                        {submitting ? 'Signing in…' : 'Sign In'}
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <div className="fs" key="signup">
                                <div className="ac-head">
                                    <h2>Create account</h2>
                                    <p>Start monitoring your web traffic</p>
                                </div>
                                <form className="ac-form" onSubmit={handleSignUp}>
                                    {err && (
                                        <div className="ae">
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                                            </svg>
                                            <span>{err}</span>
                                        </div>
                                    )}
                                    {success && (
                                        <div className="as">
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                            {success}
                                        </div>
                                    )}

                                    <div>
                                        <label className="fl">Full Name</label>
                                        <input className="ai" type="text" autoComplete="name"
                                            placeholder="John Doe" value={name}
                                            onChange={e => setName(e.target.value)} required />
                                    </div>

                                    <div>
                                        <label className="fl">Email</label>
                                        <input className="ai" type="email" autoComplete="email"
                                            placeholder="you@example.com" value={regEmail}
                                            onChange={e => setRegEmail(e.target.value)} required />
                                    </div>

                                    <div>
                                        <label className="fl">Password</label>
                                        <div className="fw">
                                            <input className="ai pt" type={showRegPass ? 'text' : 'password'}
                                                autoComplete="new-password" placeholder="Min. 6 characters"
                                                value={regPassword} onChange={e => setRegPassword(e.target.value)} required />
                                            <button type="button" className="tv" onClick={() => setShowRegPass(p => !p)} tabIndex={-1}>
                                                <EyeIcon open={showRegPass} />
                                            </button>
                                        </div>
                                        {regPassword.length > 0 && (
                                            <>
                                                <div className="sb">
                                                    <div className="sf" style={{ width: strength.w, background: strength.color }} />
                                                </div>
                                                <p className="sl" style={{ color: strength.color }}>{strength.label}</p>
                                            </>
                                        )}
                                    </div>

                                    <div>
                                        <label className="fl">Confirm Password</label>
                                        <div className="fw">
                                            <input className="ai pt" type={showConfirmPass ? 'text' : 'password'}
                                                autoComplete="new-password" placeholder="Repeat password"
                                                value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                                            <button type="button" className="tv" onClick={() => setShowConfirmPass(p => !p)} tabIndex={-1}>
                                                <EyeIcon open={showConfirmPass} />
                                            </button>
                                        </div>
                                        {confirmPassword.length > 0 && regPassword !== confirmPassword && (
                                            <p style={{ fontSize: 11, color: '#ef4444', marginTop: 5, fontFamily: "'IBM Plex Mono', monospace" }}>
                                                Passwords don't match
                                            </p>
                                        )}
                                    </div>

                                    <button className="ab" type="submit" disabled={submitting}>
                                        {submitting && <span className="sp" />}
                                        {submitting ? 'Creating account…' : 'Create Account'}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="ac-foot">
                        {mode === 'signin' ? (
                            <><p>Don't have an account?</p><button onClick={() => switchMode('signup')}>Create one</button></>
                        ) : (
                            <><p>Already have an account?</p><button onClick={() => switchMode('signin')}>Sign in</button></>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

function EyeIcon({ open }: { open: boolean }) {
    return open ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
            <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
            <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
    ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    )
}