// PATH: client/src/hooks/useAuth.ts
'use client'
import { useState, useEffect, useCallback } from 'react'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export interface AuthUser {
    _id: string; name: string; email: string; role: 'admin' | 'user'; avatar?: string
}

export function useAuth() {
    const [user, setUser] = useState<AuthUser | null>(null)
    const [loading, setLoading] = useState(true)

    const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('token') : null

    useEffect(() => {
        const token = getToken()
        if (!token) { setLoading(false); return }
        fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => {
                if (r.status === 401) { localStorage.removeItem('token'); return null }
                return r.json()
            })
            .then(data => setUser(data?.user ?? null))
            .catch(() => setUser(null))
            .finally(() => setLoading(false))
    }, [])

    const login = useCallback(async (email: string, password: string) => {
        const res = await fetch(`${API}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Login failed')
        localStorage.setItem('token', data.token)
        setUser(data.user)
        return data.user as AuthUser
    }, [])

    const register = useCallback(async (name: string, email: string, password: string) => {
        const res = await fetch(`${API}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, password }) })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Registration failed')
        localStorage.setItem('token', data.token)
        setUser(data.user)
        return data.user as AuthUser
    }, [])

    const logout = useCallback(() => {
        localStorage.removeItem('token')
        setUser(null)
    }, [])

    const updateUser = useCallback((updates: Partial<AuthUser>) => {
        setUser(prev => prev ? { ...prev, ...updates } : prev)
    }, [])

    return { user, loading, login, register, logout, updateUser, getToken }
}