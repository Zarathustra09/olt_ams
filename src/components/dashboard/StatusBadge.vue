<script setup lang="ts">
import { computed } from 'vue'
import { CircleCheck, Info, OctagonAlert, TriangleAlert } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { TONE_CLASSES } from '@/lib/machine-status'
import type { Severity } from '@/data/analysis'
import type { HealthLevel } from '@/lib/machine-status'

// Status color always ships with an icon + text label, never color alone.
const props = defineProps<{ severity?: Severity; health?: HealthLevel }>()

const config = computed(() => {
  switch (props.severity ?? props.health) {
    case 'critical': return { label: 'Critical', icon: OctagonAlert, color: TONE_CLASSES.danger.text }
    case 'major': return { label: 'Major', icon: TriangleAlert, color: TONE_CLASSES.warning.text }
    case 'watch': return { label: 'Watch', icon: TriangleAlert, color: TONE_CLASSES.warning.text }
    case 'healthy': return { label: 'Healthy', icon: CircleCheck, color: TONE_CLASSES.success.text }
    default: return { label: 'Minor', icon: Info, color: 'text-muted-foreground' }
  }
})
</script>

<template>
  <Badge variant="outline" class="gap-1">
    <component :is="config.icon" :class="config.color" />
    {{ config.label }}
  </Badge>
</template>
