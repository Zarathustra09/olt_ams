<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { useLiveSimulation } from '@/composables/useLiveSimulation'
import { MACHINE_STATUS } from '@/lib/machine-status'
import type { ChartConfig } from '@/components/ui/chart'
import {
  ChartContainer,
  ChartTooltip,
} from '@/components/ui/chart'
import { ArrowLeft, AlertTriangle, CheckCircle2, Clock, Zap, TrendingUp, TrendingDown } from 'lucide-vue-next'
import { VisXYContainer, VisArea, VisLine, VisGroupedBar, VisAxis, VisDonut } from '@unovis/vue'

const route = useRoute()
const router = useRouter()

const { getMachine } = useLiveSimulation()
// The router guard guarantees the id exists.
const machine = computed(() => getMachine(Number(route.params.id))!)

const TARGET_CYCLE_MIN = 2.3
const realtimeMetrics = computed(() => [
  {
    label: 'Current Cycle Time',
    value: machine.value.performance > 0 ? `${(TARGET_CYCLE_MIN / (machine.value.performance / 100)).toFixed(2)} min` : '—',
    icon: Clock, color: 'text-chart-3', trend: '+5%', trendUp: false,
  },
  { label: 'Target Cycle Time', value: `${TARGET_CYCLE_MIN} min`, icon: Zap, color: 'text-success', trend: '-2%', trendUp: true },
  { label: 'Parts Produced Today', value: String(machine.value.partsToday), icon: CheckCircle2, color: 'text-success', trend: '+12%', trendUp: true },
  { label: 'Active Alerts', value: machine.value.status === 'running' ? '0' : '1', icon: AlertTriangle, color: 'text-warning', trend: '0', trendUp: false },
])

// Performance data for the last 7 days
const performanceData = ref([
  { day: 0, dayLabel: 'Mon', oee: 85, availability: 90, performance: 92, quality: 98 },
  { day: 1, dayLabel: 'Tue', oee: 87, availability: 91, performance: 94, quality: 99 },
  { day: 2, dayLabel: 'Wed', oee: 84, availability: 88, performance: 93, quality: 97 },
  { day: 3, dayLabel: 'Thu', oee: 89, availability: 93, performance: 95, quality: 100 },
  { day: 4, dayLabel: 'Fri', oee: 91, availability: 95, performance: 96, quality: 100 },
  { day: 5, dayLabel: 'Sat', oee: 88, availability: 92, performance: 94, quality: 99 },
  { day: 6, dayLabel: 'Sun', oee: 90, availability: 94, performance: 95, quality: 100 },
])

const performanceChartConfig = {
  oee: {
    label: 'OEE',
    color: 'var(--chart-1)',
  },
  availability: {
    label: 'Availability',
    color: 'var(--chart-2)',
  },
  performance: {
    label: 'Performance',
    color: 'var(--chart-3)',
  },
  quality: {
    label: 'Quality',
    color: 'var(--chart-4)',
  },
} satisfies ChartConfig

// Hourly production data for today
const hourlyProduction = ref([
  { hour: 0, hourLabel: '00:00', parts: 12, target: 15 },
  { hour: 1, hourLabel: '01:00', parts: 14, target: 15 },
  { hour: 2, hourLabel: '02:00', parts: 13, target: 15 },
  { hour: 3, hourLabel: '03:00', parts: 15, target: 15 },
  { hour: 4, hourLabel: '04:00', parts: 16, target: 15 },
  { hour: 5, hourLabel: '05:00', parts: 14, target: 15 },
  { hour: 6, hourLabel: '06:00', parts: 18, target: 15 },
  { hour: 7, hourLabel: '07:00', parts: 17, target: 15 },
  { hour: 8, hourLabel: '08:00', parts: 19, target: 15 },
  { hour: 9, hourLabel: '09:00', parts: 16, target: 15 },
  { hour: 10, hourLabel: '10:00', parts: 15, target: 15 },
  { hour: 11, hourLabel: '11:00', parts: 18, target: 15 },
])

