<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

type Machine = {
  id: number
  name: string
  type: string
  status: 'running' | 'idle' | 'offline'
  oee: number
  availability: number
  performance: number
  quality: number
}

const router = useRouter()

const machines = ref<Machine[]>([
  { id: 1, name: 'CNC Machine 01', type: 'CNC Mill', status: 'running', oee: 88.5, availability: 92.3, performance: 95.8, quality: 100 },
  { id: 2, name: 'Press Machine 02', type: 'Hydraulic Press', status: 'running', oee: 75.2, availability: 88.1, performance: 85.3, quality: 100 },
  { id: 3, name: 'Lathe Machine 03', type: 'CNC Lathe', status: 'idle', oee: 45.8, availability: 65.2, performance: 70.3, quality: 100 },
  { id: 4, name: 'Assembly Line 01', type: 'Automated Assembly', status: 'running', oee: 92.1, availability: 95.5, performance: 96.5, quality: 100 },
  { id: 5, name: 'Welding Robot 01', type: 'Robotic Welder', status: 'offline', oee: 0, availability: 0, performance: 0, quality: 0 },
  { id: 6, name: 'Packaging Line 01', type: 'Packaging System', status: 'running', oee: 82.3, availability: 90.1, performance: 91.4, quality: 100 }
])

const statusClasses: Record<Machine['status'], string> = {
  running: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  idle: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  offline: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
}

const getOeeColor = (value: number) => (value >= 85 ? 'bg-emerald-500' : value >= 60 ? 'bg-amber-500' : 'bg-rose-500')

const capitalize = (value: Machine['status']) => value.charAt(0).toUpperCase() + value.slice(1)

const viewDetails = (id: number) => {
  console.log('Navigating to machine:', id) // Add debug log
  router.push(`/machines/${id}`)
}

const viewSettings = (id: number) => {
  router.push(`/machines/${id}/settings`)
}
</script>

<template>
  <AppLayout>
    <div class="space-y-6">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-foreground">Machines</h1>
          <p class="text-muted-foreground">Monitor and manage your production machines</p>
        </div>
        <Button class="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600">
          + Add Machine
        </Button>
      </div>

      <div class="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        <Card v-for="machine in machines" :key="machine.id" class="hover:shadow-lg transition-shadow">
          <CardHeader class="flex flex-row justify-between gap-4">
            <div>
              <CardTitle class="text-lg">{{ machine.name }}</CardTitle>
              <span class="text-sm text-muted-foreground">{{ machine.type }}</span>
            </div>
            <Badge :class="statusClasses[machine.status]">
              {{ capitalize(machine.status) }}
            </Badge>
          </CardHeader>

          <CardContent class="space-y-4">
            <div class="space-y-2">
              <div class="flex items-center justify-between text-sm">
                <span class="text-muted-foreground">OEE</span>
                <span class="font-semibold text-foreground">{{ machine.oee }}%</span>
              </div>
              <div class="h-2 w-full rounded-full bg-muted">
                <div
                    class="h-2 rounded-full transition-all"
                    :class="getOeeColor(machine.oee)"
                    :style="{ width: machine.oee + '%' }"
                />
              </div>
            </div>

            <div class="grid grid-cols-3 gap-2 pt-2">
              <div class="text-center">
                <div class="mb-1 text-xs text-muted-foreground">Availability</div>
                <div class="text-sm font-semibold text-foreground">{{ machine.availability }}%</div>
              </div>
              <div class="text-center">
                <div class="mb-1 text-xs text-muted-foreground">Performance</div>
                <div class="text-sm font-semibold text-foreground">{{ machine.performance }}%</div>
              </div>
              <div class="text-center">
                <div class="mb-1 text-xs text-muted-foreground">Quality</div>
                <div class="text-sm font-semibold text-foreground">{{ machine.quality }}%</div>
              </div>
            </div>
          </CardContent>

          <CardFooter class="flex gap-2 border-t pt-4">
            <Button variant="outline" size="sm" class="flex-1" @click="viewDetails(machine.id)">
              View Details
            </Button>
            <Button variant="outline" size="sm" class="flex-1" @click="viewSettings(machine.id)">
              Settings
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
</style>