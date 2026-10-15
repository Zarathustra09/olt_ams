<script setup lang="ts">
import { Pause, Play } from 'lucide-vue-next'
import { useTimeAgo } from '@vueuse/core'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useLiveSimulation } from '@/composables/useLiveSimulation'

const { isLive, lastUpdated, toggle } = useLiveSimulation()
const updated = useTimeAgo(lastUpdated, { updateInterval: 1000, showSecond: true })
</script>

<template>
  <div class="flex items-center gap-2">
    <Badge variant="outline" class="gap-2 pl-2">
      <span class="relative flex size-2">
        <span
          v-if="isLive"
          class="absolute inline-flex size-full animate-ping rounded-full bg-status-running opacity-75 motion-reduce:animate-none"
        />
        <span class="relative inline-flex size-2 rounded-full" :class="isLive ? 'bg-status-running' : 'bg-muted-foreground'" />
      </span>
      {{ isLive ? 'LIVE' : 'PAUSED' }}
    </Badge>
    <span class="hidden text-xs text-muted-foreground sm:inline">Updated {{ updated }}</span>
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger as-child>
          <Button variant="outline" size="icon" class="size-8" :aria-label="isLive ? 'Pause live updates' : 'Resume live updates'" @click="toggle">
            <component :is="isLive ? Pause : Play" class="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{{ isLive ? 'Pause live updates' : 'Resume live updates' }}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>
</template>
