<script setup lang="ts">
import { ref } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Activity, Clock, AlertCircle, CheckCircle2 } from 'lucide-vue-next'

const selectedPeriod = ref('week')

const metrics = [
  {
    title: 'Total Production',
    value: '12,547',
    change: '+12.5%',
    trend: 'up',
    icon: Activity,
    description: 'Units produced'
  },
  {
    title: 'Average OEE',
    value: '78.3%',
    change: '+5.2%',
    trend: 'up',
    icon: TrendingUp,
    description: 'Overall efficiency'
  },
  {
    title: 'Downtime',
    value: '4.2h',
    change: '-18.7%',
    trend: 'up',
    icon: Clock,
    description: 'This week'
  },
  {
    title: 'Quality Rate',
    value: '96.8%',
    change: '+2.1%',
    trend: 'up',
    icon: CheckCircle2,
    description: 'Defect-free units'
  },
]

const machinePerformance = [
  { name: 'Machine A', oee: 85.2, availability: 92.1, performance: 89.5, quality: 97.8, status: 'excellent' },
  { name: 'Machine B', oee: 78.4, availability: 88.3, performance: 82.7, quality: 96.2, status: 'good' },
  { name: 'Machine C', oee: 72.1, availability: 79.5, performance: 85.4, quality: 94.8, status: 'good' },
  { name: 'Machine D', oee: 65.8, availability: 75.2, performance: 78.9, quality: 92.5, status: 'warning' },
  { name: 'Machine E', oee: 58.3, availability: 68.7, performance: 74.2, quality: 90.1, status: 'critical' },
]

const topIssues = [
  { issue: 'Material shortage', occurrences: 23, downtime: '3.2h', severity: 'high' },
  { issue: 'Tool wear', occurrences: 18, downtime: '2.1h', severity: 'medium' },
  { issue: 'Quality checks', occurrences: 15, downtime: '1.8h', severity: 'low' },
  { issue: 'Operator changeover', occurrences: 12, downtime: '1.5h', severity: 'medium' },
  { issue: 'Maintenance', occurrences: 8, downtime: '0.9h', severity: 'low' },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'excellent': return 'bg-green-500'
    case 'good': return 'bg-blue-500'
    case 'warning': return 'bg-yellow-500'
    case 'critical': return 'bg-red-500'
    default: return 'bg-gray-500'
  }
}

const getSeverityVariant = (severity: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (severity) {
    case 'high': return 'destructive'
    case 'medium': return 'default'
    case 'low': return 'secondary'
    default: return 'outline'
  }
}
</script>

<template>
  <AppLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold tracking-tight">Analytics</h1>
          <p class="text-muted-foreground">Monitor production metrics and performance insights</p>
        </div>
        <div class="flex gap-2">
          <Select v-model="selectedPeriod">
            <SelectTrigger class="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Last 24 hours</SelectItem>
              <SelectItem value="week">Last 7 days</SelectItem>
              <SelectItem value="month">Last 30 days</SelectItem>
              <SelectItem value="quarter">Last quarter</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">Export Report</Button>
        </div>
      </div>

      <!-- Key Metrics -->
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card v-for="metric in metrics" :key="metric.title">
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">{{ metric.title }}</CardTitle>
            <component :is="metric.icon" class="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">{{ metric.value }}</div>
            <p class="text-xs text-muted-foreground">{{ metric.description }}</p>
            <div class="flex items-center gap-1 mt-2">
              <component :is="metric.trend === 'up' ? TrendingUp : TrendingDown"
                :class="['h-3 w-3', metric.trend === 'up' ? 'text-green-500' : 'text-red-500']" />
              <span :class="['text-xs font-medium', metric.trend === 'up' ? 'text-green-500' : 'text-red-500']">
                {{ metric.change }}
              </span>
              <span class="text-xs text-muted-foreground">from last period</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Detailed Analytics Tabs -->
      <Tabs default-value="machines" class="space-y-4">
        <TabsList>
          <TabsTrigger value="machines">Machine Performance</TabsTrigger>
          <TabsTrigger value="issues">Top Issues</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="machines" class="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Machine Performance Overview</CardTitle>
              <CardDescription>OEE metrics across all production machines</CardDescription>
            </CardHeader>
            <CardContent>
              <div class="space-y-4">
                <div v-for="machine in machinePerformance" :key="machine.name" class="space-y-2">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <div :class="['w-2 h-2 rounded-full', getStatusColor(machine.status)]"></div>
                      <span class="font-medium">{{ machine.name }}</span>
                      <Badge variant="outline">OEE: {{ machine.oee }}%</Badge>
                    </div>
                    <Button variant="ghost" size="sm">View Details</Button>
                  </div>
                  <div class="grid grid-cols-3 gap-4 pl-5">
                    <div>
                      <div class="text-xs text-muted-foreground">Availability</div>
                      <div class="flex items-center gap-2">
                        <div class="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                          <div class="h-full bg-green-500" :style="{ width: machine.availability + '%' }"></div>
                        </div>
                        <span class="text-xs font-medium">{{ machine.availability }}%</span>
                      </div>
                    </div>
                    <div>
                      <div class="text-xs text-muted-foreground">Performance</div>
                      <div class="flex items-center gap-2">
                        <div class="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                          <div class="h-full bg-blue-500" :style="{ width: machine.performance + '%' }"></div>
                        </div>
                        <span class="text-xs font-medium">{{ machine.performance }}%</span>
                      </div>
                    </div>
                    <div>
                      <div class="text-xs text-muted-foreground">Quality</div>
                      <div class="flex items-center gap-2">
                        <div class="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                          <div class="h-full bg-purple-500" :style="{ width: machine.quality + '%' }"></div>
                        </div>
                        <span class="text-xs font-medium">{{ machine.quality }}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="issues" class="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Issues Affecting Production</CardTitle>
              <CardDescription>Most frequent problems causing downtime</CardDescription>
            </CardHeader>
            <CardContent>
              <div class="space-y-3">
                <div v-for="(issue, index) in topIssues" :key="issue.issue"
                  class="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors">
                  <div class="flex items-center gap-4 flex-1">
                    <div class="flex items-center justify-center w-8 h-8 rounded-full bg-muted font-semibold text-sm">
                      {{ index + 1 }}
                    </div>
                    <div class="flex-1">
                      <div class="font-medium">{{ issue.issue }}</div>
                      <div class="text-sm text-muted-foreground">{{ issue.occurrences }} occurrences</div>
                    </div>
                  </div>
                  <div class="flex items-center gap-4">
                    <div class="text-right">
                      <div class="font-semibold">{{ issue.downtime }}</div>
                      <div class="text-xs text-muted-foreground">Total downtime</div>
                    </div>
                    <Badge :variant="getSeverityVariant(issue.severity)">
                      {{ issue.severity }}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" class="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Production Trends</CardTitle>
              <CardDescription>Historical performance data and forecasts</CardDescription>
            </CardHeader>
            <CardContent>
              <div class="h-[300px] flex items-center justify-center border-2 border-dashed rounded-lg">
                <div class="text-center text-muted-foreground">
                  <Activity class="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Chart visualization coming soon</p>
                  <p class="text-sm">Integrate with charting library for detailed trends</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  </AppLayout>
</template>

