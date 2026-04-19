// // ─── Auth ────────────────────────────────────────────────────────────────────
// export interface User {
//     id: string
//     name: string
//     email: string
//     role: 'admin' | 'user'
//     avatar?: string
//     createdAt: string
// }

// export interface AuthState {
//     user: User | null
//     token: string | null
//     isLoading: boolean
// }

// // ─── Metrics ─────────────────────────────────────────────────────────────────
// export interface Metric {
//     label: string
//     value: string | number
//     change?: string
//     changeType?: 'good' | 'bad' | 'neutral'
//     color: 'blue' | 'red' | 'green' | 'amber' | 'cyan' | 'purple'
//     icon?: string
//     sparkData?: number[]
// }

// // ─── Logs ─────────────────────────────────────────────────────────────────────
// export type AttackType =
//     | 'SQL Injection'
//     | 'XSS'
//     | 'Path Traversal'
//     | 'Command Injection'
//     | 'CSRF'
//     | 'XXE'
//     | 'SSRF'
//     | 'Brute Force'

// export type Severity = 'Critical' | 'High' | 'Medium' | 'Low'
// export type LogAction = 'Blocked' | 'Allowed' | 'Warning'

// export interface LogEntry {
//     id: string
//     timestamp: string
//     ip: string
//     country: string
//     countryFlag: string
//     method: string
//     path: string
//     attackType: AttackType
//     payload: string
//     severity: Severity
//     riskScore: number
//     action: LogAction
// }

// // ─── Rules ────────────────────────────────────────────────────────────────────
// export interface WafRule {
//     id: string
//     name: string
//     description: string
//     category: string
//     action: 'Block' | 'Allow' | 'Monitor'
//     severity: Severity
//     hits: number
//     enabled: boolean
// }

// // ─── Sites ────────────────────────────────────────────────────────────────────
// export type SiteEnv = 'Production' | 'Staging' | 'Development'
// export type SiteStatus = 'active' | 'inactive' | 'pending'

// export interface Site {
//     id: string
//     url: string
//     env: SiteEnv
//     status: SiteStatus
//     requests: number
//     blocked: number
//     threats: number
//     riskScore: number
//     uptime: string
// }

// // ─── Feed ────────────────────────────────────────────────────────────────────
// export interface FeedEntry {
//     timestamp: string
//     ip: string
//     method: string
//     payload: string
//     action: 'blocked' | 'allowed'
//     color: string
// }

// // ─── Simulator ───────────────────────────────────────────────────────────────
// export type SimAttackType = 'sqli' | 'xss' | 'path' | 'cmd' | 'csrf' | 'xxe' | 'ssrf' | 'brute'

// export interface SimResult {
//     detected: boolean
//     attackType: string
//     endpoint: string
//     method: string
//     payload: string
//     riskScore: number
//     confidence: number
//     rulesTriggered: { name: string; match: boolean }[]
// }

// // ─── API Responses ───────────────────────────────────────────────────────────
// export interface ApiResponse<T> {
//     success: boolean
//     data?: T
//     error?: string
//     message?: string
// }

// export interface PaginatedResponse<T> {
//     items: T[]
//     total: number
//     page: number
//     limit: number
// }







// PATH: client/src/types/index.ts

export type AttackType =
    | 'SQL Injection' | 'XSS' | 'Path Traversal'
    | 'Command Injection' | 'CSRF' | 'XXE' | 'SSRF' | 'Brute Force'

export type Severity = 'Critical' | 'High' | 'Medium' | 'Low'
export type LogAction = 'Blocked' | 'Allowed' | 'Warning'

export interface LogEntry {
    id: string
    timestamp: string
    ip: string
    country: string
    countryFlag: string
    method: string
    path?: string           // ← optional path field (fixes ts2741)
    attackType: AttackType
    payload: string
    severity: Severity
    riskScore: number
    action: LogAction
}

export interface Metric {
    label: string
    value: string | number
    change: string
    changeType: 'good' | 'bad' | 'neutral'
    color: 'blue' | 'red' | 'green' | 'amber'
    icon: string
    sparkData: number[]
}

export interface FeedEntry {
    id: string
    timestamp: string
    ip: string
    method: string
    payload: string
    action: 'blocked' | 'allowed' | 'warning'
}

export interface WafRule {
    id: string
    name: string
    description: string
    type: AttackType
    severity: Severity
    enabled: boolean
    hits: number
    createdAt: string
}

export interface Site {
    id: string
    name: string
    domain: string
    status: 'active' | 'inactive'
    requestsToday: number
    threatsBlocked: number
    createdAt: string
}

export interface MetricsSummary {
    totalRequests: string | number
    threatsBlocked: string | number
    avgResponse: string
    activeRules: string | number
}

export interface SimResult {
    attackType: AttackType
    payload: string
    verdict: 'BLOCKED' | 'ALLOWED' | 'WARNING'
    riskScore: number
    ruleMatched: string
    processingTime: string
    details: string[]
}

export interface User {
    id: string
    email: string
    name: string
    role: 'admin' | 'viewer'
    createdAt: string
}