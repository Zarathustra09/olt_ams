<script setup lang="ts">
import { computed, useId } from 'vue'
import { TrendingDown, TrendingUp } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAnimatedNumber } from '@/composables/useAnimatedNumber'
import { getOeeTone, TONE_CLASSES } from '@/lib/machine-status'

const props = defineProps<{
  label: string
  value: number
  previous: number
  history: number[]
}>()

const uid = useId()
const clamp = (v: number) => Math.min(100, Math.max(0, v))

const fill = useAnimatedNumber(() => props.value, 1100)
const needle = useAnimatedNumber(() => props.value, 1400, 'easeOutBack')

const tone = computed(() => TONE_CLASSES[getOeeTone(props.value)])
const needleAngle = computed(() => (clamp(needle.value) / 100) * 180 - 90)
const delta = computed(() => props.value - props.previous)

const sparkline = computed(() => {
  const pts = props.history
  if (pts.length < 2) return { line: '', area: '' }
  const lo = Math.min(...pts)
  const hi = Math.max(...pts)
  const span = Math.max(hi - lo, 2)
  const coords = pts.map((v, i) => {
    const x = (i / (pts.length - 1)) * 200
    const y = 34 - ((v - lo) / span) * 28
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  const line = `M ${coords.join(' L ')}`
  return { line, area: `${line} L 200,40 L 0,40 Z` }
})
</script>

<template>
  <Card>
    <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-0">
      <CardTitle class="text-base">{{ label }}</CardTitle>
      <Badge variant="outline" :class="delta >= 0 ? 'text-success' : 'text-danger'">
        <component :is="delta >= 0 ? TrendingUp : TrendingDown" />
        {{ delta >= 0 ? '+' : '' }}{{ delta.toFixed(1) }}
      </Badge>
    </CardHeader>
    <CardContent class="space-y-3">
      <div class="relative">
        <svg viewBox="0 0 200 118" class="w-full" role="img" :aria-label="`${label} ${value.toFixed(1)} percent`">
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            pathLength="100"
            fill="none"
            class="stroke-muted"
            stroke-width="12"
            stroke-linecap="round"
          />
          <path
            v-if="fill > 0.5"
            d="M 20 100 A 80 80 0 0 1 180 100"
            pathLength="100"
            fill="none"
            :class="tone.stroke"
            stroke-width="12"
            stroke-linecap="round"
            :stroke-dasharray="`${clamp(fill)} 100`"
          />
          <g :transform="`rotate(${needleAngle} 100 100)`">
            <line x1="100" y1="100" x2="100" y2="38" class="stroke-foreground" stroke-width="3" stroke-linecap="round" />
          </g>
          <circle cx="100" cy="100" r="6" class="fill-foreground" />
          <circle cx="100" cy="100" r="2.5" class="fill-card" />
        </svg>
        <div class="absolute inset-x-0 bottom-0 flex items-end justify-between px-3 text-[11px] text-muted-foreground">
          <span>0</span>
          <span>100</span>
        </div>
      </div>

      <div class="text-center">
        <span class="text-3xl font-bold tabular-nums">{{ fill.toFixed(1) }}</span>
        <span class="ml-0.5 text-sm text-muted-foreground">%</span>
      </div>

      <svg viewBox="0 0 200 40" preserveAspectRatio="none" class="h-10 w-full" :class="tone.text" aria-hidden="true">
        <defs>
          <linearGradient :id="`${uid}-fill`" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="currentColor" stop-opacity="0.3" />
            <stop offset="100%" stop-color="currentColor" stop-opacity="0.02" />
          </linearGradient>
        </defs>
        <path :d="sparkline.area" :fill="`url(#${uid}-fill)`" />
        <path :d="sparkline.line" fill="none" stroke="currentColor" stroke-width="2" vector-effect="non-scaling-stroke" />
      </svg>

      <div class="flex items-center justify-between text-sm">
        <span class="text-muted-foreground">Previous period</span>
        <span class="font-semibold tabular-nums">{{ previous.toFixed(1) }} %</span>
      </div>
    </CardContent>
  </Card>
</template>
