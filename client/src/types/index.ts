// PATH: client/src/types/index.ts

export type AttackType = 'SQL Injection' | 'XSS' | 'Path Traversal' | 'Command Injection' | 'CSRF' | 'XXE' | 'SSRF' | 'Brute Force'
export type SimAttackType = 'sqli' | 'xss' | 'path' | 'cmd' | 'csrf' | 'xxe' | 'ssrf' | 'brute'
export type Severity = 'Critical' | 'High' | 'Medium' | 'Low'
export type LogAction = 'Blocked' | 'Allowed' | 'Warning'

export interface LogEntry {
    id: string
    timestamp: string
    ip: string
    country: string
    countryFlag: string
    method: string
    path?: string
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
    sparkData?: number[]
}

export interface FeedEntry {
    id: string
    timestamp: string
    ip: string
    method: string
    payload: string
    action: 'blocked' | 'allowed' | 'warning'
    color?: string
}

export interface WafRule {
    id: string
    name: string
    description: string
    category: string
    action: 'Block' | 'Allow' | 'Monitor'
    severity: Severity
    hits: number
    enabled: boolean
}

export interface MetricsSummary {
    totalRequests: string | number
    threatsBlocked: string | number
    avgResponse: string
    activeRules: string | number
}

export interface SimResult {
    detected: boolean
    attackType: string
    endpoint: string
    method: string
    payload: string
    riskScore: number
    confidence: number
    rulesTriggered: { name: string; match: boolean }[]
}

export interface User {
    id: string
    email: string
    name: string
    role: 'admin' | 'viewer'
    createdAt: string
}