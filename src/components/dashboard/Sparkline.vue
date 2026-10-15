<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ values: number[] }>()

const path = computed(() => {
  const pts = props.values
  if (pts.length < 2) return ''
  const lo = Math.min(...pts)
  const hi = Math.max(...pts)
  const span = hi - lo || 1
  return (
    'M ' +
    pts
      .map((v, i) => `${((i / (pts.length - 1)) * 100).toFixed(1)},${(22 - ((v - lo) / span) * 20).toFixed(1)}`)
      .join(' L ')
  )
})
</script>

<template>
  <svg viewBox="0 0 100 24" preserveAspectRatio="none" class="h-6 w-full" aria-hidden="true">
    <path :d="path" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" vector-effect="non-scaling-stroke" />
  </svg>
</template>
