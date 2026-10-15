<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { AlertTriangle, Clock3, Wrench } from 'lucide-vue-next'
import ErrorLog from '@/components/dashboard/ErrorLog.vue'
import StatTile from '@/components/dashboard/StatTile.vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useLiveSimulation } from '@/composables/useLiveSimulation'
import { ERROR_CATEGORIES, ERROR_CATEGORY_ORDER, REASON_BY_CODE, type ErrorCategory } from '@/data/analysis'
import { FINANCE, formatPesoCompact } from '@/data/finance'
import { formatDuration, formatShiftTime } from '@/lib/machine-status'

const props = defineProps<{ machineId?: number }>()

const sim = useLiveSimulation()
const PARETO_ROWS = 8

const events = computed(() =>
  props.machineId ? sim.errors.filter((e) => e.machineId === props.machineId) : sim.errors,
)
const totalSeconds = computed(() => events.value.reduce((sum, e) => sum + e.durationSec, 0))
const totalCost = computed(() =>
  events.value.reduce((sum, e) => sum + (e.durationSec / 3600) * FINANCE[e.machineId]!.hourlyValue, 0),
)
const mttr = computed(() => (events.value.length ? totalSeconds.value / events.value.length : 0))
const pct = (seconds: number) => (totalSeconds.value ? (seconds / totalSeconds.value) * 100 : 0)

// Pareto of stop reasons by downtime; the long tail folds into "Other".
const pareto = computed(() => {
  const groups = new Map<string, { count: number; seconds: number; cost: number }>()
  for (const e of events.value) {
    const g = groups.get(e.code) ?? { count: 0, seconds: 0, cost: 0 }
    g.count++
    g.seconds += e.durationSec
    g.cost += (e.durationSec / 3600) * FINANCE[e.machineId]!.hourlyValue
    groups.set(e.code, g)
  }
  const sorted = [...groups.entries()]
    .map(([code, g]) => ({ code, ...g, reason: REASON_BY_CODE[code]!.reason, category: REASON_BY_CODE[code]!.category as ErrorCategory | null }))
    .sort((a, b) => b.seconds - a.seconds)
  const top = sorted.slice(0, PARETO_ROWS)
  const rest = sorted.slice(PARETO_ROWS)
  if (rest.length) {
    top.push({
      code: '',
      reason: `Other (${rest.length} reasons)`,
      category: null,
      count: rest.reduce((s, r) => s + r.count, 0),
      seconds: rest.reduce((s, r) => s + r.seconds, 0),
      cost: rest.reduce((s, r) => s + r.cost, 0),
    })
  }
  let cumulative = 0
  return top.map((row) => {
    cumulative += row.seconds
    return { ...row, cumulative: pct(cumulative) }
  })
})
const paretoMax = computed(() => Math.max(1, ...pareto.value.map((r) => r.seconds)))
const topReason = computed(() => pareto.value.find((r) => r.category))

const byCategory = computed(() =>
  ERROR_CATEGORY_ORDER.map((category) => {
    const list = events.value.filter((e) => REASON_BY_CODE[e.code]?.category === category)
    const seconds = list.reduce((s, e) => s + e.durationSec, 0)
    return { category, ...ERROR_CATEGORIES[category], count: list.length, seconds, percent: pct(seconds) }
  }),
)

const byHour = computed(() => {
  const hours = sim.shiftMinutes / 60
  const buckets = Array.from({ length: hours }, (_, h) => ({ hour: h, label: formatShiftTime(h * 60), count: 0, seconds: 0 }))
  for (const e of events.value) {
    const b = buckets[Math.min(hours - 1, Math.floor(e.minute / 60))]!
    b.count++
    b.seconds += e.durationSec
  }
  return buckets
})
const hourMax = computed(() => Math.max(1, ...byHour.value.map((b) => b.count)))
const currentHour = computed(() => Math.min(sim.shiftMinutes / 60 - 1, Math.floor(sim.nowMinute.value / 60)))

