// // PATH: client/src/components/MetricCard.tsx
// 'use client'

// interface MetricCardProps {
//     label: string
//     value: string | number
//     change: string
//     changeType: 'good' | 'bad' | 'neutral'
//     color: 'blue' | 'red' | 'green' | 'amber'
//     icon: string
//     sparkData?: number[]
// }

// const COLOR_MAP = {
//     blue: { bar: '#1a6cff', bg: 'rgba(26,108,255,0.08)', border: 'rgba(26,108,255,0.15)', text: '#60a5fa' },
//     red: { bar: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.15)', text: '#f87171' },
//     green: { bar: '#22c55e', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.15)', text: '#4ade80' },
//     amber: { bar: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.15)', text: '#fbbf24' },
// }

// const CHANGE_COLOR = {
//     good: 'text-green-400',
//     bad: 'text-red-400',
//     neutral: 'text-text3',
// }

// export default function MetricCard({ label, value, change, changeType, color, icon, sparkData = [] }: MetricCardProps) {
//     const c = COLOR_MAP[color]
//     const max = Math.max(...sparkData, 1)

//     return (
//         <div
//             className="relative rounded-xl overflow-hidden border transition-all duration-200 hover:border-opacity-50 group"
//             style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}
//         >
//             {/* Top accent bar */}
//             <div className="h-[2px] w-full" style={{ background: c.bar }} />

//             <div className="p-4">
//                 {/* Label + icon */}
//                 <div className="flex items-start justify-between mb-3">
//                     <span className="text-[11px] font-semibold uppercase tracking-[0.8px] text-text3">{label}</span>
//                     <span
//                         className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
//                         style={{ background: c.bg, border: `1px solid ${c.border}` }}
//                     >
//                         {icon}
//                     </span>
//                 </div>

//                 {/* Value */}
//                 <div className="text-2xl font-bold text-text1 tracking-tight leading-none mb-1">
//                     {value}
//                 </div>

//                 {/* Change */}
//                 <div className={`text-[11.5px] font-medium ${CHANGE_COLOR[changeType]} mt-1`}>
//                     {change}
//                 </div>

//                 {/* Sparkbar */}
//                 {sparkData.length > 0 && (
//                     <div className="flex items-end gap-[2px] h-8 mt-3">
//                         {sparkData.map((v, i) => (
//                             <div
//                                 key={i}
//                                 className="flex-1 rounded-[2px] transition-opacity group-hover:opacity-100 opacity-60"
//                                 style={{
//                                     height: `${Math.max(15, (v / max) * 100)}%`,
//                                     background: c.bar,
//                                 }}
//                             />
//                         ))}
//                     </div>
//                 )}
//             </div>
//         </div>
//     )
// }






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