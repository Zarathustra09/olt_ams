<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDateFormat } from '@vueuse/core'
import { ArrowLeft, Printer } from 'lucide-vue-next'
import logoBlack from '@/assets/images/logo-black.png'
import { Button } from '@/components/ui/button'
import { useInsights } from '@/composables/useInsights'
import { useLiveSimulation } from '@/composables/useLiveSimulation'
import { REASON_BY_CODE } from '@/data/analysis'
import { FINANCE, formatPeso } from '@/data/finance'
import { HEALTH_LEVELS, MACHINE_STATUS, formatDuration, formatShiftTime, getHealthLevel } from '@/lib/machine-status'

const route = useRoute()
const router = useRouter()
const sim = useLiveSimulation()

// A report is a snapshot: freeze the numbers at the moment it was opened.
const machineId = computed(() => (route.query.machine ? Number(route.query.machine) : undefined))
const scopeMachine = machineId.value ? sim.getMachine(machineId.value) : undefined
const inScope = (id: number) => !machineId.value || id === machineId.value

const snap = JSON.parse(
  JSON.stringify({
    plant: sim.plant.value,
    previous: sim.previous,
    machines: sim.machines.filter((m) => inScope(m.id)),
    costs: sim.costByMachine.value.filter((c) => inScope(c.machineId)),
    errors: sim.errors.filter((e) => inScope(e.machineId)),
    subAssets: sim.subAssets.filter((a) => inScope(a.machineId)),
    nowMinute: sim.nowMinute.value,
  }),
) as {
  plant: typeof sim.plant.value
  previous: typeof sim.previous
  machines: typeof sim.machines
  costs: typeof sim.costByMachine.value
  errors: typeof sim.errors
  subAssets: typeof sim.subAssets
  nowMinute: number
}
const insights = JSON.parse(JSON.stringify(useInsights(() => machineId.value).value)) as ReturnType<
  typeof useInsights
>['value']

const generated = new Date()
const generatedLabel = useDateFormat(generated, 'dddd, MMMM D, YYYY · hh:mm A')

const totals = {
  cost: snap.costs.reduce((s, c) => s + c.cost, 0),
  units: snap.costs.reduce((s, c) => s + c.unitsLost, 0),
  opportunity: snap.costs.reduce((s, c) => s + c.opportunity, 0),
  stops: snap.errors.length,
  seconds: snap.errors.reduce((s, e) => s + e.durationSec, 0),
}
const costOf = (id: number) => snap.costs.find((c) => c.machineId === id)?.cost ?? 0

const scoped = scopeMachine
  ? {
      oee: scopeMachine.oee,
      availability: scopeMachine.availability,
      performance: scopeMachine.performance,
      quality: scopeMachine.quality,
    }
  : snap.plant
const kpis = [
  { label: 'OEE', value: scoped.oee, prev: snap.previous.oee },
  { label: 'Availability', value: scoped.availability, prev: snap.previous.availability },
  { label: 'Performance', value: scoped.performance, prev: snap.previous.performance },
  { label: 'Quality', value: scoped.quality, prev: snap.previous.quality },
]

const reasons = (() => {
  const g = new Map<string, { count: number; seconds: number; cost: number }>()
  for (const e of snap.errors) {
    const row = g.get(e.code) ?? { count: 0, seconds: 0, cost: 0 }
    row.count++
    row.seconds += e.durationSec
    row.cost += (e.durationSec / 3600) * FINANCE[e.machineId]!.hourlyValue
    g.set(e.code, row)
  }
  return [...g.entries()]
    .map(([code, v]) => ({ code, reason: REASON_BY_CODE[code]?.reason ?? code, ...v }))
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 5)
})()

const attention = snap.subAssets
  .filter((a) => getHealthLevel(a.health) !== 'healthy')
  .sort((a, b) => a.health - b.health)
  .map((a) => ({ ...a, machine: snap.machines.find((m) => m.id === a.machineId)?.name ?? '' }))

// Reports are always printed light, whatever theme the app is in.
let wasDark = false
onMounted(() => {
  wasDark = document.documentElement.classList.contains('dark')
  document.documentElement.classList.remove('dark')
})
onBeforeUnmount(() => {
  if (wasDark) document.documentElement.classList.add('dark')
})

const print = () => window.print()

const title = scopeMachine ? `${scopeMachine.name} · shift report` : 'Plant shift report'
</script>

