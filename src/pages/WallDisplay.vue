<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useDateFormat, useFullscreen, useIntervalFn, useNow } from '@vueuse/core'
import { ArrowLeft, Banknote, Maximize, Minimize, OctagonAlert, TriangleAlert, CircleCheck } from 'lucide-vue-next'
import logoWhite from '@/assets/images/logo-white.png'
import LiveIndicator from '@/components/dashboard/LiveIndicator.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAnimatedNumber } from '@/composables/useAnimatedNumber'
import { useLiveSimulation } from '@/composables/useLiveSimulation'
import { formatPeso } from '@/data/finance'
import { HEALTH_LEVELS, MACHINE_STATUS, TONE_CLASSES, getHealthLevel, getOeeTone } from '@/lib/machine-status'

const router = useRouter()
const sim = useLiveSimulation()

const root = ref<HTMLElement | null>(null)
const { isFullscreen, toggle: toggleFullscreen } = useFullscreen(root)

const now = useNow({ interval: 1000 })
const time = useDateFormat(now, 'hh:mm:ss A')
const date = useDateFormat(now, 'dddd, MMMM D')

// Spotlight rotates through the machines every 10 seconds.
const spotlight = ref(0)
useIntervalFn(() => {
  spotlight.value = (spotlight.value + 1) % sim.machines.length
}, 10_000)

const plantOee = useAnimatedNumber(() => sim.plant.value.oee, 1000)
const cost = useAnimatedNumber(() => sim.finance.value.cost, 1000)

const tiles = computed(() =>
  sim.machines.map((m, i) => {
    const assets = sim.subAssets.filter((a) => a.machineId === m.id)
    const weakest = [...assets].sort((a, b) => a.health - b.health)[0]
    const health = weakest ? HEALTH_LEVELS[getHealthLevel(weakest.health)] : undefined
    return { m, tone: TONE_CLASSES[getOeeTone(m.oee)], weakest, health, spot: i === spotlight.value }
  }),
)

const ticker = computed(() => sim.alerts.slice(0, 6))
const ALERT_ICON = { critical: OctagonAlert, major: TriangleAlert, success: CircleCheck, info: CircleCheck } as const
</script>

