<script setup lang="ts">
import { computed } from 'vue'
import StatusBadge from '@/components/dashboard/StatusBadge.vue'
import { useLiveSimulation } from '@/composables/useLiveSimulation'
import { REASON_BY_CODE } from '@/data/analysis'
import { formatDuration, formatShiftTime } from '@/lib/machine-status'

const props = withDefaults(defineProps<{ machineId?: number; limit?: number }>(), { limit: 8 })

const { errors, machines, subAssets } = useLiveSimulation()

const rows = computed(() => {
  const out = []
  for (let i = errors.length - 1; i >= 0 && out.length < props.limit; i--) {
    const e = errors[i]!
    if (props.machineId && e.machineId !== props.machineId) continue
    out.push({
      ...e,
      reason: REASON_BY_CODE[e.code]?.reason ?? e.code,
      machine: machines.find((m) => m.id === e.machineId)?.name ?? '',
      asset: subAssets.find((a) => a.id === e.subAssetId)?.name ?? '',
    })
  }
  return out
})
</script>

<template>
  <div>
    <div
      class="hidden grid-cols-[4rem_minmax(0,1fr)_6rem_5rem] gap-3 border-b pb-2 text-xs font-medium text-muted-foreground sm:grid"
    >
      <span>Time</span>
      <span>Error</span>
      <span>Severity</span>
      <span class="text-right">Duration</span>
    </div>
    <TransitionGroup tag="div" class="divide-y" name="log">
      <div
        v-for="row in rows"
        :key="row.id"
        class="grid grid-cols-[4rem_minmax(0,1fr)] items-center gap-x-3 gap-y-1 py-2.5 text-sm sm:grid-cols-[4rem_minmax(0,1fr)_6rem_5rem]"
      >
        <span class="tabular-nums text-muted-foreground">{{ formatShiftTime(row.minute) }}</span>
        <div class="min-w-0">
          <div class="truncate font-medium">
            <span class="mr-1.5 font-mono text-xs text-muted-foreground">{{ row.code }}</span>{{ row.reason }}
          </div>
          <div class="truncate text-xs text-muted-foreground">
            <template v-if="!machineId">{{ row.machine }} · </template>{{ row.asset }}
          </div>
        </div>
        <div class="col-start-2 sm:col-start-auto"><StatusBadge :severity="row.severity" /></div>
        <span class="col-start-2 tabular-nums sm:col-start-auto sm:text-right">{{ formatDuration(row.durationSec) }}</span>
      </div>
    </TransitionGroup>
    <p v-if="!rows.length" class="py-6 text-center text-sm text-muted-foreground">No errors recorded this shift.</p>
  </div>
</template>

<style scoped>
.log-enter-active {
  transition: all 0.4s ease-out;
}
.log-enter-from {
  opacity: 0;
  transform: translateY(-6px);
  background-color: color-mix(in oklch, var(--primary) 10%, transparent);
}
@media (prefers-reduced-motion: reduce) {
  .log-enter-active {
    transition: none;
  }
}
</style>
