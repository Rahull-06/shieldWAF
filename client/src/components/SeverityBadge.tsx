import type { Severity, LogAction } from '@/types'

const SEV_CLASS: Record<Severity, string> = {
    Critical: 'sev-critical',
    High: 'sev-high',
    Medium: 'sev-medium',
    Low: 'sev-low',
}

const ACTION_CLASS: Record<LogAction, string> = {
    Blocked: 'badge-blocked',
    Allowed: 'badge-allowed',
    Warning: 'badge-warning',
}

export function SeverityBadge({ severity }: { severity: Severity }) {
    return <span className={SEV_CLASS[severity]}>{severity}</span>
}

export function ActionBadge({ action }: { action: LogAction }) {
    return <span className={ACTION_CLASS[action]}>{action.toUpperCase()}</span>
}