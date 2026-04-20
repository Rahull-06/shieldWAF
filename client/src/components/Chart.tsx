// PATH: client/src/components/Chart.tsx
'use client'
import { useRef, useEffect, useState } from 'react'

const HOURS = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00']

// Generate realistic traffic curve data (24 points)
function makeData() {
    const req: number[] = []
    const blk: number[] = []
    for (let i = 0; i < 24; i++) {
        // Traffic peaks midday
        const base = 200 + Math.sin((i - 6) * Math.PI / 12) * 1400 + Math.random() * 200
        req.push(Math.max(80, Math.round(base)))
        blk.push(Math.round(req[i] * (0.05 + Math.random() * 0.08)))
    }
    return { req, blk }
}

const DATA = makeData()

interface Tooltip { x: number; y: number; req: number; blk: number; hour: string }

export default function Chart() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const wrapRef = useRef<HTMLDivElement>(null)
    const [tooltip, setTooltip] = useState<Tooltip | null>(null)

    const draw = () => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const W = canvas.width
        const H = canvas.height
        const PAD = { top: 20, right: 16, bottom: 30, left: 42 }
        const innerW = W - PAD.left - PAD.right
        const innerH = H - PAD.top - PAD.bottom

        ctx.clearRect(0, 0, W, H)

        const maxReq = Math.max(...DATA.req) * 1.1
        const pts = DATA.req.length

        const xAt = (i: number) => PAD.left + (i / (pts - 1)) * innerW
        const yAt = (v: number) => PAD.top + innerH - (v / maxReq) * innerH

        // Grid lines
        ctx.strokeStyle = 'rgba(30,42,56,.8)'
        ctx.lineWidth = 1
        for (let i = 0; i <= 4; i++) {
            const y = PAD.top + (i / 4) * innerH
            ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(PAD.left + innerW, y); ctx.stroke()
            const val = Math.round(maxReq * (1 - i / 4))
            ctx.fillStyle = '#4a6080'
            ctx.font = '10px Inter,sans-serif'
            ctx.textAlign = 'right'
            ctx.fillText(val >= 1000 ? (val / 1000).toFixed(1) + 'k' : String(val), PAD.left - 6, y + 3.5)
        }

        // Hour labels
        ctx.textAlign = 'center'
        HOURS.forEach((h, i) => {
            const x = PAD.left + (i / (HOURS.length - 1)) * innerW
            ctx.fillStyle = '#4a6080'
            ctx.font = '10px Inter,sans-serif'
            ctx.fillText(h, x, PAD.top + innerH + 18)
        })

        // Requests fill
        const grad = ctx.createLinearGradient(0, PAD.top, 0, PAD.top + innerH)
        grad.addColorStop(0, 'rgba(26,108,255,.25)')
        grad.addColorStop(1, 'rgba(26,108,255,.02)')
        ctx.beginPath()
        DATA.req.forEach((v, i) => { i === 0 ? ctx.moveTo(xAt(i), yAt(v)) : ctx.lineTo(xAt(i), yAt(v)) })
        ctx.lineTo(xAt(pts - 1), PAD.top + innerH)
        ctx.lineTo(PAD.left, PAD.top + innerH)
        ctx.closePath()
        ctx.fillStyle = grad
        ctx.fill()

        // Requests line
        ctx.beginPath()
        ctx.strokeStyle = '#1a6cff'
        ctx.lineWidth = 2
        ctx.lineJoin = 'round'
        DATA.req.forEach((v, i) => { i === 0 ? ctx.moveTo(xAt(i), yAt(v)) : ctx.lineTo(xAt(i), yAt(v)) })
        ctx.stroke()

        // Blocked dashed line
        ctx.beginPath()
        ctx.strokeStyle = '#ef4444'
        ctx.lineWidth = 1.5
        ctx.setLineDash([4, 4])
        DATA.blk.forEach((v, i) => { i === 0 ? ctx.moveTo(xAt(i), yAt(v)) : ctx.lineTo(xAt(i), yAt(v)) })
        ctx.stroke()
        ctx.setLineDash([])
    }

    useEffect(() => {
        const canvas = canvasRef.current
        const wrap = wrapRef.current
        if (!canvas || !wrap) return
        const resize = () => {
            canvas.width = wrap.clientWidth
            canvas.height = wrap.clientHeight
            draw()
        }
        resize()
        const ro = new ResizeObserver(resize)
        ro.observe(wrap)
        return () => ro.disconnect()
    }, [])

    // Mouse hover for tooltip
    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current
        if (!canvas) return
        const rect = canvas.getBoundingClientRect()
        const mx = e.clientX - rect.left
        const PAD_L = 42, PAD_R = 16, PAD_T = 20, PAD_B = 30
        const innerW = canvas.width - PAD_L - PAD_R
        if (mx < PAD_L || mx > PAD_L + innerW) { setTooltip(null); return }

        const frac = (mx - PAD_L) / innerW
        const idx = Math.round(frac * (DATA.req.length - 1))
        const hour = `${String(idx).padStart(2, '0')}:00`
        const x = mx + rect.left - (wrapRef.current?.getBoundingClientRect().left ?? 0)
        const y = (PAD_T + (1 - DATA.req[idx] / (Math.max(...DATA.req) * 1.1)) * (canvas.height - PAD_T - PAD_B)) - 40
        setTooltip({ x, y: Math.max(4, y), req: DATA.req[idx], blk: DATA.blk[idx], hour })
    }

    return (
        <>
            <style>{`
        .chart-card { background: var(--bg2); border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
        .chart-header { padding: 13px 16px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
        .chart-legend { display: flex; align-items: center; gap: 14px; font-size: 11px; color: var(--text2); }
        .chart-legend-dot { width: 8px; height: 3px; border-radius: 2px; display: inline-block; margin-right: 4px; }
        .chart-wrap { position: relative; height: 180px; padding: 0; }
        .chart-tooltip {
          position: absolute; background: var(--bg2); border: 1px solid var(--border2);
          border-radius: 8px; padding: 8px 12px; pointer-events: none;
          font-size: 11.5px; white-space: nowrap; z-index: 10;
          box-shadow: 0 4px 20px rgba(0,0,0,.5);
          transform: translateX(-50%);
          animation: fadein .1s ease;
        }
      `}</style>

            <div className="chart-card">
                <div className="chart-header">
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: '#cbd5e1' }}>Traffic Overview · Last 24h</span>
                    <div className="chart-legend">
                        <span><span className="chart-legend-dot" style={{ background: '#1a6cff' }} />Requests</span>
                        <span><span className="chart-legend-dot" style={{ background: '#ef4444', borderTop: '1px dashed #ef4444', height: 0, verticalAlign: 'middle' }} />Blocked</span>
                    </div>
                </div>
                <div className="chart-wrap" ref={wrapRef}>
                    <canvas
                        ref={canvasRef}
                        style={{ display: 'block', width: '100%', height: '100%', cursor: 'crosshair' }}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={() => setTooltip(null)}
                    />
                    {tooltip && (
                        <div className="chart-tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
                            <div style={{ color: 'var(--text3)', marginBottom: 4, fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '.5px' }}>{tooltip.hour}</div>
                            <div style={{ color: '#60a5fa' }}>Requests: <strong style={{ color: '#f1f5f9' }}>{tooltip.req.toLocaleString()}</strong></div>
                            <div style={{ color: '#fca5a5' }}>Blocked: <strong style={{ color: '#f1f5f9' }}>{tooltip.blk.toLocaleString()}</strong></div>
                            <div style={{ color: 'var(--text3)', fontSize: 10.5, marginTop: 3 }}>
                                Block rate: <strong style={{ color: '#fbbf24' }}>{Math.round(tooltip.blk / tooltip.req * 100)}%</strong>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}