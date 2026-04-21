// PATH: client/src/types/index.ts

// ── Generic API wrapper ───────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
    success: boolean
    data?: T
    error?: string
    message?: string
}

export interface PaginatedResponse<T> {
    items: T[]
    total: number
    page: number
    limit: number
    pages: number
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export interface User {
    _id: string
    name: string
    email: string
    role: 'admin' | 'user'
    avatar?: string
    isActive?: boolean
    createdAt?: string
}

// ── Logs ──────────────────────────────────────────────────────────────────────
export type AttackType =
    | 'SQL Injection'
    | 'XSS'
    | 'Path Traversal'
    | 'Command Injection'
    | 'CSRF'
    | 'XXE'
    | 'SSRF'
    | 'Brute Force'
    | 'Clean'

export type Severity = 'Critical' | 'High' | 'Medium' | 'Low'
export type LogAction = 'Blocked' | 'Allowed' | 'Warning'

export interface LogEntry {
    id: string
    timestamp: string
    ip: string
    country: string
    countryFlag: string
    countryCode?: string
    method: string
    path?: string
    attackType: AttackType
    payload: string
    severity: Severity
    riskScore: number
    action: LogAction
    ruleTriggered?: string
}

// ── Rules ─────────────────────────────────────────────────────────────────────
export interface WafRule {
    id: string
    ruleId?: string
    name: string
    description: string
    category: string
    action: 'Block' | 'Allow' | 'Monitor'
    severity: Severity
    patterns?: string[]
    hits: number
    enabled: boolean
    createdAt?: string
}

// ── Sites ─────────────────────────────────────────────────────────────────────
export type SiteEnv = 'Production' | 'Staging' | 'Development'
export type SiteStatus = 'active' | 'inactive' | 'pending'

export interface Site {
    id: string
    url: string
    env: SiteEnv
    status: SiteStatus
    requests: number
    blocked: number
    threats: number
    riskScore: number
    uptime: string
    createdAt?: string
}

// ── Metrics ───────────────────────────────────────────────────────────────────
export interface MetricsSummary {
    totalRequests: number | string
    blockedAttacks: number | string
    activeThreats: number | string
    activeRules: number | string
    uptime: string
    last24hBlocked: number
    rpsNow?: number
    bandwidthSaved?: string
    sitesProtected?: number
}

export interface Metric {
    label: string
    value: string | number
    change?: string
    changeType?: 'good' | 'bad' | 'neutral'
    color: 'blue' | 'red' | 'green' | 'amber' | 'cyan' | 'purple'
    icon?: string
    sparkData?: number[]
}

export interface TrafficPoint {
    label: string
    requests: number
    blocked: number
}

export interface ThreatBreakdown {
    name: string
    count: number
    pct: number
    color: string
}

export interface GeoEntry {
    flag: string
    code: string
    name: string
    count: number
    pct: number
    color: string
}

// ── Live feed ─────────────────────────────────────────────────────────────────
export interface FeedEntry {
    id: string
    timestamp: string
    ip: string
    method: string
    payload: string
    action: 'blocked' | 'allowed' | 'warning'
    attackType?: string
    country?: string
    flag?: string
}

// ── Simulator ─────────────────────────────────────────────────────────────────
export type SimAttackType = 'sqli' | 'xss' | 'path' | 'cmd' | 'csrf' | 'xxe' | 'ssrf' | 'brute'

export interface SimResult {
    detected: boolean
    attackType: string
    endpoint: string
    payload: string
    riskScore: number
    confidence: number
    verdict: 'BLOCKED' | 'ALLOWED'
    httpStatus: number
    processingTime: string
    summary: string
    rulesTriggered: { id?: string; name: string; match: boolean }[]
}

// ── Settings ──────────────────────────────────────────────────────────────────
export interface WafSettings {
    wafEnabled: boolean
    learningMode: boolean
    autoBlock: boolean
    ddosProtection: boolean
    geoBlocking: boolean
    ipReputation: boolean
    rateLimiting: boolean
    loginRateLimit: number
    emailAlerts: boolean
    realTimeAlerts: boolean
    webhook: boolean
    alertEmail: string
    logPayloads: boolean
    logRetention: number
}