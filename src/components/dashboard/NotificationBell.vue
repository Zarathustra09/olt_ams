<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useNow } from '@vueuse/core'
import { Bell, BellRing, CheckCheck, CircleCheck, Info, OctagonAlert, TriangleAlert } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useLiveSimulation, type Alert, type AlertKind } from '@/composables/useLiveSimulation'
import { TONE_CLASSES } from '@/lib/machine-status'

const sim = useLiveSimulation()
const open = ref(false)

const latest = computed(() => sim.alerts.slice(0, 8))

// Ring the bell briefly whenever a new alert arrives.
const ringing = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined
watch(
  () => sim.alerts[0]?.id,
  (id, prev) => {
    if (prev === undefined || id === prev) return
    ringing.value = true
    clearTimeout(timer)
    timer = setTimeout(() => (ringing.value = false), 1800)
  },
)

const KIND: Record<AlertKind, { icon: typeof Info; color: string }> = {
  critical: { icon: OctagonAlert, color: TONE_CLASSES.danger.text },
  major: { icon: TriangleAlert, color: TONE_CLASSES.warning.text },
  success: { icon: CircleCheck, color: TONE_CLASSES.success.text },
  info: { icon: Info, color: 'text-muted-foreground' },
}

// One shared clock for every row (creating a timer per row per render would leak).
const now = useNow({ interval: 5000 })
const ago = (a: Alert) => {
  const s = Math.max(0, Math.round((now.value.getTime() - a.at) / 1000))
  if (s < 10) return 'just now'
  if (s < 60) return `${s}s ago`
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  return `${Math.floor(s / 3600)}h ago`
}
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <Button variant="ghost" size="icon" class="relative size-9" :aria-label="`Notifications, ${sim.unreadCount.value} unread`">
        <component :is="ringing ? BellRing : Bell" class="size-5" :class="ringing && 'animate-pulse text-danger'" />
        <span
          v-if="sim.unreadCount.value > 0"
          class="absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold leading-4 text-white"
        >
          {{ sim.unreadCount.value > 9 ? '9+' : sim.unreadCount.value }}
        </span>
      </Button>
    </PopoverTrigger>
    <PopoverContent align="end" class="w-96 max-w-[calc(100vw-2rem)] p-0">
      <div class="flex items-center justify-between border-b px-4 py-3">
        <div class="text-sm font-semibold">Notifications</div>
        <Button variant="ghost" size="sm" class="h-7 gap-1 px-2 text-xs" :disabled="!sim.unreadCount.value" @click="sim.markAllRead()">
          <CheckCheck class="size-3.5" /> Mark all read
        </Button>
      </div>
      <div class="max-h-96 divide-y overflow-y-auto">
        <RouterLink
          v-for="a in latest"
          :key="a.id"
          :to="`/machines/${a.machineId}`"
          class="flex gap-3 px-4 py-3 text-sm transition-colors hover:bg-muted/60"
          :class="!a.read && 'bg-muted/40'"
          @click="open = false"
        >
          <component :is="KIND[a.kind].icon" class="mt-0.5 size-4 shrink-0" :class="KIND[a.kind].color" />
          <div class="min-w-0 flex-1">
            <div class="truncate font-medium">{{ a.title }}</div>
            <div class="truncate text-xs text-muted-foreground">{{ a.detail }}</div>
            <div class="mt-0.5 text-[11px] text-muted-foreground">{{ ago(a) }}</div>
          </div>
          <span v-if="!a.read" class="mt-1.5 size-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />
        </RouterLink>
        <p v-if="!latest.length" class="px-4 py-8 text-center text-sm text-muted-foreground">You're all caught up.</p>
      </div>
      <div class="border-t px-4 py-2 text-center">
        <RouterLink to="/oee/alerts" class="text-xs font-medium text-primary hover:underline" @click="open = false">
          View all alerts
        </RouterLink>
      </div>
    </PopoverContent>
  </Popover>
</template>
