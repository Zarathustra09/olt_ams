<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useDark } from '@vueuse/core'
import AlertToaster from '@/components/dashboard/AlertToaster.vue'
import PresenterPanel from '@/components/dashboard/PresenterPanel.vue'
import { Toaster } from '@/components/ui/sonner'

const isDark = useDark({ initialValue: 'light' })
</script>

<template>
  <RouterView />
  <Toaster rich-colors close-button position="top-right" :theme="isDark ? 'dark' : 'light'" />
  <AlertToaster />
  <PresenterPanel />
</template>
