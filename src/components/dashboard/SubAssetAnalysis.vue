<script setup lang="ts">
import { computed, ref } from 'vue'
import { CalendarClock, HeartPulse, ShieldAlert, Thermometer, TriangleAlert } from 'lucide-vue-next'
import Sparkline from '@/components/dashboard/Sparkline.vue'
import StatTile from '@/components/dashboard/StatTile.vue'
import StatusBadge from '@/components/dashboard/StatusBadge.vue'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useLiveSimulation } from '@/composables/useLiveSimulation'
import { HEALTH_LEVELS, MACHINE_STATUS, TONE_CLASSES, formatDuration, getHealthLevel } from '@/lib/machine-status'

const props = defineProps<{ machineId?: number }>()

const sim = useLiveSimulation()
const selected = ref(String(props.machineId ?? sim.machines[0]!.id))
const activeId = computed(() => props.machineId ?? Number(selected.value))
const machine = computed(() => sim.getMachine(activeId.value)!)

const assets = computed(() =>
  sim.subAssets
    .filter((a) => a.machineId === activeId.value)
    .map((a) => {
      const list = sim.errors.filter((e) => e.subAssetId === a.id)
      const level = getHealthLevel(a.health)
      return {
        asset: a,
        level,
        tone: TONE_CLASSES[HEALTH_LEVELS[level].tone],
        errorCount: list.length,
        errorSeconds: list.reduce((s, e) => s + e.durationSec, 0),
      }
    }),
)

const avgHealth = computed(() => assets.value.reduce((s, r) => s + r.asset.health, 0) / Math.max(1, assets.value.length))
const needsAttention = computed(() => assets.value.filter((r) => r.level !== 'healthy').length)
const hottest = computed(() => [...assets.value].sort((a, b) => b.asset.temperature - a.asset.temperature)[0])
const totalErrors = computed(() => assets.value.reduce((s, r) => s + r.errorCount, 0))

