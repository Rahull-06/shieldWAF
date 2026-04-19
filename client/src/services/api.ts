// src/services/api.ts
import type { ApiResponse, LogEntry, WafRule, Site, PaginatedResponse } from '@/types'

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

async function request<T>(
    path: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    }
    try {
        const res = await fetch(`${BASE}${path}`, { ...options, headers })
        const data = await res.json()
        if (!res.ok) return { success: false, error: data.message || 'Request failed' }
        return { success: true, data }
    } catch {
        return { success: false, error: 'Network error' }
    }
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
    login: (email: string, password: string) =>
        request<{ token: string; user: unknown }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),
    logout: () => request('/auth/logout', { method: 'POST' }),
    me: () => request<{ user: unknown }>('/auth/me'),
}

// ─── Metrics ─────────────────────────────────────────────────────────────────
export const metricsApi = {
    getSummary: () => request<unknown>('/metrics/summary'),
    getTraffic: (range?: string) => request<unknown>(`/metrics/traffic?range=${range || '24h'}`),
    getThreatMap: () => request<unknown>('/metrics/threatmap'),
}

// ─── Logs ─────────────────────────────────────────────────────────────────────
export const logsApi = {
    getLogs: (params?: Record<string, string>) => {
        const q = params ? '?' + new URLSearchParams(params).toString() : ''
        return request<PaginatedResponse<LogEntry>>(`/logs${q}`)
    },
    exportCsv: () => `${BASE}/logs/export`,
}

// ─── Rules ───────────────────────────────────────────────────────────────────
export const rulesApi = {
    getRules: () => request<WafRule[]>('/rules'),
    createRule: (rule: Partial<WafRule>) =>
        request<WafRule>('/rules', { method: 'POST', body: JSON.stringify(rule) }),
    updateRule: (id: string, data: Partial<WafRule>) =>
        request<WafRule>(`/rules/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    deleteRule: (id: string) => request(`/rules/${id}`, { method: 'DELETE' }),
}

// ─── Sites ───────────────────────────────────────────────────────────────────
export const sitesApi = {
    getSites: () => request<Site[]>('/sites'),
    addSite: (data: Partial<Site>) =>
        request<Site>('/sites', { method: 'POST', body: JSON.stringify(data) }),
    deleteSite: (id: string) => request(`/sites/${id}`, { method: 'DELETE' }),
}

// ─── Simulator ───────────────────────────────────────────────────────────────
export const simulatorApi = {
    simulate: (payload: { type: string; endpoint: string; method: string; payload: string }) =>
        request<unknown>('/simulate', { method: 'POST', body: JSON.stringify(payload) }),
}