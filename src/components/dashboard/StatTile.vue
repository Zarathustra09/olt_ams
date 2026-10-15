<script setup lang="ts">
import type { Component } from 'vue'
import { computed } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAnimatedNumber } from '@/composables/useAnimatedNumber'

const props = withDefaults(
  defineProps<{
    label: string
    value: number
    icon: Component
    decimals?: number
    suffix?: string
    hint?: string
    /** Overrides decimals/suffix formatting, e.g. for durations. */
    format?: (value: number) => string
  }>(),
  { decimals: 0, suffix: '' },
)

const animated = useAnimatedNumber(() => props.value)
const display = computed(() =>
  props.format ? props.format(animated.value) : `${animated.value.toFixed(props.decimals)}${props.suffix}`,
)
</script>

<template>
  <Card>
    <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle class="text-sm font-medium">{{ label }}</CardTitle>
      <component :is="icon" class="size-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div class="text-2xl font-bold tabular-nums">{{ display }}</div>
      <p v-if="hint" class="mt-1 text-xs text-muted-foreground">{{ hint }}</p>
    </CardContent>
  </Card>
</template>