const ranking = computed(() => [...assets.value].sort((a, b) => b.errorSeconds - a.errorSeconds))
const rankingMax = computed(() => Math.max(1, ...ranking.value.map((r) => r.errorSeconds)))
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <Select v-if="!machineId" v-model="selected">
          <SelectTrigger class="w-56" aria-label="Machine">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="m in sim.machines" :key="m.id" :value="String(m.id)">{{ m.name }}</SelectItem>
          </SelectContent>
        </Select>
        <Badge variant="outline" class="gap-1.5">
          <span class="size-2 rounded-full" :class="MACHINE_STATUS[machine.status].dot" />
          {{ MACHINE_STATUS[machine.status].label }}
        </Badge>
      </div>
      <span class="text-sm text-muted-foreground">{{ assets.length }} monitored components · {{ machine.type }}</span>
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatTile label="Average health" :value="avgHealth" :icon="HeartPulse" :decimals="1" suffix="%" hint="Across all components" />
      <StatTile label="Needs attention" :value="needsAttention" :icon="ShieldAlert" hint="Components on watch or critical" />
      <StatTile
        label="Hottest component"
        :value="hottest?.asset.temperature ?? 0"
        :icon="Thermometer"
        :decimals="1"
        suffix=" °C"
        :hint="hottest?.asset.name"
      />
      <StatTile label="Component errors" :value="totalErrors" :icon="TriangleAlert" hint="Stops traced to a component this shift" />
    </div>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      <Card v-for="row in assets" :key="row.asset.id">
        <CardHeader class="flex flex-row items-start justify-between gap-2 space-y-0 pb-3">
          <div class="min-w-0">
            <CardTitle class="truncate text-base">{{ row.asset.name }}</CardTitle>
            <CardDescription>{{ row.asset.runtimeHours.toLocaleString() }} runtime hours</CardDescription>
          </div>
          <StatusBadge :health="row.level" />
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="space-y-1.5">
            <div class="flex items-baseline justify-between text-sm">
              <span class="text-muted-foreground">Health</span>
              <span class="text-lg font-bold tabular-nums">{{ row.asset.health.toFixed(1) }}%</span>
            </div>
            <div class="h-2 rounded-full bg-muted">
              <div
                class="h-2 rounded-full transition-[width] duration-700 ease-out"
                :class="row.tone.bg"
                :style="{ width: `${row.asset.health}%` }"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="rounded-lg border p-2.5">
              <div class="text-xs text-muted-foreground">Temperature</div>
              <div class="font-semibold tabular-nums">{{ row.asset.temperature.toFixed(1) }} °C</div>
              <div class="mt-1 text-cat-2"><Sparkline :values="row.asset.tempHistory" /></div>
            </div>
            <div class="rounded-lg border p-2.5">
              <div class="text-xs text-muted-foreground">Vibration</div>
              <div class="font-semibold tabular-nums">{{ row.asset.vibration.toFixed(2) }} mm/s</div>
              <div class="mt-1 text-cat-1"><Sparkline :values="row.asset.vibHistory" /></div>
            </div>
          </div>

          <div class="flex items-center justify-between text-xs text-muted-foreground">
            <span class="flex items-center gap-1.5" :class="row.asset.nextServiceDays <= 7 && 'font-medium text-foreground'">
              <CalendarClock class="size-3.5" :class="row.asset.nextServiceDays <= 7 && TONE_CLASSES.warning.text" />
              Service in {{ row.asset.nextServiceDays }} days
            </span>
            <span class="tabular-nums">{{ row.errorCount }} errors · {{ formatDuration(row.errorSeconds) }}</span>
          </div>
        </CardContent>
      </Card>
    </div>

    <div class="grid gap-4 lg:grid-cols-5">
      <Card class="lg:col-span-2">
        <CardHeader>
          <CardTitle class="text-base">Error downtime by component</CardTitle>
          <CardDescription>Where the lost time on this machine comes from</CardDescription>
        </CardHeader>
        <CardContent class="space-y-1">
          <Tooltip v-for="row in ranking" :key="row.asset.id">
            <TooltipTrigger as-child>
              <div class="grid grid-cols-[minmax(0,8rem)_1fr_4.5rem] items-center gap-x-3 rounded-md py-1.5 text-sm hover:bg-muted/60">
                <span class="truncate">{{ row.asset.name }}</span>
                <div class="h-4">
                  <div
                    class="h-full min-w-0.5 rounded-r-[4px] bg-cat-1 transition-[width] duration-500"
                    :style="{ width: `${(row.errorSeconds / rankingMax) * 100}%` }"
                  />
                </div>
                <span class="text-right tabular-nums">{{ formatDuration(row.errorSeconds) }}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>{{ row.asset.name }} · {{ row.errorCount }} stops · {{ formatDuration(row.errorSeconds) }}</TooltipContent>
          </Tooltip>
        </CardContent>
      </Card>

      <Card class="lg:col-span-3">
        <CardHeader>
          <CardTitle class="text-base">Component comparison</CardTitle>
          <CardDescription>Live sensor readings and maintenance status</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Component</TableHead>
                <TableHead class="text-right">Health</TableHead>
                <TableHead class="text-right">Temp</TableHead>
                <TableHead class="text-right">Vibration</TableHead>
                <TableHead class="text-right">Errors</TableHead>
                <TableHead class="text-right">Next service</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="row in assets" :key="row.asset.id">
                <TableCell class="font-medium">{{ row.asset.name }}</TableCell>
                <TableCell class="text-right tabular-nums">
                  <span class="inline-flex items-center gap-1.5">
                    <span class="size-2 rounded-full" :class="row.tone.bg" />{{ row.asset.health.toFixed(1) }}%
                  </span>
                </TableCell>
                <TableCell class="text-right tabular-nums">{{ row.asset.temperature.toFixed(1) }} °C</TableCell>
                <TableCell class="text-right tabular-nums">{{ row.asset.vibration.toFixed(2) }}</TableCell>
                <TableCell class="text-right tabular-nums">{{ row.errorCount }}</TableCell>
                <TableCell class="text-right tabular-nums">{{ row.asset.nextServiceDays }} d</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
