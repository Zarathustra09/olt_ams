<script setup lang="ts">
import AppLayout from '@/layouts/AppLayout.vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Search, Download, CalendarIcon, Filter } from 'lucide-vue-next'
import { ref } from 'vue'

const activityLogs = ref([
  { id: 1, timestamp: '2024-01-15 14:32:15', user: 'John Doe', action: 'Machine Started', machine: 'Machine A1', type: 'operation', status: 'success' },
  { id: 2, timestamp: '2024-01-15 14:28:42', user: 'Jane Smith', action: 'Quality Check Failed', machine: 'Machine B2', type: 'quality', status: 'warning' },
  { id: 3, timestamp: '2024-01-15 14:15:10', user: 'System', action: 'Maintenance Completed', machine: 'Machine C3', type: 'maintenance', status: 'success' },
  { id: 4, timestamp: '2024-01-15 14:05:33', user: 'Bob Johnson', action: 'Emergency Stop', machine: 'Machine A1', type: 'safety', status: 'error' },
  { id: 5, timestamp: '2024-01-15 13:58:21', user: 'Alice Brown', action: 'Production Started', machine: 'Machine D4', type: 'operation', status: 'success' },
  { id: 6, timestamp: '2024-01-15 13:45:12', user: 'System', action: 'OEE Report Generated', machine: 'All', type: 'report', status: 'info' },
  { id: 7, timestamp: '2024-01-15 13:30:45', user: 'John Doe', action: 'Settings Updated', machine: 'Machine B2', type: 'configuration', status: 'success' },
])

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'success': return 'default'
    case 'warning': return 'secondary'
    case 'error': return 'destructive'
    case 'info': return 'outline'
    default: return 'outline'
  }
}

const getTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    operation: 'text-blue-500',
    quality: 'text-purple-500',
    maintenance: 'text-green-500',
    safety: 'text-red-500',
    report: 'text-yellow-500',
    configuration: 'text-gray-500',
  }
  return colors[type] || 'text-gray-500'
}

const date = ref<Date>()
</script>

<template>
  <AppLayout>
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold">Activity Logs</h1>
          <p class="text-muted-foreground">View comprehensive activity logs for equipment and operations</p>
        </div>
        <Button>
          <Download class="mr-2 h-4 w-4" />
          Export Logs
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter Logs</CardTitle>
          <CardDescription>Search and filter activity logs by various criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="flex gap-4">
            <div class="relative flex-1">
              <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search logs..." class="pl-9" />
            </div>
            <Select>
              <SelectTrigger class="w-[180px]">
                <SelectValue placeholder="Action Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="operation">Operation</SelectItem>
                <SelectItem value="quality">Quality</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="safety">Safety</SelectItem>
                <SelectItem value="report">Report</SelectItem>
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger as-child>
                <Button variant="outline" class="w-[180px] justify-start text-left font-normal">
                  <CalendarIcon class="mr-2 h-4 w-4" />
                  {{ date ? date.toLocaleDateString() : 'Pick a date' }}
                </Button>
              </PopoverTrigger>
              <PopoverContent class="w-auto p-0">
                <Calendar v-model="date" />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest activity logs from all machines</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Machine</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="log in activityLogs" :key="log.id">
                <TableCell class="font-mono text-sm">{{ log.timestamp }}</TableCell>
                <TableCell>{{ log.user }}</TableCell>
                <TableCell class="font-medium">{{ log.action }}</TableCell>
                <TableCell>{{ log.machine }}</TableCell>
                <TableCell>
                  <span :class="getTypeColor(log.type)" class="capitalize font-medium">
                    {{ log.type }}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge :variant="getStatusVariant(log.status)" class="capitalize">
                    {{ log.status }}
                  </Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <div class="flex items-center justify-between pt-4">
            <p class="text-sm text-muted-foreground">Showing 1-7 of 247 logs</p>
            <div class="flex gap-2">
              <Button variant="outline" size="sm" disabled>Previous</Button>
              <Button variant="outline" size="sm">Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </AppLayout>
</template>
