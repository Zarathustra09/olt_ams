<script setup lang="ts">
import { ref } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

const selectedTab = ref('OFE overview')
const tabs = ['OFE overview', 'Error analysis', 'Analysis of sub-assets']

const gauges = [
  { label: 'OEE', value: 18.34, previousValue: '15.25' },
  { label: 'Availability', value: 88.23, previousValue: '88.1' },
  { label: 'Performance', value: 23.46, previousValue: '15.77' },
  { label: 'Quality', value: 95.24, previousValue: '85.24' }
]

const getGaugeColor = (value: number) => {
  if (value >= 85) return '#22c55e'
  if (value >= 60) return '#fbbf24'
  return '#ef4444'
}

const getNeedleRotation = (value: number) => {
  const angle = (value / 100) * 180 - 90
  return `rotate(${angle} 100 100)`
}

const getGaugeArc = (value: number) => {
  const percentage = value / 100
  const angle = percentage * 180
  const radians = (angle - 90) * (Math.PI / 180)
  const x = 100 + 80 * Math.cos(radians)
  const y = 100 + 80 * Math.sin(radians)
  const largeArc = angle > 90 ? 1 : 0
  return `M 20 100 A 80 80 0 ${largeArc} 1 ${x} ${y}`
}

const otherKPIs = [
  { label: 'TEEP', value: '17.49% / 11.57%', trend: 'down' },
  { label: 'MTTR', value: '1,080sec / 1.285.71sec', trend: 'up' },
  { label: 'MTBF', value: '8,951.8sec / 9,814.29sec', trend: 'up' }
]

const timelineSegments = [
  { type: 'running', width: 12 },
  { type: 'gray', width: 3 },
  { type: 'running', width: 18 },
  { type: 'gray', width: 2 },
  { type: 'running', width: 10 },
  { type: 'yellow', width: 2 },
  { type: 'running', width: 15 },
  { type: 'yellow', width: 5 },
  { type: 'running', width: 8 },
  { type: 'black', width: 3 },
  { type: 'yellow2', width: 5 },
  { type: 'gray', width: 2 },
  { type: 'running', width: 15 }
]

const machineStatuses = [
  { label: 'Running', color: 'green', segments: [
      { type: 'running', left: 0, width: 12 },
      { type: 'running', left: 15, width: 18 },
      { type: 'running', left: 35, width: 10 },
      { type: 'running', left: 47, width: 15 },
      { type: 'running', left: 70, width: 8 },
      { type: 'running', left: 85, width: 15 }
    ]},
  { label: 'Production...', color: 'gray', segments: [{ type: 'gray', left: 12, width: 3 }] },
  { label: 'Startup rej..', color: 'black', segments: [{ type: 'black', left: 78, width: 3 }, { type: 'black', left: 95, width: 3 }] },
  { label: 'Slow cycles', color: 'yellow', segments: [{ type: 'yellow', left: 45, width: 2 }, { type: 'yellow', left: 81, width: 4 }] },
  { label: 'Planned stop', color: 'yellow2', segments: [{ type: 'yellow2', left: 62, width: 5 }, { type: 'yellow2', left: 88, width: 3 }] }
]

const distribution = [
  { label: 'Running', color: 'green', count: '0 20.00', time: '12:00 00', occurrences: '2' },
  { label: 'Slow cycles', color: 'lime', count: '1 00.00', time: '0:00 00', occurrences: '3' },
  { label: 'Small stop', color: 'black', count: '1 00.00', time: '1:00 00', occurrences: '3' },
  { label: 'Planned stop', color: 'yellow', time: '' }
]
</script>

