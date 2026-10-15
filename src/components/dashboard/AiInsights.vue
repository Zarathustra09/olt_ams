<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { Check, Gauge, Sparkles, Wrench, Search } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useInsights, type InsightKind } from '@/composables/useInsights'

const props = defineProps<{ machineId?: number }>()

const router = useRouter()
const insights = useInsights(() => props.machineId)

const ICONS: Record<InsightKind, typeof Wrench> = { maintenance: Wrench, 'root-cause': Search, speed: Gauge }
const LABELS: Record<InsightKind, string> = {
  maintenance: 'Predictive maintenance',
  'root-cause': 'Root cause',
  speed: 'Speed loss',
}

let workOrder = 1041
const created = ref(new Set<string>())

const act = (id: string, title: string, machineId: number, kind: InsightKind) => {
  created.value = new Set(created.value).add(id)
  if (kind === 'root-cause') {
    toast.success('Analysis started', { description: title })
    return
  }
  workOrder += 1
  toast.success(`Work order WO-${workOrder} created`, {
    description: title,
    action: { label: 'Open machine', onClick: () => router.push(`/machines/${machineId}`) },
  })
}
</script>

<template>
  <!-- Gradient hairline border -->
  <div class="rounded-xl bg-gradient-to-r from-primary/60 via-primary/15 to-primary/60 p-px">
    <div class="rounded-[calc(var(--radius)+3px)] bg-card">
      <div class="flex items-center justify-between gap-3 border-b px-5 py-4">
        <div class="flex items-center gap-2.5">
          <div class="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sparkles class="size-4" />
          </div>
          <div>
            <div class="text-base font-semibold leading-tight">AI insights</div>
            <div class="text-xs text-muted-foreground">Generated from live machine data</div>
          </div>
        </div>
        <Badge variant="outline">{{ insights.length }} recommendations</Badge>
      </div>

      <div class="divide-y">
        <div v-for="i in insights" :key="i.id" class="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start">
          <div class="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
            <component :is="ICONS[i.kind]" class="size-4 text-muted-foreground" />
          </div>
          <div class="min-w-0 flex-1 space-y-1">
            <div class="flex flex-wrap items-center gap-2">
              <span class="font-medium">{{ i.title }}</span>
              <Badge variant="secondary" class="font-normal">{{ LABELS[i.kind] }}</Badge>
            </div>
            <p class="text-sm text-muted-foreground">{{ i.body }}</p>
            <p class="text-xs text-muted-foreground">Confidence {{ i.confidence }}%</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            class="shrink-0"
            :disabled="created.has(i.id)"
            @click="act(i.id, i.title, i.machineId, i.kind)"
          >
            <Check v-if="created.has(i.id)" class="size-4" />
            {{ created.has(i.id) ? 'Done' : i.actionLabel }}
          </Button>
        </div>
        <p v-if="!insights.length" class="px-5 py-8 text-center text-sm text-muted-foreground">
          Not enough data yet to generate recommendations.
        </p>
      </div>
    </div>
  </div>
</template>
