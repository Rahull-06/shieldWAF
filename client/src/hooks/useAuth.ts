'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { authApi } from '@/services/api'
import type { User } from '@/types'

export function useAuth() {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    const fetchMe = useCallback(async () => {
        const token = localStorage.getItem('token')
        if (!token) { setIsLoading(false); return }
        const res = await authApi.me()
        if (res.success && res.data) {
            setUser((res.data as { user: User }).user)
        } else {
            localStorage.removeItem('token')
        }
        setIsLoading(false)
    }, [])

    useEffect(() => { fetchMe() }, [fetchMe])

    const login = async (email: string, password: string) => {
        const res = await authApi.login(email, password)
        if (res.success && res.data) {
            localStorage.setItem('token', res.data.token)
            setUser(res.data.user as User)
            router.push('/dashboard')
            return { success: true }
        }
        return { success: false, error: res.error }
    }

    const logout = async () => {
        await authApi.logout()
        localStorage.removeItem('token')
        setUser(null)
        router.push('/login')
    }

    return { user, isLoading, login, logout }
}