<template>
  <AppLayout>
    <div class="dashboard">
      <!-- Header -->
      <div class="header">
        <div class="header-left">
          <h1 class="page-title">OEE</h1>
          <Tabs v-model="selectedTab">
            <TabsList>
              <TabsTrigger v-for="tab in tabs" :key="tab" :value="tab">
                {{ tab }}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div class="header-right">
          <span class="date-time">3/16/23<br>12:00 AM</span>
          <span class="date-time">3/17/3<br>12:00 AM</span>
          <Button variant="outline" size="icon">□</Button>
        </div>
      </div>

      <div class="details-link">⟲ Details</div>

      <!-- Main Content -->
      <div class="content">
        <!-- Gauges Section -->
        <div class="gauges-container">
          <Card v-for="gauge in gauges" :key="gauge.label">
            <CardHeader>
              <CardTitle class="text-base">{{ gauge.label }}</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="gauge-wrapper">
                <svg viewBox="0 0 200 120" class="gauge-svg">
                  <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="hsl(var(--muted-foreground) / 0.2)" stroke-width="10" stroke-linecap="round" />
                  <path d="M 20 100 A 80 80 0 0 1 60 36" fill="none" stroke="#ef4444" stroke-width="10" stroke-linecap="round" />
                  <path d="M 60 36 A 80 80 0 0 1 140 36" fill="none" stroke="#fbbf24" stroke-width="10" stroke-linecap="round" />
                  <path d="M 140 36 A 80 80 0 0 1 180 100" fill="none" stroke="#22c55e" stroke-width="10" stroke-linecap="round" />
                  <path :d="getGaugeArc(gauge.value)" fill="none" :stroke="getGaugeColor(gauge.value)" stroke-width="10" stroke-linecap="round" />
                  <circle cx="100" cy="100" r="5" fill="hsl(var(--muted-foreground))" />
                  <line x1="100" y1="100" x2="100" y2="30" stroke="hsl(var(--foreground))" stroke-width="3" :transform="getNeedleRotation(gauge.value)" stroke-linecap="round" />
                </svg>
                <div class="gauge-value">
                  <div class="value-number">{{ gauge.value.toFixed(2) }}</div>
                  <div class="value-unit">%</div>
                </div>
                <div class="gauge-labels">
                  <span>0</span>
                  <span>100</span>
                </div>
              </div>
              <div class="gauge-chart">
                <svg viewBox="0 0 200 40" class="sparkline">
                  <defs>
                    <linearGradient :id="'gradient-' + gauge.label" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" :style="{stopColor: getGaugeColor(gauge.value), stopOpacity: 0.3}" />
                      <stop offset="100%" :style="{stopColor: getGaugeColor(gauge.value), stopOpacity: 0.05}" />
                    </linearGradient>
                  </defs>
                  <path d="M 0,25 L 20,22 L 40,28 L 60,20 L 80,24 L 100,18 L 120,22 L 140,20 L 160,24 L 180,22 L 200,25" fill="none" :stroke="getGaugeColor(gauge.value)" stroke-width="2" />
                  <path d="M 0,25 L 20,22 L 40,28 L 60,20 L 80,24 L 100,18 L 120,22 L 140,20 L 160,24 L 180,22 L 200,25 L 200,40 L 0,40 Z" :fill="'url(#gradient-' + gauge.label + ')'" />
                </svg>
              </div>
              <div class="previous-period">
                <span class="period-label">Previous period</span>
                <span class="period-value">{{ gauge.previousValue }} %</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Other KPIs -->
        <Card class="other-kpis">
          <CardHeader>
            <div class="kpi-header">
              <CardTitle class="text-base">Other KPIs</CardTitle>
              <span class="kpi-period">Current previous period</span>
            </div>
          </CardHeader>
          <CardContent>
            <div class="kpi-list">
              <div v-for="kpi in otherKPIs" :key="kpi.label" class="kpi-item">
                <div class="kpi-left">
                  <span :class="['kpi-icon', kpi.trend]">{{ kpi.trend === 'down' ? '●' : '↗' }}</span>
                  <span class="kpi-label">{{ kpi.label }}</span>
                </div>
                <div class="kpi-values">{{ kpi.value }}</div>
              </div>
            </div>
            <div class="kpi-footer">
              <Button variant="outline" size="sm" class="flex-1">📊 Details</Button>
              <Button variant="outline" size="sm" class="flex-1">✏ Change machintat</Button>
            </div>
            <div class="microstop-info">
              <span class="microstop-label">⏱ Microstop duration</span>
              <div class="microstop-value">500 00m 00s</div>
              <div class="microstop-events">
                <span class="event-number">0</span>
                <span class="event-label">Microstop events<br>0</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Machine Status -->
      <Card class="mb-5">
        <CardHeader>
          <div class="status-header">
            <CardTitle class="text-base">Machine status</CardTitle>
            <span class="status-subtitle">Machine status for current data</span>
            <div class="status-clock">⏱</div>
          </div>
        </CardHeader>
        <CardContent>
          <div class="timeline-container">
            <div class="timeline-row">
              <span class="timeline-label">Overview</span>
              <div class="timeline-bar">
                <div v-for="(segment, i) in timelineSegments" :key="i" :class="['segment', segment.type]" :style="{ width: segment.width + '%' }"></div>
              </div>
              <div class="timeline-actions">
                <Button variant="outline" size="icon">⟲</Button>
                <Button variant="outline" size="icon">🗑</Button>
              </div>
            </div>

            <div v-for="status in machineStatuses" :key="status.label" class="timeline-row">
              <span class="timeline-label">
                <span :class="['status-dot', status.color]"></span>
                {{ status.label }}
              </span>
              <div class="timeline-bar">
                <div v-for="(seg, i) in status.segments" :key="i" :class="['segment', seg.type]" :style="{ left: seg.left + '%', width: seg.width + '%' }"></div>
              </div>
            </div>

            <div class="timeline-scale">
              <span>8/18</span>
              <span>2.00</span>
              <span>8.00</span>
              <span>8.00</span>
              <span>10.00</span>
              <span>12.00</span>
              <span>14.00</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Distribution -->
      <Card>
        <CardHeader>
          <div class="dist-header">
            <CardTitle class="text-base">Distribution</CardTitle>
            <div class="dist-actions">
              <Button variant="outline" size="icon">⟲</Button>
              <Button variant="outline" size="icon">🗑</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div class="dist-chart">
            <div class="dist-bar running"></div>
            <div class="dist-bar gray"></div>
          </div>
          <div class="dist-list">
            <div v-for="item in distribution" :key="item.label" class="dist-item">
              <span :class="['dist-dot', item.color]"></span>
              <span class="dist-label">{{ item.label }}</span>
              <span v-if="item.count" class="dist-count">{{ item.count }}</span>
              <span class="dist-time">{{ item.time }}</span>
              <span v-if="item.occurrences" class="dist-occ">{{ item.occurrences }} Colvrences</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </AppLayout>
