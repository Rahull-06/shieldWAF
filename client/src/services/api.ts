// PATH: client/src/services/api.ts
import type {
    ApiResponse, LogEntry, WafRule, PaginatedResponse,
    MetricsSummary, TrafficPoint, ThreatBreakdown, GeoEntry, SimResult,
} from '@/types'

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

// ── Core fetch wrapper ────────────────────────────────────────────────────────
async function request<T>(
    path: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers as Record<string, string> || {}),
    }
    try {
        const res = await fetch(`${BASE}${path}`, { ...options, headers })
        const data = await res.json()
        if (!res.ok) return { success: false, error: data.message || data.error || 'Request failed' }
        return { success: true, data: data.data ?? data }
    } catch {
        return { success: false, error: 'Network error — is the server running?' }
    }
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
    login: (email: string, password: string) =>
        request<{ token: string; user: unknown }>('/auth/login', {
            method: 'POST', body: JSON.stringify({ email, password }),
        }),
    register: (name: string, email: string, password: string) =>
        request<{ token: string; user: unknown }>('/auth/register', {
            method: 'POST', body: JSON.stringify({ name, email, password }),
        }),
    me: () => request<{ user: unknown }>('/auth/me'),
    logout: () => request('/auth/logout', { method: 'POST' }),
    updateMe: (data: { name?: string; email?: string }) =>
        request<{ user: unknown }>('/auth/me', { method: 'PATCH', body: JSON.stringify(data) }),
    changePassword: (currentPassword: string, newPassword: string) =>
        request('/auth/change-password', {
            method: 'PATCH', body: JSON.stringify({ currentPassword, newPassword }),
        }),
}

// ── Metrics ───────────────────────────────────────────────────────────────────
export const metricsApi = {
    getSummary: () => request<MetricsSummary>('/metrics/summary'),
    getTraffic: () => request<TrafficPoint[]>('/metrics/traffic'),
    getThreatBreakdown: () => request<ThreatBreakdown[]>('/metrics/threats'),
    getGeo: () => request<GeoEntry[]>('/metrics/geo'),
}

// ── Logs ──────────────────────────────────────────────────────────────────────
export const logsApi = {
    getLogs: (params?: Record<string, string>) => {
        const q = params ? '?' + new URLSearchParams(params).toString() : ''
        return request<PaginatedResponse<LogEntry>>(`/logs${q}`)
    },
    getRecent: () => request<LogEntry[]>('/logs/recent'),
    deleteLog: (id: string) => request(`/logs/${id}`, { method: 'DELETE' }),
}

// ── Rules ─────────────────────────────────────────────────────────────────────
export const rulesApi = {
    getRules: (params?: Record<string, string>) => {
        const q = params ? '?' + new URLSearchParams(params).toString() : ''
        return request<WafRule[]>(`/rules${q}`)
    },
    createRule: (rule: Partial<WafRule>) =>
        request<WafRule>('/rules', { method: 'POST', body: JSON.stringify(rule) }),
    updateRule: (id: string, data: Partial<WafRule>) =>
        request<WafRule>(`/rules/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    toggleRule: (id: string) =>
        request<WafRule>(`/rules/${id}/toggle`, { method: 'PATCH' }),
    deleteRule: (id: string) =>
        request(`/rules/${id}`, { method: 'DELETE' }),
}

// ── Simulator ─────────────────────────────────────────────────────────────────
export const simulatorApi = {
    simulate: (data: { type: string; endpoint: string; method: string; payload: string }) =>
        request<SimResult>('/simulate', { method: 'POST', body: JSON.stringify(data) }),
}

// ── WAF status ────────────────────────────────────────────────────────────────
export const wafApi = {
    getStatus: () => request<unknown>('/waf/status'),
}