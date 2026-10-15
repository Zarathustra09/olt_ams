<script setup lang="ts">
import { computed, ref } from 'vue'
import { useDateFormat, useNow } from '@vueuse/core'
import { Clock, Construction, Pencil, RefreshCw, Timer, TrendingDown, TrendingUp } from 'lucide-vue-next'
import AppLayout from '@/layouts/AppLayout.vue'
import OeeGauge from '@/components/dashboard/OeeGauge.vue'
import LiveIndicator from '@/components/dashboard/LiveIndicator.vue'
import TimelineBar from '@/components/dashboard/TimelineBar.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useAnimatedNumber } from '@/composables/useAnimatedNumber'
import { useLiveSimulation } from '@/composables/useLiveSimulation'
import { SHIFT_STATES, SHIFT_STATE_ORDER, formatDuration, formatShiftTime } from '@/lib/machine-status'

const sim = useLiveSimulation()

const selectedTab = ref('overview')
const tabs = [
  { value: 'overview', label: 'OEE overview' },
  { value: 'errors', label: 'Error analysis' },
  { value: 'assets', label: 'Analysis of sub-assets' },
]

const now = useNow({ interval: 1000 })
const clock = useDateFormat(now, 'ddd, MMM D · hh:mm:ss A')

const gauges = computed(() => [
  { label: 'OEE', value: sim.plant.value.oee, previous: sim.previous.oee, history: sim.plantHistory.oee },
  { label: 'Availability', value: sim.plant.value.availability, previous: sim.previous.availability, history: sim.plantHistory.availability },
  { label: 'Performance', value: sim.plant.value.performance, previous: sim.previous.performance, history: sim.plantHistory.performance },
  { label: 'Quality', value: sim.plant.value.quality, previous: sim.previous.quality, history: sim.plantHistory.quality },
])

// Lower is better for MTTR; higher is better for TEEP and MTBF.
const kpiCards = computed(() => [
  {
    label: 'TEEP',
    current: `${sim.kpis.value.teep.toFixed(1)}%`,
    previous: `${sim.previousKpis.teep.toFixed(1)}%`,
    good: sim.kpis.value.teep >= sim.previousKpis.teep,
    up: sim.kpis.value.teep >= sim.previousKpis.teep,
  },
  {
    label: 'MTTR',
    current: formatDuration(sim.kpis.value.mttr),
    previous: formatDuration(sim.previousKpis.mttr),
    good: sim.kpis.value.mttr <= sim.previousKpis.mttr,
    up: sim.kpis.value.mttr >= sim.previousKpis.mttr,
  },
  {
    label: 'MTBF',
    current: formatDuration(sim.kpis.value.mtbf),
    previous: formatDuration(sim.previousKpis.mtbf),
    good: sim.kpis.value.mtbf >= sim.previousKpis.mtbf,
    up: sim.kpis.value.mtbf >= sim.previousKpis.mtbf,
  },
])

const microstop = computed(() => sim.distribution.value.microstop)
const microstopEvents = useAnimatedNumber(() => microstop.value.count, 700)

const hourTicks = computed(() => Array.from({ length: sim.shiftMinutes / 60 + 1 }, (_, i) => formatShiftTime(i * 60)))

const elapsed = computed(() => Math.max(sim.nowMinute.value, 1))
const distributionRows = computed(() =>
  SHIFT_STATE_ORDER.map((state) => {
    const d = sim.distribution.value[state]
    return {
      state,
      ...SHIFT_STATES[state],
      minutes: d.minutes,
      count: d.count,
      percent: (d.minutes / elapsed.value) * 100,
    }
  }),
)

const rowSegments = (state: string) => sim.timeline.value.filter((s) => s.state === state)
</script>

