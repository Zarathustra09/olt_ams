<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ArrowLeft, AlertTriangle, Settings as SettingsIcon, Bell, Shield } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const machineId = computed(() => route.params.id)

const settings = ref({
  name: 'CNC Machine 01',
  type: 'CNC Mill',
  location: 'Production Floor A',
  manufacturer: 'HAAS Automation',
  model: 'VF-2SS',
  serialNumber: 'SN-2024-001',
  targetOEE: 85,
  targetCycleTime: 2.3,
  maxTemperature: 80,
  notifications: {
    emailAlerts: true,
    smsAlerts: false,
    downtime: true,
    maintenance: true,
    qualityIssues: true,
  },
  maintenance: {
    interval: 'monthly',
    lastMaintenance: '2024-03-10',
    nextMaintenance: '2024-04-10',
    autoSchedule: true,
  },
  operationalLimits: {
    maxSpeed: 8000,
    maxFeedRate: 500,
    maxLoad: 75,
  }
})

const goBack = () => {
  router.push('/machines')
}

const saveSettings = () => {
  // Simulate saving settings
  alert('Settings saved successfully!')
}

const resetToDefaults = () => {
  if (confirm('Are you sure you want to reset all settings to defaults?')) {
    alert('Settings reset to defaults')
  }
}
</script>

