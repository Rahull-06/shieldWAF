'use client'
import { useEffect, useRef } from 'react'

interface ChartProps {
    data?: { label: string; requests: number; blocked: number }[]
}

const DEFAULT_DATA = [
    { label: '00:00', requests: 420, blocked: 38 },
    { label: '02:00', requests: 280, blocked: 22 },
    { label: '04:00', requests: 190, blocked: 15 },
    { label: '06:00', requests: 340, blocked: 41 },
    { label: '08:00', requests: 780, blocked: 120 },
    { label: '10:00', requests: 1240, blocked: 230 },
    { label: '12:00', requests: 1580, blocked: 310 },
    { label: '14:00', requests: 1820, blocked: 480 },
    { label: '16:00', requests: 1650, blocked: 390 },
    { label: '18:00', requests: 1420, blocked: 280 },
    { label: '20:00', requests: 980, blocked: 160 },
    { label: '22:00', requests: 620, blocked: 90 },
]

export default function Chart({ data = DEFAULT_DATA }: ChartProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const dpr = window.devicePixelRatio || 1
        const rect = canvas.getBoundingClientRect()
        canvas.width = rect.width * dpr
        canvas.height = rect.height * dpr
        ctx.scale(dpr, dpr)

        const W = rect.width
        const H = rect.height
        const pad = { top: 10, right: 12, bottom: 28, left: 42 }
        const chartW = W - pad.left - pad.right
        const chartH = H - pad.top - pad.bottom

        const maxVal = Math.max(...data.map(d => d.requests)) * 1.1
        const xStep = chartW / (data.length - 1)

        const toX = (i: number) => pad.left + i * xStep
        const toY = (v: number) => pad.top + chartH - (v / maxVal) * chartH

        // Grid lines
        ctx.strokeStyle = '#1a2535'
        ctx.lineWidth = 1
        for (let i = 0; i <= 4; i++) {
            const y = pad.top + (chartH / 4) * i
            ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + chartW, y); ctx.stroke()
        }

        // Y-axis labels
        ctx.fillStyle = '#3d5570'
        ctx.font = '10px IBM Plex Mono, monospace'
        ctx.textAlign = 'right'
        for (let i = 0; i <= 4; i++) {
            const v = Math.round(maxVal - (maxVal / 4) * i)
            const y = pad.top + (chartH / 4) * i
            ctx.fillText(v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v), pad.left - 6, y + 3)
        }

        // X-axis labels
        ctx.textAlign = 'center'
        data.forEach((d, i) => {
            if (i % 2 === 0) {
                ctx.fillText(d.label, toX(i), H - 6)
            }
        })

        // Requests area
        const reqGrad = ctx.createLinearGradient(0, pad.top, 0, pad.top + chartH)
        reqGrad.addColorStop(0, 'rgba(26,108,255,0.25)')
        reqGrad.addColorStop(1, 'rgba(26,108,255,0.01)')
        ctx.beginPath()
        ctx.moveTo(toX(0), toY(data[0].requests))
        data.forEach((d, i) => {
            if (i === 0) return
            const cx = (toX(i - 1) + toX(i)) / 2
            ctx.bezierCurveTo(cx, toY(data[i - 1].requests), cx, toY(d.requests), toX(i), toY(d.requests))
        })
        ctx.lineTo(toX(data.length - 1), pad.top + chartH)
        ctx.lineTo(toX(0), pad.top + chartH)
        ctx.closePath()
        ctx.fillStyle = reqGrad
        ctx.fill()

        // Requests line
        ctx.beginPath()
        ctx.strokeStyle = '#1a6cff'
        ctx.lineWidth = 2
        ctx.moveTo(toX(0), toY(data[0].requests))
        data.forEach((d, i) => {
            if (i === 0) return
            const cx = (toX(i - 1) + toX(i)) / 2
            ctx.bezierCurveTo(cx, toY(data[i - 1].requests), cx, toY(d.requests), toX(i), toY(d.requests))
        })
        ctx.stroke()

        // Blocked area
        const blkGrad = ctx.createLinearGradient(0, pad.top, 0, pad.top + chartH)
        blkGrad.addColorStop(0, 'rgba(239,68,68,0.2)')
        blkGrad.addColorStop(1, 'rgba(239,68,68,0.01)')
        ctx.beginPath()
        ctx.moveTo(toX(0), toY(data[0].blocked))
        data.forEach((d, i) => {
            if (i === 0) return
            const cx = (toX(i - 1) + toX(i)) / 2
            ctx.bezierCurveTo(cx, toY(data[i - 1].blocked), cx, toY(d.blocked), toX(i), toY(d.blocked))
        })
        ctx.lineTo(toX(data.length - 1), pad.top + chartH)
        ctx.lineTo(toX(0), pad.top + chartH)
        ctx.closePath()
        ctx.fillStyle = blkGrad
        ctx.fill()

        // Blocked line
        ctx.beginPath()
        ctx.strokeStyle = '#ef4444'
        ctx.lineWidth = 1.5
        ctx.setLineDash([4, 3])
        ctx.moveTo(toX(0), toY(data[0].blocked))
        data.forEach((d, i) => {
            if (i === 0) return
            const cx = (toX(i - 1) + toX(i)) / 2
            ctx.bezierCurveTo(cx, toY(data[i - 1].blocked), cx, toY(d.blocked), toX(i), toY(d.blocked))
        })
        ctx.stroke()
        ctx.setLineDash([])
    }, [data])

    return (
        <div className="bg-bg2 border border-border1 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border1 flex items-center justify-between flex-wrap gap-2">
                <span className="text-[12.5px] font-semibold text-slate-300">Traffic Overview · Last 24h</span>
                <div className="flex items-center gap-4 text-[11px]">
                    <span className="flex items-center gap-1.5 text-text2">
                        <span className="w-3 h-[2px] bg-blue inline-block rounded" /> Requests
                    </span>
                    <span className="flex items-center gap-1.5 text-text2">
                        <span className="w-3 h-[2px] bg-red-500 inline-block rounded" /> Blocked
                    </span>
                </div>
            </div>
            <div className="p-4">
                <canvas ref={canvasRef} className="w-full h-44" style={{ display: 'block' }} />
            </div>
        </div>
    )
}