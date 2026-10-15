import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useLiveSimulation } from '@/composables/useLiveSimulation'
import { REASON_BY_CODE } from '@/data/analysis'
import { FINANCE, formatPesoCompact } from '@/data/finance'
import { formatDuration } from '@/lib/machine-status'

export type InsightKind = 'maintenance' | 'root-cause' | 'speed'

export interface Insight {
  id: string
  kind: InsightKind
  title: string
  body: string
  confidence: number
  actionLabel: string
  machineId: number
}

const DAYS_PER_MONTH = 26

/**
 * Rule-based "AI" insights computed from the live simulation.
 * Pass a machine id to scope them to one machine, or nothing for the whole plant.
 */
export function useInsights(machineId?: MaybeRefOrGetter<number | undefined>) {
  const sim = useLiveSimulation()

  return computed<Insight[]>(() => {
    const scope = toValue(machineId)
    const machines = sim.machines.filter((m) => (scope ? m.id === scope : m.status !== 'offline'))
    const ids = new Set(machines.map((m) => m.id))
    const insights: Insight[] = []

    // 1. Predictive maintenance: weakest component in scope.
    const weakest = sim.subAssets.filter((a) => ids.has(a.machineId)).sort((a, b) => a.health - b.health)[0]
    if (weakest) {
      const machine = sim.getMachine(weakest.machineId)!
      const risk = Math.min(95, Math.max(8, Math.round((100 - weakest.health) * 1.25)))
      const days = Math.max(1, Math.round(weakest.health / 11))
      const first = weakest.tempHistory[0] ?? weakest.temperature
      const rise = weakest.temperature - first
      insights.push({
        id: `maint-${weakest.id}`,
        kind: 'maintenance',
        title: `${weakest.name} on ${machine.name} is degrading`,
        body:
          `${risk}% failure risk within ${days} days. Health is ${weakest.health.toFixed(0)}%, running at ` +
          `${weakest.temperature.toFixed(0)} °C${rise > 0.5 ? ` (up ${rise.toFixed(1)} °C recently)` : ''} ` +
          `with ${weakest.vibration.toFixed(1)} mm/s vibration. Service it in the next planned stop.`,
        confidence: Math.min(96, 78 + Math.round((100 - weakest.health) / 4)),
        actionLabel: 'Create work order',
        machineId: machine.id,
      })
    }

    // 2. Root cause: reason that costs the most pesos in scope.
    const byReason = new Map<string, { seconds: number; cost: number; machineId: number }>()
    for (const e of sim.errors) {
      if (!ids.has(e.machineId)) continue
      const g = byReason.get(e.code) ?? { seconds: 0, cost: 0, machineId: e.machineId }
      g.seconds += e.durationSec
      g.cost += (e.durationSec / 3600) * FINANCE[e.machineId]!.hourlyValue
      byReason.set(e.code, g)
    }
    const top = [...byReason.entries()].sort((a, b) => b[1].cost - a[1].cost)[0]
    if (top) {
      const [code, g] = top
      const reason = REASON_BY_CODE[code]?.reason ?? code
      insights.push({
        id: `root-${code}`,
        kind: 'root-cause',
        title: `"${reason}" is your most expensive stop`,
        body:
          `${formatDuration(g.seconds)} lost this shift, about ${formatPesoCompact(g.cost)} so far. ` +
          `Eliminating it would recover roughly ${formatPesoCompact(g.cost * DAYS_PER_MONTH)} per month.`,
        confidence: 88,
        actionLabel: 'Start root-cause analysis',
        machineId: g.machineId,
      })
    }

    // 3. Speed loss: slowest running machine against its ideal cycle.
    const slow = machines
      .filter((m) => m.status === 'running')
      .sort((a, b) => a.performance - b.performance)[0]
    if (slow) {
      const gap = 100 - slow.performance
      const parts = Math.round((slow.partsToday * gap) / Math.max(1, slow.performance))
      insights.push({
        id: `speed-${slow.id}`,
        kind: 'speed',
        title: `${slow.name} is running ${gap.toFixed(0)}% below ideal speed`,
        body:
          `Recovering the speed gap adds about ${parts} parts per shift. Check feed rate and ` +
          `tool-change timing against the ${FINANCE[slow.id]!.idealCycleSec}s ideal cycle.`,
        confidence: 84,
        actionLabel: 'Review cycle settings',
        machineId: slow.id,
      })
    }

    return insights
  })
}
