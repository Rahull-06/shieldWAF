// PATH: client/src/components/MetricCard.tsx
'use client'

interface MetricCardProps {
    label:      string
    value:      string
    sub?:       string
    accent?:    string
    icon?:      string
    sparkData?: number[]
    isDemo?:    boolean
}

export default function MetricCard({
    label,
    value,
    sub,
    accent = '#1a6cff',
    icon,
    sparkData = [],
    isDemo = false,
}: MetricCardProps) {
    const max = Math.max(...sparkData, 1)

    return (
        <>
            <style>{`
                .mc {
                    background: var(--bg2);
                    border: 1px solid var(--border);
                    border-radius: 11px;
                    overflow: hidden;
                    transition: border-color 0.2s, transform 0.2s;
                    cursor: default;
                }
                .mc:hover {
                    border-color: var(--mc-accent, #1a6cff) !important;
                    transform: translateY(-2px);
                }
                .mc-body { padding: 14px 15px 13px; }
                .mc-top  { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
                .mc-label { font-size: 11.5px; color: var(--text2); font-weight: 500; line-height: 1.3; }
                .mc-val   { font-size: 24px; font-weight: 700; color: var(--text); letter-spacing: -.5px; line-height: 1; margin-bottom: 4px; }
                .mc-sub   { font-size: 11px; color: var(--text3); }
                .mc-spark { display: flex; align-items: flex-end; gap: 2px; height: 24px; margin-top: 10px; }
                .mc-bar   { flex: 1; border-radius: 2px; min-height: 3px; }
                .mc-badge { font-size: 9px; font-weight: 700; letter-spacing: .5px; color: #1a6cff; background: #0d1f40; border: 1px solid #1a6cff22; padding: 2px 5px; border-radius: 3px; flex-shrink: 0; margin-top: 1px; }

                @media (max-width: 380px) {
                    .mc-val   { font-size: 20px; }
                    .mc-label { font-size: 11px; }
                    .mc-body  { padding: 12px 12px 11px; }
                }
            `}</style>
            <div
                className="mc"
                style={{ '--mc-accent': accent } as React.CSSProperties}
            >
                {/* Accent top bar */}
                <div style={{ height: '3px', background: accent }} />

                <div className="mc-body">
                    <div className="mc-top">
                        <span className="mc-label">{label}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {isDemo && <span className="mc-badge">DEMO</span>}
                            {icon && <span style={{ fontSize: '15px' }}>{icon}</span>}
                        </div>
                    </div>

                    <div className="mc-val">{value}</div>
                    {sub && <div className="mc-sub">{sub}</div>}

                    {sparkData.length > 0 && (
                        <div className="mc-spark">
                            {sparkData.map((v, i) => (
                                <div
                                    key={i}
                                    className="mc-bar"
                                    style={{
                                        height: `${Math.max(12, (v / max) * 100)}%`,
                                        background: accent,
                                        opacity: 0.25 + (i / sparkData.length) * 0.75,
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}