<script setup lang="ts">
import { computed } from 'vue'
import { Banknote, Package, TrendingUp } from 'lucide-vue-next'
import { Card, CardContent } from '@/components/ui/card'
import { useAnimatedNumber } from '@/composables/useAnimatedNumber'
import { useLiveSimulation } from '@/composables/useLiveSimulation'
import { WORLD_CLASS_OEE, formatPeso, formatPesoCompact } from '@/data/finance'

const props = defineProps<{ machineId?: number }>()

const sim = useLiveSimulation()

const totals = computed(() => {
  const rows = props.machineId
    ? sim.costByMachine.value.filter((c) => c.machineId === props.machineId)
    : sim.costByMachine.value
  return {
    cost: rows.reduce((s, r) => s + r.cost, 0),
    units: rows.reduce((s, r) => s + r.unitsLost, 0),
    opportunity: rows.reduce((s, r) => s + r.opportunity, 0),
    stops: sim.errors.filter((e) => !props.machineId || e.machineId === props.machineId).length,
  }
})

const cost = useAnimatedNumber(() => totals.value.cost, 1200)
const units = useAnimatedNumber(() => totals.value.units, 1000)
const opportunity = useAnimatedNumber(() => totals.value.opportunity, 1400)
</script>

<template>
  <Card class="overflow-hidden border-primary/25 bg-gradient-to-br from-primary/10 via-card to-card">
    <CardContent class="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3 lg:divide-x">
      <div class="space-y-1">
        <div class="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Banknote class="size-4 text-danger" /> Cost of downtime today
        </div>
        <div class="text-3xl font-bold tabular-nums tracking-tight">{{ formatPeso(cost) }}</div>
        <p class="text-xs text-muted-foreground">From {{ totals.stops }} stops this shift</p>
      </div>
      <div class="space-y-1 lg:pl-6">
        <div class="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Package class="size-4 text-warning" /> Parts not produced
        </div>
        <div class="text-3xl font-bold tabular-nums tracking-tight">{{ Math.round(units).toLocaleString() }}</div>
        <p class="text-xs text-muted-foreground">Lost while machines were stopped</p>
      </div>
      <div class="space-y-1 sm:col-span-2 lg:col-span-1 lg:pl-6">
        <div class="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <TrendingUp class="size-4 text-success" /> Monthly opportunity
        </div>
        <div class="text-3xl font-bold tabular-nums tracking-tight">{{ formatPesoCompact(opportunity) }}</div>
        <p class="text-xs text-muted-foreground">Recoverable by reaching {{ WORLD_CLASS_OEE }}% OEE</p>
      </div>
    </CardContent>
  </Card>
</template>
