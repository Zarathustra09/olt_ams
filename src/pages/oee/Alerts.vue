<script setup lang="ts">
import AppLayout from '@/layouts/AppLayout.vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Bell, AlertTriangle, CheckCircle, XCircle, Search, Filter } from 'lucide-vue-next'
import { ref } from 'vue'

const alerts = ref([
  { id: 1, title: 'Machine A1 - Performance Drop', description: 'Performance efficiency below 75%', severity: 'high', status: 'active', time: '5 min ago', machine: 'Machine A1' },
  { id: 2, title: 'Machine B2 - Quality Issue', description: 'Defect rate increased to 8%', severity: 'critical', status: 'active', time: '12 min ago', machine: 'Machine B2' },
  { id: 3, title: 'Machine C3 - Maintenance Required', description: 'Scheduled maintenance due', severity: 'medium', status: 'pending', time: '1 hour ago', machine: 'Machine C3' },
  { id: 4, title: 'Machine A1 - Downtime Alert', description: 'Unexpected downtime detected', severity: 'high', status: 'resolved', time: '2 hours ago', machine: 'Machine A1' },
])

const getSeverityVariant = (severity: string) => {
  switch (severity) {
    case 'critical': return 'destructive'
    case 'high': return 'default'
    case 'medium': return 'secondary'
    default: return 'outline'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'active': return AlertTriangle
    case 'resolved': return CheckCircle
    case 'pending': return Bell
    default: return XCircle
  }
}
</script>

<template>
  <AppLayout>
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold">OEE Alerts</h1>
          <p class="text-muted-foreground">Monitor and manage equipment effectiveness alerts and notifications</p>
        </div>
        <Button>
          <Bell class="mr-2 h-4 w-4" />
          Configure Alerts
        </Button>
      </div>

      <div class="flex gap-4">
        <div class="relative flex-1">
          <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search alerts..." class="pl-9" />
        </div>
        <Select>
          <SelectTrigger class="w-[180px]">
            <Filter class="mr-2 h-4 w-4" />
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severities</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger class="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="grid gap-4">
        <Card v-for="alert in alerts" :key="alert.id">
          <CardHeader>
            <div class="flex items-start justify-between">
              <div class="flex items-start gap-3">
                <component :is="getStatusIcon(alert.status)" class="h-5 w-5 mt-0.5" :class="{
                  'text-destructive': alert.status === 'active',
                  'text-green-500': alert.status === 'resolved',
                  'text-yellow-500': alert.status === 'pending'
                }" />
                <div class="space-y-1">
                  <CardTitle class="text-lg">{{ alert.title }}</CardTitle>
                  <CardDescription>{{ alert.description }}</CardDescription>
                </div>
              </div>
              <Badge :variant="getSeverityVariant(alert.severity)">{{ alert.severity }}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div class="flex items-center justify-between">
              <div class="flex gap-4 text-sm text-muted-foreground">
                <span>{{ alert.machine }}</span>
                <Separator orientation="vertical" class="h-4" />
                <span>{{ alert.time }}</span>
              </div>
              <div class="flex gap-2">
                <Button variant="outline" size="sm">View Details</Button>
                <Button variant="outline" size="sm" v-if="alert.status !== 'resolved'">Acknowledge</Button>
                <Button variant="outline" size="sm" v-if="alert.status === 'active'">Resolve</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </AppLayout>
</template>
