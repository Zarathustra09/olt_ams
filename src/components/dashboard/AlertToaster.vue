<script setup lang="ts">
import { onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { useLiveSimulation, type Alert } from '@/composables/useLiveSimulation'

// Renders nothing; turns simulation alerts into toasts.
const router = useRouter()
const { onAlert } = useLiveSimulation()

const show = (a: Alert) => {
  if (!a.toast) return
  const open = { label: 'View', onClick: () => router.push(`/machines/${a.machineId}`) }
  const options = { description: a.detail, action: open, duration: a.kind === 'critical' ? 8000 : 5000 }
  if (a.kind === 'critical') toast.error(a.title, options)
  else if (a.kind === 'success') toast.success(a.title, options)
  else if (a.kind === 'major') toast.warning(a.title, options)
  else toast.info(a.title, options)
}

const off = onAlert(show)
onBeforeUnmount(() => off())
</script>

<template>
  <span class="hidden" />
</template>
