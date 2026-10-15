<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Activity, AlertTriangle, Gauge, Package } from 'lucide-vue-next'
import AppLayout from '@/layouts/AppLayout.vue'
import LiveIndicator from '@/components/dashboard/LiveIndicator.vue'
import StatTile from '@/components/dashboard/StatTile.vue'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useLiveSimulation } from '@/composables/useLiveSimulation'
import { formatPesoCompact } from '@/data/finance'
import { MACHINE_STATUS, TONE_CLASSES, getOeeTone } from '@/lib/machine-status'

const router = useRouter()
const { machines, plant, costByMachine } = useLiveSimulation()
const costById = computed(() => new Map(costByMachine.value.map((c) => [c.machineId, c.cost])))

const runningCount = computed(() => machines.filter((m) => m.status === 'running').length)
const partsToday = computed(() => machines.reduce((sum, m) => sum + m.partsToday, 0))
const alertCount = computed(() => machines.filter((m) => m.status !== 'running').length)
const faultCount = computed(() => machines.filter((m) => m.status === 'fault').length)

const viewDetails = (id: number) => router.push(`/machines/${id}`)
const viewSettings = (id: number) => router.push(`/machines/${id}/settings`)
</script>

<template>
  <AppLayout>
    <div class="space-y-6">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-foreground">Machines</h1>
          <p class="text-muted-foreground">Monitor and manage your production machines</p>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <LiveIndicator />
          <Button>+ Add Machine</Button>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Machines running" :value="runningCount" :icon="Activity" :hint="`of ${machines.length} machines`" />
        <StatTile label="Average OEE" :value="plant.oee" :icon="Gauge" :decimals="1" suffix="%" hint="Across active machines" />
        <StatTile label="Parts produced today" :value="partsToday" :icon="Package" hint="All machines combined" />
        <StatTile
          label="Needs attention"
          :value="alertCount"
          :icon="AlertTriangle"
          :hint="faultCount ? `${faultCount} in fault right now` : 'Idle or offline machines'"
        />
      </div>

      <div class="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        <Card
          v-for="machine in machines"
          :key="machine.id"
          class="transition-all hover:-translate-y-0.5 hover:shadow-lg"
          :class="machine.status === 'fault' && 'border-danger ring-2 ring-danger/50'"
        >
          <CardHeader class="flex flex-row justify-between gap-4">
            <div>
              <CardTitle class="text-lg">{{ machine.name }}</CardTitle>
              <span class="text-sm text-muted-foreground">{{ machine.type }}</span>
            </div>
            <Badge variant="outline" class="gap-1.5">
              <span class="relative flex size-2">
                <span
                  v-if="machine.status === 'running' || machine.status === 'fault'"
                  class="absolute inline-flex size-full animate-ping rounded-full opacity-75 motion-reduce:animate-none"
                  :class="MACHINE_STATUS[machine.status].dot"
                />
                <span class="relative inline-flex size-2 rounded-full" :class="MACHINE_STATUS[machine.status].dot" />
              </span>
              {{ MACHINE_STATUS[machine.status].label }}
            </Badge>
          </CardHeader>

          <CardContent class="space-y-4">
            <div class="space-y-2">
              <div class="flex items-center justify-between text-sm">
                <span class="text-muted-foreground">OEE</span>
                <span class="font-semibold tabular-nums text-foreground">{{ machine.oee.toFixed(1) }}%</span>
              </div>
              <div class="h-2 w-full rounded-full bg-muted">
                <div
                  class="h-2 rounded-full transition-[width] duration-700 ease-out"
                  :class="TONE_CLASSES[getOeeTone(machine.oee)].bg"
                  :style="{ width: `${machine.oee}%` }"
                />
              </div>
            </div>

            <div class="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2 text-xs">
              <span class="text-muted-foreground">Downtime cost today</span>
              <span class="font-semibold tabular-nums">{{ formatPesoCompact(costById.get(machine.id) ?? 0) }}</span>
            </div>

            <div class="grid grid-cols-3 gap-2 pt-2">
              <div class="text-center">
                <div class="mb-1 text-xs text-muted-foreground">Availability</div>
                <div class="text-sm font-semibold tabular-nums text-foreground">{{ machine.availability.toFixed(1) }}%</div>
              </div>
              <div class="text-center">
                <div class="mb-1 text-xs text-muted-foreground">Performance</div>
                <div class="text-sm font-semibold tabular-nums text-foreground">{{ machine.performance.toFixed(1) }}%</div>
              </div>
              <div class="text-center">
                <div class="mb-1 text-xs text-muted-foreground">Quality</div>
                <div class="text-sm font-semibold tabular-nums text-foreground">{{ machine.quality.toFixed(1) }}%</div>
              </div>
            </div>
          </CardContent>

          <CardFooter class="flex gap-2 border-t pt-4">
            <Button variant="outline" size="sm" class="flex-1" @click="viewDetails(machine.id)">View Details</Button>
            <Button variant="outline" size="sm" class="flex-1" @click="viewSettings(machine.id)">Settings</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  </AppLayout>
</template>