<template>
  <div class="min-h-screen bg-muted/40 py-8 print:bg-white print:py-0">
    <div class="mx-auto mb-4 flex max-w-[210mm] items-center justify-between px-4 print:hidden">
      <Button variant="ghost" @click="router.back()"><ArrowLeft class="size-4" /> Back</Button>
      <Button @click="print"><Printer class="size-4" /> Print / Save as PDF</Button>
    </div>

    <article class="mx-auto max-w-[210mm] space-y-6 bg-white p-8 text-neutral-900 shadow-sm print:max-w-none print:p-0 print:shadow-none">
      <header class="flex items-start justify-between border-b pb-4">
        <div>
          <h1 class="text-2xl font-bold">{{ title }}</h1>
          <p class="text-sm text-neutral-600">
            Day shift 06:00 – 14:00 · Report at {{ formatShiftTime(snap.nowMinute) }} into the shift
          </p>
          <p class="text-xs text-neutral-500">Generated {{ generatedLabel }}</p>
        </div>
        <div class="text-right">
          <img :src="logoBlack" alt="Olterra Solutions" class="ml-auto h-14 w-auto object-contain" />
          <div class="text-xs font-medium text-neutral-600">MachTrax System</div>
        </div>
      </header>

      <section class="break-inside-avoid">
        <h2 class="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-500">Performance</h2>
        <div class="grid grid-cols-4 gap-3">
          <div v-for="k in kpis" :key="k.label" class="rounded-lg border p-3">
            <div class="text-xs text-neutral-500">{{ k.label }}</div>
            <div class="text-2xl font-bold tabular-nums">{{ k.value.toFixed(1) }}%</div>
            <div class="text-xs text-neutral-500">
              {{ k.value - k.prev >= 0 ? '+' : '' }}{{ (k.value - k.prev).toFixed(1) }} vs previous period
            </div>
          </div>
        </div>
      </section>

      <section class="break-inside-avoid">
        <h2 class="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-500">Cost of downtime</h2>
        <div class="grid grid-cols-4 gap-3">
          <div class="rounded-lg border p-3">
            <div class="text-xs text-neutral-500">Lost value today</div>
            <div class="text-xl font-bold tabular-nums">{{ formatPeso(totals.cost) }}</div>
          </div>
          <div class="rounded-lg border p-3">
            <div class="text-xs text-neutral-500">Parts not produced</div>
            <div class="text-xl font-bold tabular-nums">{{ totals.units.toLocaleString() }}</div>
          </div>
          <div class="rounded-lg border p-3">
            <div class="text-xs text-neutral-500">Stops / downtime</div>
            <div class="text-xl font-bold tabular-nums">{{ totals.stops }} · {{ formatDuration(totals.seconds) }}</div>
          </div>
          <div class="rounded-lg border p-3">
            <div class="text-xs text-neutral-500">Monthly opportunity</div>
            <div class="text-xl font-bold tabular-nums">{{ formatPeso(totals.opportunity) }}</div>
          </div>
        </div>
      </section>

      <section class="break-inside-avoid">
        <h2 class="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-500">Machines</h2>
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b text-left text-xs text-neutral-500">
              <th class="py-1.5 font-medium">Machine</th>
              <th class="font-medium">Status</th>
              <th class="text-right font-medium">OEE</th>
              <th class="text-right font-medium">A</th>
              <th class="text-right font-medium">P</th>
              <th class="text-right font-medium">Q</th>
              <th class="text-right font-medium">Parts</th>
              <th class="text-right font-medium">Cost of stops</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="m in snap.machines" :key="m.id" class="border-b">
              <td class="py-1.5 font-medium">{{ m.name }}</td>
              <td>{{ MACHINE_STATUS[m.status].label }}</td>
              <td class="text-right tabular-nums">{{ m.oee.toFixed(1) }}%</td>
              <td class="text-right tabular-nums">{{ m.availability.toFixed(1) }}</td>
              <td class="text-right tabular-nums">{{ m.performance.toFixed(1) }}</td>
              <td class="text-right tabular-nums">{{ m.quality.toFixed(1) }}</td>
              <td class="text-right tabular-nums">{{ m.partsToday }}</td>
              <td class="text-right tabular-nums">{{ formatPeso(costOf(m.id)) }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section class="break-inside-avoid">
        <h2 class="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-500">Top stop reasons</h2>
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b text-left text-xs text-neutral-500">
              <th class="py-1.5 font-medium">Reason</th>
              <th class="text-right font-medium">Stops</th>
              <th class="text-right font-medium">Downtime</th>
              <th class="text-right font-medium">Cost</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in reasons" :key="r.code" class="border-b">
              <td class="py-1.5"><span class="mr-1.5 font-mono text-xs text-neutral-500">{{ r.code }}</span>{{ r.reason }}</td>
              <td class="text-right tabular-nums">{{ r.count }}</td>
              <td class="text-right tabular-nums">{{ formatDuration(r.seconds) }}</td>
              <td class="text-right tabular-nums">{{ formatPeso(r.cost) }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section v-if="attention.length" class="break-inside-avoid">
        <h2 class="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-500">Components needing attention</h2>
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b text-left text-xs text-neutral-500">
              <th class="py-1.5 font-medium">Component</th>
              <th class="font-medium">Machine</th>
              <th class="text-right font-medium">Health</th>
              <th class="text-right font-medium">Condition</th>
              <th class="text-right font-medium">Next service</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="a in attention" :key="a.id" class="border-b">
              <td class="py-1.5 font-medium">{{ a.name }}</td>
              <td>{{ a.machine }}</td>
              <td class="text-right tabular-nums">{{ a.health.toFixed(0) }}%</td>
              <td class="text-right">{{ HEALTH_LEVELS[getHealthLevel(a.health)].label }}</td>
              <td class="text-right tabular-nums">{{ a.nextServiceDays }} days</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section v-if="insights.length" class="break-inside-avoid">
        <h2 class="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-500">Recommendations</h2>
        <ol class="space-y-2 text-sm">
          <li v-for="(i, n) in insights" :key="i.id" class="rounded-lg border p-3">
            <div class="font-medium">{{ n + 1 }}. {{ i.title }}</div>
            <div class="text-neutral-600">{{ i.body }}</div>
          </li>
        </ol>
      </section>

      <footer class="grid grid-cols-2 gap-8 pt-10 text-xs text-neutral-500">
        <div class="border-t pt-1">Shift supervisor</div>
        <div class="border-t pt-1">Plant manager</div>
      </footer>
    </article>
  </div>
</template>

<style>
@page {
  size: A4;
  margin: 14mm;
}
</style>