<template>
  <AppLayout>
    <div class="space-y-6">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-foreground">MachTrax System</h1>
          <p class="text-muted-foreground">Day shift · 06:00 – 14:00 · {{ sim.machines.length }} machines monitored</p>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <LiveIndicator />
          <Badge variant="outline" class="gap-1.5 tabular-nums">
            <Clock />
            {{ clock }}
          </Badge>
        </div>
      </div>

      <Tabs v-model="selectedTab" class="space-y-4">
        <TabsList>
          <TabsTrigger v-for="tab in tabs" :key="tab.value" :value="tab.value">{{ tab.label }}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" class="space-y-6">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <OeeGauge v-for="g in gauges" :key="g.label" v-bind="g" />
          </div>

          <Card>
            <CardHeader class="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle class="text-base">Other KPIs</CardTitle>
                <CardDescription>Current value compared with the previous period</CardDescription>
              </div>
              <Tooltip>
                <TooltipTrigger as-child>
                  <Button variant="outline" size="icon" class="size-8" aria-label="Change machine">
                    <Pencil class="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Change machine</TooltipContent>
              </Tooltip>
            </CardHeader>
            <CardContent>
              <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div v-for="kpi in kpiCards" :key="kpi.label" class="rounded-lg border p-4">
                  <div class="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{{ kpi.label }}</span>
                    <component
                      :is="kpi.up ? TrendingUp : TrendingDown"
                      class="size-4"
                      :class="kpi.good ? 'text-success' : 'text-danger'"
                    />
                  </div>
                  <div class="mt-1 text-2xl font-bold tabular-nums">{{ kpi.current }}</div>
                  <div class="mt-1 text-xs text-muted-foreground">Previous: {{ kpi.previous }}</div>
                </div>
                <div class="rounded-lg border bg-muted/40 p-4">
                  <div class="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Microstop duration</span>
                    <Timer class="size-4" />
                  </div>
                  <div class="mt-1 text-2xl font-bold tabular-nums">{{ formatDuration(microstop.minutes * 60) }}</div>
                  <div class="mt-1 text-xs text-muted-foreground">
                    <span class="font-semibold tabular-nums text-foreground">{{ Math.round(microstopEvents) }}</span>
                    microstop events
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader class="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle class="text-base">Machine status</CardTitle>
                <CardDescription>Shift timeline, updating live</CardDescription>
              </div>
              <Badge variant="outline" class="tabular-nums">Now {{ formatShiftTime(sim.nowMinute.value) }}</Badge>
            </CardHeader>
            <CardContent class="space-y-2">
              <div class="grid grid-cols-[7.5rem_1fr] items-center gap-3">
                <span class="text-sm font-medium">Overview</span>
                <TimelineBar :segments="sim.timeline.value" :total="sim.shiftMinutes" :now="sim.nowMinute.value" />
              </div>
              <div v-for="state in SHIFT_STATE_ORDER" :key="state" class="grid grid-cols-[7.5rem_1fr] items-center gap-3">
                <span class="flex items-center gap-2 text-sm text-muted-foreground">
                  <span class="size-2.5 rounded-full" :class="SHIFT_STATES[state].bg" />
                  {{ SHIFT_STATES[state].label }}
                </span>
                <TimelineBar :segments="rowSegments(state)" :total="sim.shiftMinutes" :now="sim.nowMinute.value" />
              </div>
              <div class="grid grid-cols-[7.5rem_1fr] gap-3">
                <span />
                <div class="flex justify-between text-[11px] tabular-nums text-muted-foreground">
                  <span v-for="tick in hourTicks" :key="tick">{{ tick }}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader class="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle class="text-base">Distribution</CardTitle>
                <CardDescription>Share of the shift spent in each state so far</CardDescription>
              </div>
              <Tooltip>
                <TooltipTrigger as-child>
                  <Button variant="outline" size="icon" class="size-8" aria-label="Refresh">
                    <RefreshCw class="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Refresh</TooltipContent>
              </Tooltip>
            </CardHeader>
            <CardContent class="space-y-4">
              <div class="flex h-6 overflow-hidden rounded-md bg-muted">
                <div
                  v-for="row in distributionRows"
                  :key="row.state"
                  class="h-full transition-[width] duration-500"
                  :class="row.bg"
                  :style="{ width: `${row.percent}%` }"
                />
              </div>
              <div class="divide-y">
                <div v-for="row in distributionRows" :key="row.state" class="flex items-center gap-3 py-2 text-sm">
                  <span class="size-3 shrink-0 rounded-full" :class="row.bg" />
                  <span class="min-w-28 font-medium">{{ row.label }}</span>
                  <span class="font-semibold tabular-nums">{{ formatDuration(row.minutes * 60) }}</span>
                  <span class="tabular-nums text-muted-foreground">{{ row.percent.toFixed(1) }}%</span>
                  <span class="ml-auto text-xs text-muted-foreground">
                    {{ row.count }} {{ row.count === 1 ? 'occurrence' : 'occurrences' }}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent v-for="tab in tabs.slice(1)" :key="tab.value" :value="tab.value">
          <Card>
            <CardContent class="flex flex-col items-center gap-3 py-16 text-center">
              <div class="flex size-12 items-center justify-center rounded-full bg-muted">
                <Construction class="size-6 text-muted-foreground" />
              </div>
              <div class="text-lg font-semibold">{{ tab.label }}</div>
              <p class="max-w-md text-sm text-muted-foreground">
                This view is part of the next release. It will break stops down by reason and by sub-asset.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  </AppLayout>
</template>