<template>
  <AppLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center gap-4">
        <Button variant="ghost" size="icon" @click="goBack">
          <ArrowLeft class="h-4 w-4" />
        </Button>
        <div class="flex-1">
          <h1 class="text-3xl font-bold text-foreground">Machine Settings</h1>
          <p class="text-muted-foreground">Configure {{ settings.name }}</p>
        </div>
        <Button variant="outline" @click="resetToDefaults">Reset to Defaults</Button>
        <Button @click="saveSettings">Save Changes</Button>
      </div>

      <Tabs default-value="general" class="space-y-4">
        <TabsList>
          <TabsTrigger value="general">
            <SettingsIcon class="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell class="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="maintenance">
            <Shield class="h-4 w-4 mr-2" />
            Maintenance
          </TabsTrigger>
          <TabsTrigger value="operational">
            <AlertTriangle class="h-4 w-4 mr-2" />
            Operational Limits
          </TabsTrigger>
        </TabsList>

        <!-- General Settings -->
        <TabsContent value="general" class="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Configure machine identification and details</CardDescription>
            </CardHeader>
            <CardContent class="space-y-6">
              <div class="grid gap-6 md:grid-cols-2">
                <div class="space-y-2">
                  <Label htmlFor="name">Machine Name</Label>
                  <Input id="name" v-model="settings.name" />
                </div>
                <div class="space-y-2">
                  <Label htmlFor="type">Machine Type</Label>
                  <Input id="type" v-model="settings.type" />
                </div>
                <div class="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" v-model="settings.location" />
                </div>
                <div class="space-y-2">
                  <Label htmlFor="manufacturer">Manufacturer</Label>
                  <Input id="manufacturer" v-model="settings.manufacturer" />
                </div>
                <div class="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input id="model" v-model="settings.model" />
                </div>
                <div class="space-y-2">
                  <Label htmlFor="serialNumber">Serial Number</Label>
                  <Input id="serialNumber" v-model="settings.serialNumber" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Targets</CardTitle>
              <CardDescription>Set target metrics for optimal performance</CardDescription>
            </CardHeader>
            <CardContent class="space-y-6">
              <div class="grid gap-6 md:grid-cols-3">
                <div class="space-y-2">
                  <Label htmlFor="targetOEE">Target OEE (%)</Label>
                  <Input id="targetOEE" type="number" v-model="settings.targetOEE" min="0" max="100" />
                </div>
                <div class="space-y-2">
                  <Label htmlFor="targetCycleTime">Target Cycle Time (min)</Label>
                  <Input id="targetCycleTime" type="number" step="0.1" v-model="settings.targetCycleTime" />
                </div>
                <div class="space-y-2">
                  <Label htmlFor="maxTemperature">Max Temperature (°C)</Label>
                  <Input id="maxTemperature" type="number" v-model="settings.maxTemperature" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <!-- Notifications Settings -->
        <TabsContent value="notifications" class="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alert Preferences</CardTitle>
              <CardDescription>Choose how and when you want to be notified</CardDescription>
            </CardHeader>
            <CardContent class="space-y-6">
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div class="space-y-0.5">
                    <Label>Email Alerts</Label>
                    <div class="text-sm text-muted-foreground">
                      Receive notifications via email
                    </div>
                  </div>
                  <Switch v-model:checked="settings.notifications.emailAlerts" />
                </div>
                <Separator />
                <div class="flex items-center justify-between">
                  <div class="space-y-0.5">
                    <Label>SMS Alerts</Label>
                    <div class="text-sm text-muted-foreground">
                      Receive critical alerts via text message
                    </div>
                  </div>
                  <Switch v-model:checked="settings.notifications.smsAlerts" />
                </div>
                <Separator />
                <div class="flex items-center justify-between">
                  <div class="space-y-0.5">
                    <Label>Downtime Notifications</Label>
                    <div class="text-sm text-muted-foreground">
                      Alert when machine goes offline
                    </div>
                  </div>
                  <Switch v-model:checked="settings.notifications.downtime" />
                </div>
                <Separator />
                <div class="flex items-center justify-between">
                  <div class="space-y-0.5">
                    <Label>Maintenance Reminders</Label>
                    <div class="text-sm text-muted-foreground">
                      Notify before scheduled maintenance
                    </div>
                  </div>
                  <Switch v-model:checked="settings.notifications.maintenance" />
                </div>
                <Separator />
                <div class="flex items-center justify-between">
                  <div class="space-y-0.5">
                    <Label>Quality Issue Alerts</Label>
                    <div class="text-sm text-muted-foreground">
                      Alert on quality threshold violations
                    </div>
                  </div>
                  <Switch v-model:checked="settings.notifications.qualityIssues" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <!-- Maintenance Settings -->
        <TabsContent value="maintenance" class="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Schedule</CardTitle>
              <CardDescription>Configure maintenance intervals and scheduling</CardDescription>
            </CardHeader>
            <CardContent class="space-y-6">
              <div class="grid gap-6 md:grid-cols-2">
                <div class="space-y-2">
                  <Label htmlFor="interval">Maintenance Interval</Label>
                  <Select v-model="settings.maintenance.interval">
                    <SelectTrigger id="interval">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Bi-weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div class="space-y-2">
                  <Label htmlFor="lastMaintenance">Last Maintenance</Label>
                  <Input id="lastMaintenance" type="date" v-model="settings.maintenance.lastMaintenance" />
                </div>
                <div class="space-y-2">
                  <Label htmlFor="nextMaintenance">Next Maintenance</Label>
                  <Input id="nextMaintenance" type="date" v-model="settings.maintenance.nextMaintenance" />
                </div>
              </div>

              <Separator />

              <div class="flex items-center justify-between">
                <div class="space-y-0.5">
                  <Label>Auto-Schedule Maintenance</Label>
                  <div class="text-sm text-muted-foreground">
                    Automatically schedule maintenance based on usage
                  </div>
                </div>
                <Switch v-model:checked="settings.maintenance.autoSchedule" />
              </div>

              <Alert>
                <AlertTriangle class="h-4 w-4" />
                <AlertTitle>Maintenance Due Soon</AlertTitle>
                <AlertDescription>
                  Next scheduled maintenance is in 15 days. Please ensure all necessary parts and tools are available.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <!-- Operational Limits -->
        <TabsContent value="operational" class="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Operational Limits</CardTitle>
              <CardDescription>Set safety and performance limits</CardDescription>
            </CardHeader>
            <CardContent class="space-y-6">
              <div class="grid gap-6 md:grid-cols-3">
                <div class="space-y-2">
                  <Label htmlFor="maxSpeed">Max Speed (RPM)</Label>
                  <Input id="maxSpeed" type="number" v-model="settings.operationalLimits.maxSpeed" />
                  <p class="text-xs text-muted-foreground">Maximum spindle speed</p>
                </div>
                <div class="space-y-2">
                  <Label htmlFor="maxFeedRate">Max Feed Rate (mm/min)</Label>
                  <Input id="maxFeedRate" type="number" v-model="settings.operationalLimits.maxFeedRate" />
                  <p class="text-xs text-muted-foreground">Maximum feed rate</p>
                </div>
                <div class="space-y-2">
                  <Label htmlFor="maxLoad">Max Load (%)</Label>
                  <Input id="maxLoad" type="number" v-model="settings.operationalLimits.maxLoad" min="0" max="100" />
                  <p class="text-xs text-muted-foreground">Maximum load capacity</p>
                </div>
              </div>

              <Alert variant="destructive">
                <AlertTriangle class="h-4 w-4" />
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>
                  Changing operational limits can affect machine performance and safety. Ensure all changes are approved by qualified personnel.
                </AlertDescription>
              </Alert>

              <Separator />

              <div class="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea id="notes" placeholder="Add any additional notes or special instructions..." rows="4" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  </AppLayout>
</template>

