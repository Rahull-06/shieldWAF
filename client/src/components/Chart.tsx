// PATH: client/src/components/Chart.tsx
'use client'
import { useRef, useEffect, useState } from 'react'

const HOURS = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00']

export interface TrafficPoint {
    hour:     string
    requests: number
    blocked:  number
}

function makeDemo(): { req: number[]; blk: number[] } {
    const req: number[] = []
    const blk: number[] = []
    for (let i = 0; i < 24; i++) {
        const base = 200 + Math.sin((i - 6) * Math.PI / 12) * 1400 + Math.random() * 200
        req.push(Math.max(80, Math.round(base)))
        blk.push(Math.round(req[i] * (0.05 + Math.random() * 0.08)))
    }
    return { req, blk }
}

interface Tooltip { x: number; y: number; req: number; blk: number; hour: string }

interface Props {
    data?: TrafficPoint[]
}

export default function Chart({ data }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const wrapRef   = useRef<HTMLDivElement>(null)
    const [tooltip, setTooltip] = useState<Tooltip | null>(null)

    // Resolve chart data: use prop if provided, else generate demo
    const chartData = (() => {
        if (data && data.length > 0) {
            return {
                req: data.map(d => d.requests),
                blk: data.map(d => d.blocked),
            }
        }
        return makeDemo()
    })()

    const draw = () => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const W = canvas.width
        const H = canvas.height
        const PAD = { top: 20, right: 16, bottom: 30, left: 46 }
        const innerW = W - PAD.left - PAD.right
        const innerH = H - PAD.top - PAD.bottom

        ctx.clearRect(0, 0, W, H)

        const maxReq = Math.max(...chartData.req) * 1.1 || 100
        const pts = chartData.req.length

        const xAt = (i: number) => PAD.left + (i / Math.max(pts - 1, 1)) * innerW
        const yAt = (v: number) => PAD.top + innerH - (v / maxReq) * innerH

        // ── Grid ─────────────────────────────────────────────
        ctx.strokeStyle = 'rgba(30,42,56,.6)'
        ctx.lineWidth = 1
        for (let i = 0; i <= 4; i++) {
            const y = PAD.top + (i / 4) * innerH
            ctx.beginPath()
            ctx.moveTo(PAD.left, y)
            ctx.lineTo(PAD.left + innerW, y)
            ctx.stroke()
            const val = Math.round(maxReq * (1 - i / 4))
            ctx.fillStyle = '#3d5570'
            ctx.font = '10px system-ui,sans-serif'
            ctx.textAlign = 'right'
            ctx.fillText(val >= 1000 ? (val / 1000).toFixed(1) + 'k' : String(val), PAD.left - 7, y + 3.5)
        }

        // ── Hour labels ───────────────────────────────────────
        ctx.textAlign = 'center'
        ctx.fillStyle = '#3d5570'
        ctx.font = '10px system-ui,sans-serif'
        HOURS.forEach((h, i) => {
            const x = PAD.left + (i / (HOURS.length - 1)) * innerW
            ctx.fillText(h, x, PAD.top + innerH + 18)
        })

        // ── Requests fill ─────────────────────────────────────
        const grad = ctx.createLinearGradient(0, PAD.top, 0, PAD.top + innerH)
        grad.addColorStop(0, 'rgba(59,130,246,.22)')
        grad.addColorStop(1, 'rgba(59,130,246,.02)')
        ctx.beginPath()
        chartData.req.forEach((v, i) => {
            i === 0 ? ctx.moveTo(xAt(i), yAt(v)) : ctx.lineTo(xAt(i), yAt(v))
        })
        ctx.lineTo(xAt(pts - 1), PAD.top + innerH)
        ctx.lineTo(PAD.left, PAD.top + innerH)
        ctx.closePath()
        ctx.fillStyle = grad
        ctx.fill()

        // ── Requests line ─────────────────────────────────────
        ctx.beginPath()
        ctx.strokeStyle = '#3b82f6'
        ctx.lineWidth = 2
        ctx.lineJoin = 'round'
        chartData.req.forEach((v, i) => {
            i === 0 ? ctx.moveTo(xAt(i), yAt(v)) : ctx.lineTo(xAt(i), yAt(v))
        })
        ctx.stroke()

        // ── Blocked dashed ────────────────────────────────────
        ctx.beginPath()
        ctx.strokeStyle = '#ef4444'
        ctx.lineWidth = 1.5
        ctx.setLineDash([4, 4])
        chartData.blk.forEach((v, i) => {
            i === 0 ? ctx.moveTo(xAt(i), yAt(v)) : ctx.lineTo(xAt(i), yAt(v))
        })
        ctx.stroke()
        ctx.setLineDash([])
    }

    useEffect(() => {
        const canvas = canvasRef.current
        const wrap   = wrapRef.current
        if (!canvas || !wrap) return
        const resize = () => {
            canvas.width  = wrap.clientWidth
            canvas.height = wrap.clientHeight
            draw()
        }
        resize()
        const ro = new ResizeObserver(resize)
        ro.observe(wrap)
        return () => ro.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data])

    // ── Tooltip on mouse move ─────────────────────────────────
    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current
        const wrap   = wrapRef.current
        if (!canvas || !wrap) return

        const rect  = canvas.getBoundingClientRect()
        const mx    = e.clientX - rect.left
        const PAD_L = 46, PAD_R = 16, PAD_T = 20, PAD_B = 30
        const innerW = canvas.width - PAD_L - PAD_R

        if (mx < PAD_L || mx > PAD_L + innerW) { setTooltip(null); return }

        const frac = (mx - PAD_L) / innerW
        const idx  = Math.min(Math.round(frac * (chartData.req.length - 1)), chartData.req.length - 1)
        const hour = `${String(idx).padStart(2, '0')}:00`
        const maxReq = Math.max(...chartData.req) * 1.1 || 100
        const cx   = mx
        const cy   = PAD_T + (1 - chartData.req[idx] / maxReq) * (canvas.height - PAD_T - PAD_B) - 48

        setTooltip({ x: cx, y: Math.max(4, cy), req: chartData.req[idx], blk: chartData.blk[idx], hour })
    }

    return (
        <>
            <style>{`
                .chart-outer { position: relative; height: 188px; }
                .chart-tooltip {
                    position: absolute;
                    background: var(--bg2);
                    border: 1px solid var(--border2);
                    border-radius: 9px;
                    padding: 9px 13px;
                    pointer-events: none;
                    font-size: 11.5px;
                    white-space: nowrap;
                    z-index: 20;
                    box-shadow: 0 6px 24px rgba(0,0,0,.5);
                    transform: translateX(-50%);
                }
                @media (max-width: 480px) { .chart-outer { height: 150px; } }
            `}</style>

            <div className="chart-outer" ref={wrapRef}>
                <canvas
                    ref={canvasRef}
                    style={{ display: 'block', width: '100%', height: '100%', cursor: 'crosshair' }}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={() => setTooltip(null)}
                />
                {tooltip && (
                    <div className="chart-tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
                        <div style={{ color: 'var(--text3)', marginBottom: 4, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            {tooltip.hour}
                        </div>
                        <div style={{ color: '#93c5fd' }}>
                            Requests: <strong style={{ color: 'var(--text)' }}>{tooltip.req.toLocaleString()}</strong>
                        </div>
                        <div style={{ color: '#fca5a5' }}>
                            Blocked: <strong style={{ color: 'var(--text)' }}>{tooltip.blk.toLocaleString()}</strong>
                        </div>
                        <div style={{ color: 'var(--text3)', fontSize: 10.5, marginTop: 3 }}>
                            Block rate: <strong style={{ color: '#fbbf24' }}>
                                {Math.round((tooltip.blk / Math.max(tooltip.req, 1)) * 100)}%
                            </strong>
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}