// Breakdown by machine (plant view) or by component (single machine view).
const breakdown = computed(() => {
  const rows = props.machineId
    ? sim.subAssets
        .filter((a) => a.machineId === props.machineId)
        .map((a) => ({ key: a.id, label: a.name, to: null as string | null, list: events.value.filter((e) => e.subAssetId === a.id) }))
    : sim.machines.map((m) => ({ key: String(m.id), label: m.name, to: `/machines/${m.id}`, list: events.value.filter((e) => e.machineId === m.id) }))
  return rows
    .map((r) => ({ ...r, count: r.list.length, seconds: r.list.reduce((s, e) => s + e.durationSec, 0) }))
    .sort((a, b) => b.seconds - a.seconds)
})
const breakdownMax = computed(() => Math.max(1, ...breakdown.value.map((r) => r.seconds)))
</script>

<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatTile label="Stops this shift" :value="events.length" :icon="AlertTriangle" hint="Errors that halted production" />
      <StatTile
        label="Error downtime"
        :value="totalSeconds"
        :icon="Clock3"
        :format="formatDuration"
        :hint="`About ${formatPesoCompact(totalCost)} of lost value`"
      />
      <StatTile label="Mean time to repair" :value="mttr" :icon="Wrench" :format="formatDuration" hint="Average stop duration" />
      <Card>
        <CardHeader class="pb-2">
          <CardTitle class="text-sm font-medium">Top stop reason</CardTitle>
        </CardHeader>
        <CardContent v-if="topReason">
          <div class="truncate text-xl font-bold">{{ topReason.reason }}</div>
          <p class="mt-1 text-xs text-muted-foreground">
            {{ topReason.code }} · {{ topReason.count }} stops · {{ pct(topReason.seconds).toFixed(0) }}% of downtime
          </p>
        </CardContent>
      </Card>
    </div>

    <div class="grid gap-4 lg:grid-cols-3">
      <Card class="lg:col-span-2">
        <CardHeader>
          <CardTitle class="text-base">Stop reasons (Pareto)</CardTitle>
          <CardDescription>Downtime by reason, largest first, with the running share of total downtime</CardDescription>
        </CardHeader>
        <CardContent class="space-y-3">
          <div class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span v-for="c in ERROR_CATEGORY_ORDER" :key="c" class="flex items-center gap-1.5">
              <span class="size-2.5 rounded-sm" :class="ERROR_CATEGORIES[c].bg" />{{ ERROR_CATEGORIES[c].label }}
            </span>
          </div>
          <div class="grid grid-cols-[minmax(0,11rem)_1fr_4.5rem_4.5rem_3rem] gap-x-3 text-xs font-medium text-muted-foreground">
            <span>Reason</span><span /><span class="text-right">Downtime</span><span class="text-right">Cost</span><span class="text-right">Cum.</span>
          </div>
          <div class="space-y-1">
            <Tooltip v-for="row in pareto" :key="row.code || 'other'">
              <TooltipTrigger as-child>
                <div class="grid grid-cols-[minmax(0,11rem)_1fr_4.5rem_4.5rem_3rem] items-center gap-x-3 rounded-md py-1 text-sm hover:bg-muted/60">
                  <span class="truncate">
                    <span v-if="row.code" class="mr-1 font-mono text-xs text-muted-foreground">{{ row.code }}</span>{{ row.reason }}
                  </span>
                  <div class="h-4">
                    <div
                      class="h-full min-w-0.5 rounded-r-[4px] transition-[width] duration-500"
                      :class="row.category ? ERROR_CATEGORIES[row.category].bg : 'bg-muted-foreground/50'"
                      :style="{ width: `${(row.seconds / paretoMax) * 100}%` }"
                    />
                  </div>
                  <span class="text-right tabular-nums">{{ formatDuration(row.seconds) }}</span>
                  <span class="text-right tabular-nums">{{ formatPesoCompact(row.cost) }}</span>
                  <span class="text-right tabular-nums text-muted-foreground">{{ row.cumulative.toFixed(0) }}%</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {{ row.reason }} · {{ row.count }} stops · {{ formatDuration(row.seconds) }}
                <template v-if="row.category"> · {{ ERROR_CATEGORIES[row.category].label }}</template>
              </TooltipContent>
            </Tooltip>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle class="text-base">By category</CardTitle>
          <CardDescription>Share of error downtime</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="flex h-6 gap-0.5 overflow-hidden rounded-md">
            <Tooltip v-for="c in byCategory.filter((c) => c.seconds > 0)" :key="c.category">
              <TooltipTrigger as-child>
                <div class="h-full transition-[width] duration-500 first:rounded-l-[4px] last:rounded-r-[4px]" :class="c.bg" :style="{ width: `${c.percent}%` }" />
              </TooltipTrigger>
              <TooltipContent>{{ c.label }} · {{ c.percent.toFixed(1) }}% · {{ formatDuration(c.seconds) }}</TooltipContent>
            </Tooltip>
          </div>
          <div class="divide-y">
            <div v-for="c in byCategory" :key="c.category" class="flex items-center gap-2 py-2 text-sm">
              <span class="size-3 shrink-0 rounded-sm" :class="c.bg" />
              <span class="font-medium">{{ c.label }}</span>
              <span class="ml-auto tabular-nums">{{ formatDuration(c.seconds) }}</span>
              <span class="w-12 text-right tabular-nums text-muted-foreground">{{ c.percent.toFixed(0) }}%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <div class="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle class="text-base">Errors by hour</CardTitle>
          <CardDescription>Number of stops in each hour of the shift</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="flex h-48 items-end gap-2 border-b">
            <Tooltip v-for="b in byHour" :key="b.hour">
              <TooltipTrigger as-child>
                <div class="group flex h-full flex-1 flex-col items-center justify-end">
                  <span v-if="b.count === hourMax || b.hour === currentHour" class="mb-1 text-xs tabular-nums text-muted-foreground">
                    {{ b.count }}
                  </span>
                  <div
                    class="w-full max-w-10 rounded-t-[4px] bg-cat-1 transition-[height] duration-500 group-hover:opacity-80"
                    :style="{ height: `${(b.count / hourMax) * 85}%` }"
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>{{ b.label }} · {{ b.count }} stops · {{ formatDuration(b.seconds) }}</TooltipContent>
            </Tooltip>
          </div>
          <div class="mt-2 flex gap-2 text-[11px] tabular-nums text-muted-foreground">
            <span
              v-for="b in byHour"
              :key="b.hour"
              class="flex-1 text-center"
              :class="b.hour === currentHour && 'font-semibold text-foreground'"
            >{{ b.label }}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle class="text-base">{{ machineId ? 'Error downtime by component' : 'Error downtime by machine' }}</CardTitle>
          <CardDescription>{{ machineId ? 'Which sub-assets cause the most lost time' : 'Select a machine to drill down' }}</CardDescription>
        </CardHeader>
        <CardContent class="space-y-1">
          <Tooltip v-for="row in breakdown" :key="row.key">
            <TooltipTrigger as-child>
              <component
                :is="row.to ? RouterLink : 'div'"
                :to="row.to ?? undefined"
                class="grid grid-cols-[minmax(0,9rem)_1fr_4.5rem] items-center gap-x-3 rounded-md py-1.5 text-sm hover:bg-muted/60"
              >
                <span class="truncate" :class="row.to && 'underline-offset-4 hover:underline'">{{ row.label }}</span>
                <div class="h-4">
                  <div
                    class="h-full min-w-0.5 rounded-r-[4px] bg-cat-1 transition-[width] duration-500"
                    :style="{ width: `${(row.seconds / breakdownMax) * 100}%` }"
                  />
                </div>
                <span class="text-right tabular-nums">{{ formatDuration(row.seconds) }}</span>
              </component>
            </TooltipTrigger>
            <TooltipContent>{{ row.label }} · {{ row.count }} stops · {{ formatDuration(row.seconds) }}</TooltipContent>
          </Tooltip>
        </CardContent>
      </Card>
    </div>

    <Card>
      <CardHeader>
        <CardTitle class="text-base">Live error log</CardTitle>
        <CardDescription>Most recent stops, newest first</CardDescription>
      </CardHeader>
      <CardContent>
        <ErrorLog :machine-id="machineId" :limit="10" />
      </CardContent>
    </Card>
  </div>
</template>