const productionChartConfig = {
  parts: {
    label: 'Actual Parts',
    color: 'var(--chart-1)',
  },
  target: {
    label: 'Target',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig

// Downtime reasons breakdown
const downtimeReasons = ref([
  { reason: 'Setup/Changeover', minutes: 45, fill: 'var(--danger)' },
  { reason: 'Material Shortage', minutes: 30, fill: 'var(--status-planned)' },
  { reason: 'Tool Change', minutes: 25, fill: 'var(--warning)' },
  { reason: 'Quality Check', minutes: 20, fill: 'var(--success)' },
  { reason: 'Other', minutes: 10, fill: 'var(--muted-foreground)' },
])

const downtimeChartConfig = {
  minutes: {
    label: 'Minutes',
  },
  'Setup/Changeover': {
    label: 'Setup/Changeover',
    color: 'var(--chart-1)',
  },
  'Material Shortage': {
    label: 'Material Shortage',
    color: 'var(--chart-2)',
  },
  'Tool Change': {
    label: 'Tool Change',
    color: 'var(--chart-3)',
  },
  'Quality Check': {
    label: 'Quality Check',
    color: 'var(--chart-4)',
  },
  'Other': {
    label: 'Other',
    color: 'var(--chart-5)',
  },
} satisfies ChartConfig

// OEE Trend over time - use Date objects for x-axis
const oeeTrendData = computed(() => machine.value.history.map((h) => ({ time: new Date(h.t), oee: h.oee })))

const trendDomain = computed<[number, number]>(() => {
  const values = oeeTrendData.value.map((d) => d.oee)
  if (!values.length) return [0, 100]
  return [Math.max(0, Math.floor(Math.min(...values)) - 3), Math.min(100, Math.ceil(Math.max(...values)) + 3)]
})

const trendTickFormat = (i: number) =>
  oeeTrendData.value[Math.round(i)]?.time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) ?? ''

const oeeTrendConfig = {
  oee: {
    label: 'OEE %',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig

const recentEvents = ref([
  { time: '2 hours ago', event: 'Production started', type: 'info' },
  { time: '3 hours ago', event: 'Tool change completed', type: 'success' },
  { time: '4 hours ago', event: 'Minor slowdown detected', type: 'warning' },
  { time: '5 hours ago', event: 'Quality check passed', type: 'success' },
  { time: '6 hours ago', event: 'Shift change', type: 'info' },
])

const maintenanceHistory = ref([
  { date: '2024-03-10', type: 'Scheduled Maintenance', technician: 'John Smith', duration: '2 hours', status: 'Completed' },
  { date: '2024-02-25', type: 'Emergency Repair', technician: 'Sarah Davis', duration: '4 hours', status: 'Completed' },
  { date: '2024-02-10', type: 'Scheduled Maintenance', technician: 'John Smith', duration: '1.5 hours', status: 'Completed' },
  { date: '2024-01-28', type: 'Preventive Maintenance', technician: 'Mike Brown', duration: '3 hours', status: 'Completed' },
])

const goBack = () => {
  router.push('/machines')
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'running': return 'border-status-running/40 bg-status-running/15 text-foreground'
    case 'idle': return 'border-status-idle/40 bg-status-idle/15 text-foreground'
    case 'offline': return 'border-status-offline/40 bg-status-offline/15 text-foreground'
    default: return 'bg-muted text-muted-foreground'
  }
}

const getEventTypeColor = (type: string) => {
  switch (type) {
    case 'success': return 'bg-success'
    case 'warning': return 'bg-warning'
    case 'error': return 'bg-danger'
    default: return 'bg-status-planned'
  }
}

const totalDowntime = computed(() => downtimeReasons.value.reduce((acc, curr) => acc + curr.minutes, 0))

type OeeTrendData = (typeof oeeTrendData.value)[number]
type PerformanceData = (typeof performanceData.value)[number]
type HourlyProductionData = (typeof hourlyProduction.value)[number]
</script>

<template>
  <AppLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center gap-4">
        <Button variant="ghost" size="icon" @click="goBack">
          <ArrowLeft class="h-4 w-4" />
        </Button>
        <div class="flex-1">
          <h1 class="text-3xl font-bold text-foreground">{{ machine.name }}</h1>
          <p class="text-muted-foreground">{{ machine.type }}</p>
        </div>
        <Badge :class="getStatusColor(machine.status)">
          {{ MACHINE_STATUS[machine.status].label.toUpperCase() }}
        </Badge>
        <Button variant="outline">Export Report</Button>
        <Button>Schedule Maintenance</Button>
      </div>

      <!-- Real-time Metrics -->
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card v-for="metric in realtimeMetrics" :key="metric.label">
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">{{ metric.label }}</CardTitle>
            <component :is="metric.icon" :class="['h-4 w-4', metric.color]" />
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">{{ metric.value }}</div>
            <div class="flex items-center gap-1 mt-1">
              <component :is="metric.trendUp ? TrendingUp : TrendingDown"
                :class="['h-3 w-3', metric.trendUp ? 'text-success' : 'text-danger']" />
              <span :class="['text-xs', metric.trendUp ? 'text-success' : 'text-danger']">
                {{ metric.trend }}
              </span>
              <span class="text-xs text-muted-foreground">from yesterday</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Detailed Information Tabs -->
      <Tabs default-value="overview" class="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="production">Production</TabsTrigger>
          <TabsTrigger value="downtime">Downtime</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" class="space-y-4">
          <div class="grid gap-4 md:grid-cols-2">
            <!-- Machine Information -->
            <Card>
              <CardHeader>
                <CardTitle>Machine Information</CardTitle>
                <CardDescription>Technical specifications and details</CardDescription>
              </CardHeader>
              <CardContent class="space-y-4">
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span class="text-sm text-muted-foreground">Manufacturer</span>
                    <span class="text-sm font-medium">{{ machine.manufacturer }}</span>
                  </div>
                  <Separator />
                  <div class="flex justify-between">
                    <span class="text-sm text-muted-foreground">Model</span>
                    <span class="text-sm font-medium">{{ machine.model }}</span>
                  </div>
                  <Separator />
                  <div class="flex justify-between">
                    <span class="text-sm text-muted-foreground">Serial Number</span>
                    <span class="text-sm font-medium">{{ machine.serialNumber }}</span>
                  </div>
                  <Separator />
                  <div class="flex justify-between">
                    <span class="text-sm text-muted-foreground">Location</span>
                    <span class="text-sm font-medium">{{ machine.location }}</span>
                  </div>
                  <Separator />
                  <div class="flex justify-between">
                    <span class="text-sm text-muted-foreground">Install Date</span>
                    <span class="text-sm font-medium">{{ machine.installDate }}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <!-- Current Operation -->
            <Card>
              <CardHeader>
                <CardTitle>Current Operation</CardTitle>
                <CardDescription>Active job and operator information</CardDescription>
              </CardHeader>
              <CardContent class="space-y-4">
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span class="text-sm text-muted-foreground">Current Job</span>
                    <span class="text-sm font-medium">{{ machine.currentJob }}</span>
                  </div>
                  <Separator />
                  <div class="flex justify-between">
                    <span class="text-sm text-muted-foreground">Operator</span>
                    <span class="text-sm font-medium">{{ machine.operator }}</span>
                  </div>
                  <Separator />
                  <div class="flex justify-between">
                    <span class="text-sm text-muted-foreground">Shift</span>
                    <span class="text-sm font-medium">{{ machine.shift }}</span>
                  </div>
                  <Separator />
                  <div class="flex justify-between">
                    <span class="text-sm text-muted-foreground">Status</span>
                    <Badge variant="outline" :class="getStatusColor(machine.status)">
                      {{ machine.status }}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <!-- OEE Breakdown -->
          <Card>
            <CardHeader>
              <CardTitle>OEE Breakdown</CardTitle>
              <CardDescription>Overall Equipment Effectiveness metrics</CardDescription>
            </CardHeader>
            <CardContent class="space-y-6">
              <div class="space-y-4">
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-sm font-medium">OEE</span>
                    <span class="text-sm font-bold">{{ machine.oee }}%</span>
                  </div>
                  <Progress :model-value="machine.oee" class="h-3" />
                </div>
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-sm font-medium">Availability</span>
                    <span class="text-sm font-bold">{{ machine.availability }}%</span>
                  </div>
                  <Progress :model-value="machine.availability" class="h-3 [&>div]:bg-chart-2" />
                </div>
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-sm font-medium">Performance</span>
                    <span class="text-sm font-bold">{{ machine.performance }}%</span>
                  </div>
                  <Progress :model-value="machine.performance" class="h-3 [&>div]:bg-chart-3" />
                </div>
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-sm font-medium">Quality</span>
                    <span class="text-sm font-bold">{{ machine.quality }}%</span>
                  </div>
                  <Progress :model-value="machine.quality" class="h-3 [&>div]:bg-chart-4" />
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- OEE Trend Today -->
          <Card>
            <CardHeader>
              <CardTitle>OEE Trend Today</CardTitle>
              <CardDescription>Real-time OEE performance throughout the day</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer :config="oeeTrendConfig" class="h-[300px] w-full">
                <VisXYContainer :data="oeeTrendData" :height="300" :yDomain="trendDomain">
                  <VisAxis type="x" :numTicks="5" :tickFormat="trendTickFormat" label="Time" />
                  <VisAxis type="y" label="OEE %" />
                  <VisArea
                    :x="(_: OeeTrendData, i: number) => i"
                    :y="(d: OeeTrendData) => d.oee"
                    :baseline="() => trendDomain[0]"
                    :color="oeeTrendConfig.oee.color"
                  />
                  <ChartTooltip>
                    <template #default="{ data }">
                      <div v-if="data && data.length > 0" class="rounded-lg border bg-background p-2 shadow-sm">
                        <div class="grid gap-2">
                          <div class="flex flex-col">
                            <span class="text-[0.70rem] uppercase text-muted-foreground">
                              {{ oeeTrendData[data[0].index]?.time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) }}
                            </span>
                          </div>
                          <div class="flex items-center gap-2">
                            <div class="h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: oeeTrendConfig.oee.color }" />
                            <span class="text-sm font-medium">OEE</span>
                            <span class="ml-auto font-mono font-bold">{{ oeeTrendData[data[0].index]?.oee }}%</span>
                          </div>
                        </div>
                      </div>
                    </template>
                  </ChartTooltip>
                </VisXYContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" class="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>7-Day Performance Trends</CardTitle>
              <CardDescription>OEE, Availability, Performance, and Quality metrics over the past week</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer :config="performanceChartConfig" class="min-h-[400px] w-full">
                <VisXYContainer :data="performanceData" :height="400">
                  <VisAxis type="x" :numTicks="7" :tickFormat="(i: number) => performanceData[i]?.dayLabel || ''" label="Day" />
                  <VisAxis type="y" label="Percentage %" />
                  <VisLine
                    :x="(d: PerformanceData) => d.day"
                    :y="[
                      (d: PerformanceData) => d.oee,
                      (d: PerformanceData) => d.availability,
                      (d: PerformanceData) => d.performance,
                      (d: PerformanceData) => d.quality
                    ]"
                    :color="[
                      performanceChartConfig.oee.color,
                      performanceChartConfig.availability.color,
                      performanceChartConfig.performance.color,
                      performanceChartConfig.quality.color
                    ]"
                  />
                  <ChartTooltip>
                    <template #default="{ data }">
                      <div v-if="data && data.length > 0" class="rounded-lg border bg-background p-2 shadow-sm">
                        <div class="grid gap-2">
                          <div class="flex flex-col">
                            <span class="text-[0.70rem] uppercase text-muted-foreground">
                              {{ performanceData[data[0].index]?.dayLabel }}
                            </span>
                          </div>
                          <div class="flex items-center gap-2">
                            <div class="h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: performanceChartConfig.oee.color }" />
                            <span class="text-sm">OEE</span>
                            <span class="ml-auto font-mono font-bold">{{ performanceData[data[0].index]?.oee }}%</span>
                          </div>
                          <div class="flex items-center gap-2">
                            <div class="h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: performanceChartConfig.availability.color }" />
                            <span class="text-sm">Availability</span>
                            <span class="ml-auto font-mono font-bold">{{ performanceData[data[0].index]?.availability }}%</span>
                          </div>
                          <div class="flex items-center gap-2">
                            <div class="h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: performanceChartConfig.performance.color }" />
                            <span class="text-sm">Performance</span>
                            <span class="ml-auto font-mono font-bold">{{ performanceData[data[0].index]?.performance }}%</span>
                          </div>
                          <div class="flex items-center gap-2">
                            <div class="h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: performanceChartConfig.quality.color }" />
                            <span class="text-sm">Quality</span>
                            <span class="ml-auto font-mono font-bold">{{ performanceData[data[0].index]?.quality }}%</span>
                          </div>
                        </div>
                      </div>
                    </template>
                  </ChartTooltip>
                </VisXYContainer>
              </ChartContainer>

              <!-- Legend -->
              <div class="mt-6 flex flex-wrap justify-center gap-6">
                <div class="flex items-center gap-2">
                  <div class="h-3 w-3 rounded-full" :style="{ backgroundColor: performanceChartConfig.oee.color }" />
                  <span class="text-sm text-muted-foreground">OEE</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="h-3 w-3 rounded-full" :style="{ backgroundColor: performanceChartConfig.availability.color }" />
                  <span class="text-sm text-muted-foreground">Availability</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="h-3 w-3 rounded-full" :style="{ backgroundColor: performanceChartConfig.performance.color }" />
                  <span class="text-sm text-muted-foreground">Performance</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="h-3 w-3 rounded-full" :style="{ backgroundColor: performanceChartConfig.quality.color }" />
                  <span class="text-sm text-muted-foreground">Quality</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Additional Performance Insights -->
          <div class="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader class="pb-2">
                <CardTitle class="text-sm font-medium text-muted-foreground">Average OEE (7 days)</CardTitle>
              </CardHeader>
              <CardContent>
                <div class="text-2xl font-bold">
                  {{ Math.round(performanceData.reduce((sum, d) => sum + d.oee, 0) / performanceData.length) }}%
                </div>
                <p class="text-xs text-muted-foreground mt-1">
                  <span class="text-green-500">+2.3%</span> from last week
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader class="pb-2">
                <CardTitle class="text-sm font-medium text-muted-foreground">Best Performance Day</CardTitle>
              </CardHeader>
              <CardContent>
                <div class="text-2xl font-bold">Friday</div>
                <p class="text-xs text-muted-foreground mt-1">
                  OEE: 91%
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader class="pb-2">
                <CardTitle class="text-sm font-medium text-muted-foreground">Improvement Needed</CardTitle>
              </CardHeader>
              <CardContent>
                <div class="text-2xl font-bold">Wednesday</div>
                <p class="text-xs text-muted-foreground mt-1">
                  OEE: 84% (-3% below target)
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="production" class="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hourly Production</CardTitle>
              <CardDescription>Parts produced vs. target for today</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer :config="productionChartConfig" class="h-[400px] w-full">
                <VisXYContainer :data="hourlyProduction" :height="400">
                  <VisAxis type="x" :numTicks="12" :tickFormat="(i: number) => hourlyProduction[i]?.hourLabel || ''" label="Hour" />
                  <VisAxis type="y" label="Parts" />
                  <VisGroupedBar
                    :x="(d: HourlyProductionData) => d.hour"
                    :y="[(d: HourlyProductionData) => d.target, (d: HourlyProductionData) => d.parts]"
                    :color="[productionChartConfig.target.color, productionChartConfig.parts.color]"
                  />
                  <ChartTooltip>
                    <template #default="{ data }">
                      <div v-if="data && data.length > 0" class="rounded-lg border bg-background p-2 shadow-sm">
                        <div class="grid gap-2">
                          <div class="flex flex-col">
                            <span class="text-[0.70rem] uppercase text-muted-foreground">
                              {{ hourlyProduction[data[0].index]?.hourLabel }}
                            </span>
                          </div>
                          <div class="flex items-center gap-2">
                            <div class="h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: productionChartConfig.target.color }" />
                            <span class="text-sm">Target</span>
                            <span class="ml-auto font-mono font-bold">{{ hourlyProduction[data[0].index]?.target }} parts</span>
                          </div>
                          <div class="flex items-center gap-2">
                            <div class="h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: productionChartConfig.parts.color }" />
                            <span class="text-sm">Actual</span>
                            <span class="ml-auto font-mono font-bold">{{ hourlyProduction[data[0].index]?.parts }} parts</span>
                          </div>
                          <div class="mt-1 pt-1 border-t">
                            <div class="flex items-center justify-between">
                              <span class="text-xs text-muted-foreground">Achievement</span>
                              <span class="text-xs font-bold" :class="(hourlyProduction[data[0].index]?.parts ?? 0) >= (hourlyProduction[data[0].index]?.target ?? 1) ? 'text-success' : 'text-warning'">
                                {{ hourlyProduction[data[0].index] ? Math.round(((hourlyProduction[data[0].index]?.parts ?? 0) / (hourlyProduction[data[0].index]?.target ?? 1)) * 100) : 0 }}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </template>
                  </ChartTooltip>
                </VisXYContainer>
              </ChartContainer>

              <!-- Legend -->
              <div class="mt-6 flex flex-wrap justify-center gap-6">
                <div class="flex items-center gap-2">
                  <div class="h-3 w-3 rounded-full" :style="{ backgroundColor: productionChartConfig.target.color }" />
                  <span class="text-sm text-muted-foreground">Target</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="h-3 w-3 rounded-full" :style="{ backgroundColor: productionChartConfig.parts.color }" />
                  <span class="text-sm text-muted-foreground">Actual Parts</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="downtime" class="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Downtime Analysis</CardTitle>
              <CardDescription>Breakdown of downtime causes for this week ({{ totalDowntime }} minutes total)</CardDescription>
            </CardHeader>
            <CardContent>
              <div class="grid gap-6 md:grid-cols-2">
                <!-- Donut Chart -->
                <div class="h-[300px] w-full flex items-center justify-center">
                  <ChartContainer :config="downtimeChartConfig" class="h-full w-full">
                    <VisXYContainer :data="downtimeReasons" :height="300">
                      <VisDonut
                        :value="(d: any) => d.minutes"
                        :color="(d: any) => d.fill"
                      />
                      <ChartTooltip>
                        <template #default="{ data }">
                          <div v-if="data && data.length > 0 && downtimeReasons[data[0].index]" class="rounded-lg border bg-background p-2 shadow-sm">
                            <div class="grid gap-2">
                              <div class="flex items-center gap-2">
                                <div class="h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: downtimeReasons[data[0].index]?.fill }" />
                                <span class="text-sm font-medium">{{ downtimeReasons[data[0].index]?.reason }}</span>
                              </div>
                              <div class="flex items-center justify-between">
                                <span class="text-xs text-muted-foreground">Duration</span>
                                <span class="font-mono font-bold">{{ downtimeReasons[data[0].index]?.minutes }} min</span>
                              </div>
                              <div class="flex items-center justify-between">
                                <span class="text-xs text-muted-foreground">Percentage</span>
                                <span class="font-mono font-bold">{{ Math.round(((downtimeReasons[data[0].index]?.minutes ?? 0) / totalDowntime) * 100) }}%</span>
                              </div>
                            </div>
                          </div>
                        </template>
                      </ChartTooltip>
                    </VisXYContainer>
                  </ChartContainer>
                </div>

                <!-- Legend with Progress Bars -->
                <div class="flex flex-col justify-center space-y-4">
                  <div v-for="(item, index) in downtimeReasons" :key="index" class="space-y-2">
                    <div class="flex justify-between text-sm">
                      <div class="flex items-center gap-2">
                        <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: item.fill }"></div>
                        <span>{{ item.reason }}</span>
                      </div>
                      <span class="font-medium">{{ item.minutes }} min ({{ Math.round((item.minutes / totalDowntime) * 100) }}%)</span>
                    </div>
                    <Progress
                      :model-value="(item.minutes / totalDowntime) * 100"
                      class="h-2"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" class="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance History</CardTitle>
              <CardDescription>Past maintenance activities and schedules</CardDescription>
            </CardHeader>
            <CardContent>
              <div class="space-y-4">
                <div v-for="(record, index) in maintenanceHistory" :key="index"
                  class="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent transition-colors">
                  <div class="flex-1 space-y-1">
                    <div class="flex items-center gap-2">
                      <span class="font-medium">{{ record.type }}</span>
                      <Badge variant="outline">{{ record.status }}</Badge>
                    </div>
                    <div class="text-sm text-muted-foreground">
                      {{ record.date }} • {{ record.duration }} • {{ record.technician }}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" class="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Events</CardTitle>
              <CardDescription>Activity log and notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div class="space-y-4">
                <div v-for="(event, index) in recentEvents" :key="index" class="flex items-start gap-4">
                  <div :class="['w-2 h-2 mt-2 rounded-full', getEventTypeColor(event.type)]"></div>
                  <div class="flex-1">
                    <p class="text-sm font-medium">{{ event.event }}</p>
                    <p class="text-xs text-muted-foreground">{{ event.time }}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  </AppLayout>
</template>

<style scoped>
/* Remove recharts-specific styles */
</style>
