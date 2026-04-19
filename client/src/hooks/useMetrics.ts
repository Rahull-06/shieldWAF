'use client'
import { useState, useEffect } from 'react'
import { metricsApi } from '@/services/api'

export interface MetricsSummary {
    totalRequests: number
    blockedAttacks: number
    activeThreats: number
    uptime: string
    rpsNow: number
    bandwidthSaved: string
    sitesProtected: number
    rulesActive: number
}

export function useMetrics(refreshMs = 30000) {
    const [summary, setSummary] = useState<MetricsSummary | null>(null)
    const [traffic, setTraffic] = useState<unknown>(null)
    const [loading, setLoading] = useState(true)

    const load = async () => {
        const [sum, traf] = await Promise.all([
            metricsApi.getSummary(),
            metricsApi.getTraffic(),
        ])
        if (sum.success) setSummary(sum.data as MetricsSummary)
        if (traf.success) setTraffic(traf.data)
        setLoading(false)
    }

    useEffect(() => {
        load()
        const t = setInterval(load, refreshMs)
        return () => clearInterval(t)
    }, [refreshMs])

    return { summary, traffic, loading }
}