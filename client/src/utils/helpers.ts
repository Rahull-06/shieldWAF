// client/src/utils/helpers.ts

// ── Number formatting ─────────────────────────────────────────────────────────
export function fmt(n: number): string {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
    return String(n);
}

// ── Time formatting ───────────────────────────────────────────────────────────
export function timeAgo(dateStr: string): string {
    const s = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (s < 60) return `${s}s ago`;
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
}

export function formatTime(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
}

export function formatDateTime(dateStr: string): string {
    return new Date(dateStr).toLocaleString('en-US', {
        month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

// ── Attack type labels ────────────────────────────────────────────────────────
export const ATTACK_LABELS: Record<string, string> = {
    sqli: 'SQL Injection',
    xss: 'XSS',
    path: 'Path Traversal',
    cmd: 'Command Injection',
    cmdi: 'Command Injection',
    xxe: 'XXE Injection',
    csrf: 'CSRF',
    rce: 'Remote Code Exec',
    ssrf: 'SSRF',
    lfi: 'LFI',
    none: '—',
};

// ── Country flags ─────────────────────────────────────────────────────────────
export const COUNTRY_FLAGS: Record<string, string> = {
    Russia: '🇷🇺',
    China: '🇨🇳',
    'United States': '🇺🇸',
    India: '🇮🇳',
    Netherlands: '🇳🇱',
    Germany: '🇩🇪',
    France: '🇫🇷',
    Brazil: '🇧🇷',
    UK: '🇬🇧',
    Ukraine: '🇺🇦',
    Other: '🌍',
};

export const COUNTRY_CODES: Record<string, string> = {
    Russia: 'RU', China: 'CN', 'United States': 'US',
    India: 'IN', Netherlands: 'NL', Germany: 'DE',
    France: 'FR', Brazil: 'BR', UK: 'GB',
    Ukraine: 'UA', Other: '??',
};

// ── IP → Country heuristic ────────────────────────────────────────────────────
export function ipToCountry(ip: string): string {
    if (!ip) return 'Other';
    if (ip.startsWith('109.169') || ip.startsWith('91.108') || ip.startsWith('5.188')) return 'Russia';
    if (ip.startsWith('45.155') || ip.startsWith('103.76') || ip.startsWith('116.') || ip.startsWith('47.')) return 'China';
    if (ip.startsWith('104.') || ip.startsWith('203.') || ip.startsWith('198.51') || ip.startsWith('67.')) return 'United States';
    if (ip.startsWith('172.16') || ip.startsWith('103.21') || ip.startsWith('49.') || ip.startsWith('117.')) return 'India';
    if (ip.startsWith('77.') || ip.startsWith('185.220')) return 'Netherlands';
    if (ip.startsWith('89.') || ip.startsWith('212.')) return 'France';
    if (ip.startsWith('179.') || ip.startsWith('189.') || ip.startsWith('201.')) return 'Brazil';
    if (ip.startsWith('81.') || ip.startsWith('94.')) return 'UK';
    if (ip.startsWith('176.')) return 'Ukraine';
    return 'Other';
}

// ── Color maps ────────────────────────────────────────────────────────────────
export const SEVERITY_STYLE: Record<string, { bg: string; color: string; border: string }> = {
    critical: { bg: 'rgba(239,68,68,0.12)', color: '#fca5a5', border: 'rgba(239,68,68,0.25)' },
    high: { bg: 'rgba(249,115,22,0.12)', color: '#fdba74', border: 'rgba(249,115,22,0.25)' },
    medium: { bg: 'rgba(234,179,8,0.12)', color: '#fde68a', border: 'rgba(234,179,8,0.25)' },
    low: { bg: 'rgba(34,197,94,0.12)', color: '#86efac', border: 'rgba(34,197,94,0.25)' },
    none: { bg: 'rgba(100,116,139,0.12)', color: '#94a3b8', border: 'rgba(100,116,139,0.2)' },
};

export const ACTION_STYLE: Record<string, { bg: string; color: string }> = {
    blocked: { bg: 'rgba(239,68,68,0.12)', color: '#fca5a5' },
    allowed: { bg: 'rgba(34,197,94,0.12)', color: '#86efac' },
    flagged: { bg: 'rgba(245,158,11,0.12)', color: '#fcd34d' },
};

export const METHOD_COLOR: Record<string, string> = {
    GET: '#60a5fa',
    POST: '#fb923c',
    PUT: '#a78bfa',
    DELETE: '#f87171',
    PATCH: '#34d399',
    OPTIONS: '#94a3b8',
    HEAD: '#94a3b8',
};

export const CAT_STYLE: Record<string, { bg: string; color: string }> = {
    sqli: { bg: 'rgba(239,68,68,0.1)', color: '#fca5a5' },
    xss: { bg: 'rgba(249,115,22,0.1)', color: '#fdba74' },
    path: { bg: 'rgba(234,179,8,0.1)', color: '#fde68a' },
    xxe: { bg: 'rgba(139,92,246,0.1)', color: '#c4b5fd' },
    csrf: { bg: 'rgba(6,182,212,0.1)', color: '#67e8f9' },
    cmd: { bg: 'rgba(236,72,153,0.1)', color: '#f9a8d4' },
    rce: { bg: 'rgba(239,68,68,0.1)', color: '#fca5a5' },
    custom: { bg: 'rgba(100,116,139,0.1)', color: '#94a3b8' },
};