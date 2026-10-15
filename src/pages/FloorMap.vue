<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { Activity, Banknote, Gauge, TriangleAlert } from 'lucide-vue-next'
import AppLayout from '@/layouts/AppLayout.vue'
import LiveIndicator from '@/components/dashboard/LiveIndicator.vue'
import StatTile from '@/components/dashboard/StatTile.vue'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useLiveSimulation } from '@/composables/useLiveSimulation'
import { formatPesoCompact } from '@/data/finance'
import { MACHINE_STATUS, TONE_CLASSES, getOeeTone } from '@/lib/machine-status'

const sim = useLiveSimulation()

// Material flows left to right, top to bottom, through these zones.
const ZONES = ['Production Floor A', 'Production Floor B', 'Assembly Hall', 'Shipping']

const costById = computed(() => new Map(sim.costByMachine.value.map((c) => [c.machineId, c.cost])))

const zones = computed(() =>
  ZONES.map((name) => {
    const list = sim.machines.filter((m) => m.location === name)
    const active = list.filter((m) => m.status !== 'offline')
    const hasFault = list.some((m) => m.status === 'fault')
    return {
      name,
      machines: list,
      hasFault,
      oee: active.length ? active.reduce((s, m) => s + m.oee, 0) / active.length : 0,
    }
  }),
)

const running = computed(() => sim.machines.filter((m) => m.status === 'running').length)
const attention = computed(() => sim.machines.filter((m) => m.status === 'fault' || m.status === 'idle').length)
const legend = ['running', 'idle', 'fault', 'offline'] as const
</script>

<template>
  <AppLayout>
    <div class="space-y-6">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-foreground">Plant floor</h1>
          <p class="text-muted-foreground">Every machine at a glance. Select one to drill in.</p>
        </div>
        <LiveIndicator />
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Machines running" :value="running" :icon="Activity" :hint="`of ${sim.machines.length} machines`" />
        <StatTile label="Plant OEE" :value="sim.plant.value.oee" :icon="Gauge" :decimals="1" suffix="%" hint="Active machines" />
        <StatTile label="Need attention" :value="attention" :icon="TriangleAlert" hint="Fault or idle" />
        <StatTile
          label="Downtime cost today"
          :value="sim.finance.value.cost"
          :icon="Banknote"
          :format="formatPesoCompact"
          hint="Across all machines"
        />
      </div>

      <!-- Material flow -->
      <div class="rounded-xl border bg-card p-4">
        <div class="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Material flow</div>
        <div class="flex flex-wrap items-center gap-y-2">
          <template v-for="(z, i) in zones" :key="z.name">
            <Badge variant="outline" class="gap-1.5 px-3 py-1 text-sm font-medium">
              <span class="size-2 rounded-full" :class="z.hasFault ? 'bg-status-offline' : 'bg-status-running'" />
              {{ z.name }}
            </Badge>
            <div v-if="i < zones.length - 1" class="mx-2 hidden h-4 min-w-8 flex-1 items-center sm:flex">
              <div class="flow-line h-0.5 w-full text-muted-foreground" :class="z.hasFault && 'is-halted text-danger'" />
            </div>
          </template>
        </div>
      </div>

      <!-- Zones -->
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section
          v-for="z in zones"
          :key="z.name"
          class="dot-grid rounded-xl border p-4"
          :class="z.hasFault && 'border-danger/50'"
          :aria-label="z.name"
        >
          <div class="mb-3 flex items-center justify-between">
            <div>
              <h2 class="font-semibold">{{ z.name }}</h2>
              <p class="text-xs text-muted-foreground">
                {{ z.machines.length }} {{ z.machines.length === 1 ? 'machine' : 'machines' }}
              </p>
            </div>
            <Badge variant="outline" class="tabular-nums">{{ z.oee.toFixed(0) }}% OEE</Badge>
          </div>

          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Tooltip v-for="m in z.machines" :key="m.id">
              <TooltipTrigger as-child>
                <RouterLink
                  :to="`/machines/${m.id}`"
                  class="group flex gap-3 rounded-lg border bg-card p-3 shadow-xs outline-none transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  :class="m.status === 'fault' && 'border-danger ring-2 ring-danger/60 motion-safe:animate-pulse'"
                >
                  <!-- OEE ring -->
                  <div class="relative size-14 shrink-0">
                    <svg viewBox="0 0 44 44" class="size-full -rotate-90" aria-hidden="true">
                      <circle cx="22" cy="22" r="18" fill="none" class="stroke-muted" stroke-width="5" />
                      <circle
                        cx="22" cy="22" r="18" fill="none" pathLength="100"
                        :class="TONE_CLASSES[getOeeTone(m.oee)].stroke"
                        stroke-width="5" stroke-linecap="round"
                        :stroke-dasharray="`${Math.max(m.oee, 0.01)} 100`"
                        class="transition-[stroke-dasharray] duration-700"
                      />
                    </svg>
                    <span class="absolute inset-0 flex items-center justify-center text-xs font-bold tabular-nums">
                      {{ m.oee.toFixed(0) }}
                    </span>
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="truncate text-sm font-semibold group-hover:underline underline-offset-4">{{ m.name }}</div>
                    <div class="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span class="relative flex size-2">
                        <span
                          v-if="m.status === 'running' || m.status === 'fault'"
                          class="absolute inline-flex size-full animate-ping rounded-full opacity-75 motion-reduce:animate-none"
                          :class="MACHINE_STATUS[m.status].dot"
                        />
                        <span class="relative inline-flex size-2 rounded-full" :class="MACHINE_STATUS[m.status].dot" />
                      </span>
                      {{ MACHINE_STATUS[m.status].label }}
                    </div>
                    <div class="mt-1 flex gap-3 text-xs tabular-nums text-muted-foreground">
                      <span>{{ m.partsToday }} parts</span>
                      <span>{{ formatPesoCompact(costById.get(m.id) ?? 0) }} lost</span>
                    </div>
                  </div>
                </RouterLink>
              </TooltipTrigger>
              <TooltipContent>
                {{ m.type }} · A {{ m.availability.toFixed(0) }}% · P {{ m.performance.toFixed(0) }}% · Q {{ m.quality.toFixed(0) }}%
              </TooltipContent>
            </Tooltip>
          </div>
        </section>
      </div>

      <div class="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted-foreground">
        <span v-for="s in legend" :key="s" class="flex items-center gap-1.5">
          <span class="size-2.5 rounded-full" :class="MACHINE_STATUS[s].dot" />{{ MACHINE_STATUS[s].label }}
        </span>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
.dot-grid {
  background-image: radial-gradient(color-mix(in oklch, var(--muted-foreground) 30%, transparent) 1px, transparent 1px);
  background-size: 18px 18px;
}

.flow-line {
  background-image: repeating-linear-gradient(90deg, currentColor 0 6px, transparent 6px 12px);
  background-size: 12px 2px;
  background-repeat: repeat-x;
  animation: flow 0.9s linear infinite;
}
.flow-line.is-halted {
  animation-play-state: paused;
  opacity: 0.5;
}

@keyframes flow {
  to {
    background-position-x: 12px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .flow-line {
    animation: none;
  }
}
</style>
