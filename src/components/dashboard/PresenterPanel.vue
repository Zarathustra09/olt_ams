<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMagicKeys, useStorage, whenever } from '@vueuse/core'
import { Clapperboard, Pause, Play, RotateCcw, Tv, X, Zap } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { useLiveSimulation } from '@/composables/useLiveSimulation'

// Hidden from the audience: reveal with Ctrl+Shift+D or by opening any page with ?presenter=1.
const route = useRoute()
const router = useRouter()
const sim = useLiveSimulation()

const revealed = useStorage('machtrax-presenter', false)
const open = ref(false)
const machineId = ref('2')

watch(
  () => route.query.presenter,
  (v) => {
    if (v === '1') revealed.value = true
  },
  { immediate: true },
)

const keys = useMagicKeys({
  passive: false,
  onEventFired(e) {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'd') e.preventDefault()
  },
})
whenever(keys['Ctrl+Shift+D']!, () => {
  revealed.value = !revealed.value
  if (!revealed.value) open.value = false
})

const candidates = computed(() => sim.machines.filter((m) => m.status === 'running' || m.status === 'idle'))
const selectedMachine = computed(() => sim.getMachine(Number(machineId.value)))
const canBreak = computed(() => !!selectedMachine.value && selectedMachine.value.status !== 'fault' && selectedMachine.value.status !== 'offline')

const breakdown = () => {
  if (!sim.simulateBreakdown(Number(machineId.value))) toast.info('That machine cannot fail right now')
}
const drift = () => {
  if (!sim.simulateQualityDrift(Number(machineId.value))) toast.info('Quality drift is already active or the machine is unavailable')
}
const reset = () => {
  sim.resetDemo()
  toast.success('Demo reset to its starting state')
}
const hide = () => {
  revealed.value = false
  open.value = false
}
</script>

<template>
  <div v-if="revealed" class="fixed bottom-4 right-4 z-50 print:hidden">
    <Popover v-model:open="open">
      <PopoverTrigger as-child>
        <Button size="icon" class="size-11 rounded-full shadow-lg" aria-label="Presenter controls">
          <Clapperboard class="size-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" side="top" class="w-72 space-y-3">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm font-semibold">Presenter controls</div>
            <div class="text-xs text-muted-foreground">Ctrl+Shift+D hides this</div>
          </div>
          <Button variant="ghost" size="icon" class="size-7" aria-label="Hide controls" @click="hide">
            <X class="size-4" />
          </Button>
        </div>

        <Select v-model="machineId">
          <SelectTrigger class="w-full" aria-label="Target machine"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem v-for="m in candidates" :key="m.id" :value="String(m.id)">{{ m.name }}</SelectItem>
          </SelectContent>
        </Select>

        <div class="grid gap-2">
          <Button variant="destructive" :disabled="!canBreak" @click="breakdown">
            <Zap class="size-4" /> Simulate breakdown
          </Button>
          <Button variant="outline" :disabled="!canBreak" @click="drift">Simulate quality drift</Button>
        </div>

        <Separator />

        <div class="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" @click="sim.toggle()">
            <component :is="sim.isLive.value ? Pause : Play" class="size-4" />
            {{ sim.isLive.value ? 'Pause' : 'Resume' }}
          </Button>
          <Button variant="outline" size="sm" @click="reset"><RotateCcw class="size-4" /> Reset</Button>
        </div>
        <Button variant="secondary" size="sm" class="w-full" @click="router.push('/wall')">
          <Tv class="size-4" /> Open wall display
        </Button>
      </PopoverContent>
    </Popover>
  </div>
</template>
