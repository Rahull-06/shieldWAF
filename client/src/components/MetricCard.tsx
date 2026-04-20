// PATH: client/src/components/MetricCard.tsx
'use client'

interface Props {
    label: string
    value: string | number
    change: string
    changeType: 'good' | 'bad' | 'neutral'
    color: 'blue' | 'red' | 'green' | 'amber'
    icon: string
    sparkData?: number[]
}

const COLORS = {
    blue: '#1a6cff',
    red: '#ef4444',
    green: '#22c55e',
    amber: '#f59e0b',
}

export default function MetricCard({ label, value, change, changeType, color, icon, sparkData = [] }: Props) {
    const c = COLORS[color]
    const max = Math.max(...sparkData, 1)

    return (
        <div
            style={{
                background: 'var(--bg2)',
                border: '1px solid var(--border)',
                borderRadius: 10, padding: 16,
                position: 'relative', overflow: 'hidden',
                transition: 'border-color .15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border2)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
        >
            {/* Top accent bar */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: c }} />

            {/* Ghost icon */}
            <div style={{ position: 'absolute', right: 14, top: 14, fontSize: 22, opacity: .1 }}>{icon}</div>

            {/* Label */}
            <div style={{ fontSize: 10.5, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.7px', marginBottom: 8, fontWeight: 500 }}>
                {label}
            </div>

            {/* Value */}
            <div style={{ fontSize: 26, fontWeight: 600, color: '#f1f5f9', letterSpacing: -1, lineHeight: 1 }}>
                {value}
            </div>

            {/* Change */}
            <div style={{
                fontSize: 11, marginTop: 5,
                color: changeType === 'good' ? 'var(--green)' : changeType === 'bad' ? 'var(--red)' : 'var(--text3)',
            }}>
                {change}
            </div>

            {/* Sparkbar */}
            {sparkData.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 24, marginTop: 8 }}>
                    {sparkData.map((v, i) => (
                        <div
                            key={i}
                            style={{
                                flex: 1, borderRadius: '2px 2px 0 0',
                                height: `${Math.max(15, (v / max) * 100)}%`,
                                background: c, opacity: .55,
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}