<template>
  <div ref="root" class="dark flex min-h-screen flex-col bg-background text-foreground">
    <!-- Top bar -->
    <header class="flex flex-wrap items-center gap-x-8 gap-y-3 border-b px-6 py-4">
      <div class="flex items-center gap-3">
        <img :src="logoWhite" alt="Olterra Solutions" class="h-12 w-auto object-contain" />
        <div>
          <div class="text-xl font-bold leading-tight">MachTrax System</div>
          <div class="text-sm text-muted-foreground">Day shift · {{ date }}</div>
        </div>
      </div>

      <div class="flex flex-1 flex-wrap items-center justify-center gap-x-12 gap-y-2">
        <div class="text-center">
          <div class="text-xs uppercase tracking-widest text-muted-foreground">Plant OEE</div>
          <div class="text-6xl font-black tabular-nums leading-none">
            {{ plantOee.toFixed(1) }}<span class="text-3xl text-muted-foreground">%</span>
          </div>
        </div>
        <div class="text-center">
          <div class="flex items-center justify-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground">
            <Banknote class="size-3.5" /> Downtime cost today
          </div>
          <div class="text-5xl font-black tabular-nums leading-none">{{ formatPeso(cost) }}</div>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <div class="text-right">
          <div class="text-3xl font-bold tabular-nums leading-none">{{ time }}</div>
        </div>
        <LiveIndicator />
        <Button variant="outline" size="icon" :aria-label="isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'" @click="toggleFullscreen">
          <component :is="isFullscreen ? Minimize : Maximize" class="size-4" />
        </Button>
        <Button variant="outline" size="icon" aria-label="Back to dashboard" @click="router.push('/')">
          <ArrowLeft class="size-4" />
        </Button>
      </div>
    </header>

    <!-- Machines -->
    <main class="grid flex-1 grid-cols-1 gap-4 p-6 md:grid-cols-2 xl:grid-cols-3">
      <div
        v-for="t in tiles"
        :key="t.m.id"
        class="flex flex-col justify-between rounded-2xl border bg-card p-5 transition-all duration-500"
        :class="[
          t.spot && 'scale-[1.02] border-primary ring-2 ring-primary/50',
          t.m.status === 'fault' && 'border-danger ring-2 ring-danger/60 motion-safe:animate-pulse',
          t.m.status === 'offline' && 'opacity-60',
        ]"
      >
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <div class="truncate text-2xl font-bold">{{ t.m.name }}</div>
            <div class="text-sm text-muted-foreground">{{ t.m.type }} · {{ t.m.location }}</div>
          </div>
          <Badge variant="outline" class="gap-1.5 px-2.5 py-1 text-sm">
            <span class="size-2.5 rounded-full" :class="MACHINE_STATUS[t.m.status].dot" />
            {{ MACHINE_STATUS[t.m.status].label }}
          </Badge>
        </div>

        <div class="my-4 flex items-end gap-2">
          <span class="text-8xl font-black tabular-nums leading-none">{{ t.m.oee.toFixed(0) }}</span>
          <span class="pb-2 text-3xl text-muted-foreground">% OEE</span>
        </div>

        <div class="h-3 rounded-full bg-muted">
          <div class="h-3 rounded-full transition-[width] duration-700" :class="t.tone.bg" :style="{ width: `${t.m.oee}%` }" />
        </div>

        <div class="mt-4 grid grid-cols-4 gap-2 text-center">
          <div>
            <div class="text-xs text-muted-foreground">Avail.</div>
            <div class="text-xl font-bold tabular-nums">{{ t.m.availability.toFixed(0) }}%</div>
          </div>
          <div>
            <div class="text-xs text-muted-foreground">Perf.</div>
            <div class="text-xl font-bold tabular-nums">{{ t.m.performance.toFixed(0) }}%</div>
          </div>
          <div>
            <div class="text-xs text-muted-foreground">Quality</div>
            <div class="text-xl font-bold tabular-nums">{{ t.m.quality.toFixed(0) }}%</div>
          </div>
          <div>
            <div class="text-xs text-muted-foreground">Parts</div>
            <div class="text-xl font-bold tabular-nums">{{ t.m.partsToday }}</div>
          </div>
        </div>

        <div v-if="t.spot && t.weakest" class="mt-4 rounded-lg bg-muted/60 px-3 py-2 text-sm">
          Weakest component: <span class="font-semibold">{{ t.weakest.name }}</span> ·
          {{ t.weakest.health.toFixed(0) }}% health
          <span v-if="t.health" :class="TONE_CLASSES[t.health.tone].text">({{ t.health.label.toLowerCase() }})</span>
        </div>
      </div>
    </main>

    <!-- Alert ticker -->
    <footer class="overflow-hidden border-t bg-card/60 py-3">
      <div class="ticker flex w-max gap-12 whitespace-nowrap px-6">
        <template v-for="copy in 2" :key="copy">
          <span v-for="a in ticker" :key="`${copy}-${a.id}`" class="flex items-center gap-2 text-lg">
            <component
              :is="ALERT_ICON[a.kind]"
              class="size-5"
              :class="a.kind === 'critical' ? 'text-danger' : a.kind === 'major' ? 'text-warning' : 'text-success'"
            />
            <span class="font-semibold">{{ a.title }}</span>
            <span class="text-muted-foreground">{{ a.detail }}</span>
          </span>
        </template>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.ticker {
  animation: ticker 45s linear infinite;
}
@keyframes ticker {
  to {
    transform: translateX(-50%);
  }
}
@media (prefers-reduced-motion: reduce) {
  .ticker {
    animation: none;
  }
}
</style>
