<script setup lang="ts">
import type { Segment } from '@/composables/useLiveSimulation'
import { SHIFT_STATES, formatDuration, formatShiftTime } from '@/lib/machine-status'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

defineProps<{
  segments: Segment[]
  total: number
  now: number
}>()
</script>

<template>
  <div class="relative h-8 overflow-hidden rounded-md bg-muted">
    <Tooltip v-for="(seg, i) in segments" :key="i">
      <TooltipTrigger as-child>
        <div
          class="absolute inset-y-0"
          :class="SHIFT_STATES[seg.state].bg"
          :style="{ left: `${(seg.start / total) * 100}%`, width: `${((seg.end - seg.start) / total) * 100}%` }"
        />
      </TooltipTrigger>
      <TooltipContent>
        {{ SHIFT_STATES[seg.state].label }} · {{ formatShiftTime(seg.start) }}–{{ formatShiftTime(seg.end) }}
        · {{ formatDuration((seg.end - seg.start) * 60) }}
      </TooltipContent>
    </Tooltip>
    <div
      class="pointer-events-none absolute inset-y-0 w-0.5 bg-foreground"
      :style="{ left: `${(now / total) * 100}%` }"
    />
  </div>
</template>
