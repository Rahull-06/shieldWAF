// PATH: client/src/hooks/useAuth.ts
'use client'
import { useState, useEffect, useCallback } from 'react'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export interface AuthUser {
    _id: string
    name: string
    email: string
    role: string
    avatar?: string
}

export function useAuth() {
    const [user, setUser] = useState<AuthUser | null>(null)
    const [loading, setLoading] = useState(true)

    const getToken = () => (typeof window !== 'undefined' ? localStorage.getItem('token') : null)

    // Fetch current user on mount
    useEffect(() => {
        const token = getToken()
        if (!token) { setLoading(false); return }
        fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.ok ? r.json() : null)
            .then(data => setUser(data?.user ?? null))
            .catch(() => setUser(null))
            .finally(() => setLoading(false))
    }, [])

    const login = useCallback(async (email: string, password: string) => {
        const res = await fetch(`${API}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Login failed')
        localStorage.setItem('token', data.token)
        setUser(data.user)
        return data.user
    }, [])

    // NEW: register + auto-login
    const register = useCallback(async (name: string, email: string, password: string) => {
        const res = await fetch(`${API}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Registration failed')
        // Auto-login after register
        localStorage.setItem('token', data.token)
        setUser(data.user)
        return data.user
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