</template>

<style scoped>
.dashboard {
  min-height: 100vh;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 30px;
}

.page-title {
  font-size: 28px;
  font-weight: bold;
  color: hsl(var(--foreground));
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.date-time {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  text-align: center;
  line-height: 1.4;
}

.details-link {
  text-align: right;
  color: #059669;
  font-size: 14px;
  margin-bottom: 10px;
  cursor: pointer;
}

.details-link:hover {
  color: #047857;
}

.content {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.gauges-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  flex: 1;
}

.gauge-wrapper {
  position: relative;
  margin-bottom: 10px;
}

.gauge-svg {
  width: 100%;
  height: auto;
}

.gauge-value {
  position: absolute;
  top: 60%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.value-number {
  font-size: 32px;
  font-weight: bold;
  color: hsl(var(--foreground));
  line-height: 1;
}

.value-unit {
  font-size: 14px;
  color: hsl(var(--muted-foreground));
}

.gauge-labels {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: hsl(var(--muted-foreground));
  padding: 0 5px;
}

.gauge-chart {
  height: 50px;
  margin: 15px 0;
}

.sparkline {
  width: 100%;
  height: 100%;
}

.previous-period {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 13px;
}

.period-label {
  color: hsl(var(--muted-foreground));
}

.period-value {
  color: hsl(var(--foreground));
  font-weight: 600;
}

.other-kpis {
  width: 280px;
}

.kpi-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.kpi-period {
  font-size: 11px;
  color: hsl(var(--muted-foreground));
}

.kpi-list {
  border-top: 1px solid hsl(var(--border));
}

.kpi-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid hsl(var(--border));
}

.kpi-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.kpi-icon {
  font-size: 14px;
}

.kpi-icon.up {
  color: #22c55e;
}

.kpi-icon.down {
  color: hsl(var(--muted-foreground));
}

.kpi-label {
  font-size: 14px;
  font-weight: 500;
  color: hsl(var(--foreground));
}

.kpi-values {
  font-size: 13px;
  font-weight: 600;
  color: hsl(var(--foreground));
  text-align: right;
}

.kpi-footer {
  display: flex;
  gap: 10px;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid hsl(var(--border));
}

.microstop-info {
  margin-top: 15px;
  padding: 12px;
  background: hsl(var(--muted) / 0.5);
  border-radius: 4px;
  font-size: 12px;
}

.microstop-label {
  color: hsl(var(--muted-foreground));
  display: block;
  margin-bottom: 5px;
}

.microstop-value {
  font-size: 16px;
  font-weight: 600;
  color: hsl(var(--foreground));
  margin-bottom: 8px;
}

.microstop-events {
  display: flex;
  align-items: center;
  gap: 10px;
}

.event-number {
  font-size: 24px;
  font-weight: bold;
  color: hsl(var(--foreground));
}

.event-label {
  font-size: 11px;
  color: hsl(var(--muted-foreground));
  line-height: 1.3;
}

.status-header {
  display: flex;
  align-items: center;
  gap: 15px;
  width: 100%;
}

.status-subtitle {
  font-size: 14px;
  color: hsl(var(--muted-foreground));
}

.status-clock {
  margin-left: auto;
  font-size: 18px;
}

.timeline-container {
  position: relative;
}

.timeline-row {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 10px;
}

.timeline-label {
  width: 120px;
  font-size: 13px;
  color: hsl(var(--muted-foreground));
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.status-dot.green { background: #22c55e; }
.status-dot.gray { background: hsl(var(--muted-foreground)); }
.status-dot.black { background: hsl(var(--foreground)); }
.status-dot.yellow { background: #fbbf24; }
.status-dot.yellow2 { background: #eab308; }

.timeline-bar {
  flex: 1;
  height: 32px;
  background: hsl(var(--muted));
  border-radius: 4px;
  display: flex;
  position: relative;
  overflow: hidden;
}

.segment {
  height: 100%;
  position: relative;
}

.segment.running { background: #22c55e; }
.segment.gray { background: hsl(var(--muted-foreground)); }
.segment.black { background: hsl(var(--foreground)); }
.segment.yellow { background: #fbbf24; }
.segment.yellow2 { background: #eab308; }

.timeline-actions {
  display: flex;
  gap: 5px;
}

.timeline-scale {
  display: flex;
  justify-content: space-between;
  margin-left: 135px;
  margin-top: 10px;
  font-size: 11px;
  color: hsl(var(--muted-foreground));
  padding-right: 85px;
}

.dist-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.dist-actions {
  display: flex;
  gap: 5px;
}

.dist-chart {
  height: 80px;
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.dist-bar {
  flex: 1;
  border-radius: 4px;
}

.dist-bar.running {
  background: linear-gradient(to right, #22c55e 70%, hsl(var(--muted)) 70%);
}

.dist-bar.gray {
  background: hsl(var(--muted));
}

.dist-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dist-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
}

.dist-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dist-dot.green { background: #22c55e; }
.dist-dot.lime { background: #84cc16; }
.dist-dot.black { background: hsl(var(--foreground)); }
.dist-dot.yellow { background: #eab308; }

.dist-label {
  color: hsl(var(--foreground));
  font-weight: 500;
  min-width: 90px;
}

.dist-count {
  color: hsl(var(--muted-foreground));
  font-size: 12px;
}

.dist-time {
  color: hsl(var(--foreground));
  font-weight: 600;
}

.dist-occ {
  color: hsl(var(--muted-foreground));
  font-size: 12px;
  margin-left: auto;
}
</style>
