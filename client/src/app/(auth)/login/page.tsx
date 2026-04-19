'use client'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { ShieldIcon as ShieldIcon } from 'lucide-react'

export default function LoginPage() {
    const { login } = useAuth()
    const [email, setEmail] = useState('admin@shieldwaf.io')
    const [password, setPassword] = useState('password')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true); setError('')
        const res = await login(email, password)
        if (!res.success) setError(res.error || 'Login failed')
        setLoading(false)
    }

    return (
        <div className="w-full max-w-sm animate-fadein">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-10 justify-center">
                <div className="w-9 h-9 bg-blue rounded-xl flex items-center justify-center flex-shrink-0">
                    <ShieldIcon />
                </div>
                <div>
                    <div className="text-base font-bold text-text1 tracking-tight">ShieldWAF</div>
                    <div className="text-[10px] text-text3 tracking-widest uppercase">Security Dashboard</div>
                </div>
            </div>

            <div className="bg-bg2 border border-border1 rounded-2xl p-8">
                <h1 className="text-lg font-semibold text-text1 mb-1">Sign in</h1>
                <p className="text-sm text-text2 mb-6">Access your WAF dashboard</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs text-text2 mb-1.5 uppercase tracking-wider">Email</label>
                        <input
                            className="inp w-full"
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-text2 mb-1.5 uppercase tracking-wider">Password</label>
                        <input
                            className="inp w-full"
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && (
                        <div className="text-xs text-red-400 bg-red-950 border border-red-900 rounded-lg px-3 py-2">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue hover:bg-blue/90 text-white font-semibold text-sm py-2.5 rounded-lg transition-colors disabled:opacity-60"
                    >
                        {loading ? 'Signing in…' : 'Sign in'}
                    </button>
                </form>

                <div className="mt-6 pt-5 border-t border-border1">
                    <p className="text-xs text-text3 text-center">
                        Demo credentials pre-filled above
                    </p>
                </div>
            </div>
        </div>
    )
}