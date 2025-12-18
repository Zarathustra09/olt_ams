<script setup lang="ts">
import { ref } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Settings as SettingsIcon,
  Palette,
  Globe,
  Lock,
  Bell,
  Database,
  AlertTriangle,
  Info
} from 'lucide-vue-next'

const settings = ref({
  theme: 'light',
  language: 'en',
  timezone: 'UTC-8',
  dateFormat: 'MM/DD/YYYY',
  notifications: {
    email: true,
    push: true,
    sms: false,
    desktop: true,
  },
  privacy: {
    profileVisible: true,
    activityTracking: true,
    analytics: true,
  },
  security: {
    twoFactor: false,
    sessionTimeout: '30',
  }
})

const isDarkMode = ref(false)
</script>

<template>
  <AppLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Settings</h1>
        <p class="text-muted-foreground">Manage your application preferences and configurations</p>
      </div>

      <Tabs default-value="general" class="space-y-4">
        <TabsList>
          <TabsTrigger value="general">
            <SettingsIcon class="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette class="h-4 w-4 mr-2" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell class="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock class="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="data">
            <Database class="h-4 w-4 mr-2" />
            Data & Storage
          </TabsTrigger>
        </TabsList>

        <!-- General Settings -->
        <TabsContent value="general" class="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure basic application settings</CardDescription>
            </CardHeader>
            <CardContent class="space-y-6">
              <div class="space-y-4">
                <div class="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select v-model="settings.language">
                    <SelectTrigger id="language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="zh">Chinese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div class="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select v-model="settings.timezone">
                    <SelectTrigger id="timezone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC-8">Pacific Time (UTC-8)</SelectItem>
                      <SelectItem value="UTC-5">Eastern Time (UTC-5)</SelectItem>
                      <SelectItem value="UTC+0">GMT (UTC+0)</SelectItem>
                      <SelectItem value="UTC+1">Central European Time (UTC+1)</SelectItem>
                      <SelectItem value="UTC+8">China Standard Time (UTC+8)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div class="space-y-2">
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Select v-model="settings.dateFormat">
                    <SelectTrigger id="dateFormat">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div class="flex justify-end gap-2">
                <Button variant="outline">Reset to Default</Button>
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <!-- Appearance Settings -->
        <TabsContent value="appearance" class="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize the look and feel of the application</CardDescription>
            </CardHeader>
            <CardContent class="space-y-6">
              <div class="flex items-center justify-between">
                <div class="space-y-0.5">
                  <Label>Dark Mode</Label>
                  <div class="text-sm text-muted-foreground">
                    Enable dark theme for better viewing in low light
                  </div>
                </div>
                <Switch v-model:checked="isDarkMode" />
              </div>

              <Separator />

              <div class="space-y-2">
                <Label>Theme</Label>
                <div class="grid grid-cols-3 gap-4">
                  <div class="border-2 border-primary rounded-lg p-4 cursor-pointer hover:bg-accent">
                    <div class="aspect-video bg-gradient-to-br from-blue-500 to-purple-500 rounded mb-2"></div>
                    <p class="text-sm font-medium text-center">Default</p>
                  </div>
                  <div class="border-2 border-transparent rounded-lg p-4 cursor-pointer hover:bg-accent hover:border-border">
                    <div class="aspect-video bg-gradient-to-br from-green-500 to-teal-500 rounded mb-2"></div>
                    <p class="text-sm font-medium text-center">Nature</p>
                  </div>
                  <div class="border-2 border-transparent rounded-lg p-4 cursor-pointer hover:bg-accent hover:border-border">
                    <div class="aspect-video bg-gradient-to-br from-orange-500 to-red-500 rounded mb-2"></div>
                    <p class="text-sm font-medium text-center">Sunset</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div class="space-y-0.5">
                    <Label>Compact Mode</Label>
                    <div class="text-sm text-muted-foreground">
                      Reduce spacing and padding for a denser layout
                    </div>
                  </div>
                  <Switch />
                </div>

                <div class="flex items-center justify-between">
                  <div class="space-y-0.5">
                    <Label>Show Animations</Label>
                    <div class="text-sm text-muted-foreground">
                      Enable smooth transitions and animations
                    </div>
                  </div>
                  <Switch :checked="true" />
                </div>
              </div>

              <Separator />

              <div class="flex justify-end gap-2">
                <Button variant="outline">Reset to Default</Button>
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <!-- Notifications Settings -->
        <TabsContent value="notifications" class="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose how and when you want to be notified</CardDescription>
            </CardHeader>
            <CardContent class="space-y-6">
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div class="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <div class="text-sm text-muted-foreground">
                      Receive notifications via email
                    </div>
                  </div>
                  <Switch v-model:checked="settings.notifications.email" />
                </div>

                <div class="flex items-center justify-between">
                  <div class="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <div class="text-sm text-muted-foreground">
                      Receive push notifications in your browser
                    </div>
                  </div>
                  <Switch v-model:checked="settings.notifications.push" />
                </div>

                <div class="flex items-center justify-between">
                  <div class="space-y-0.5">
                    <Label>SMS Notifications</Label>
                    <div class="text-sm text-muted-foreground">
                      Receive critical alerts via text message
                    </div>
                  </div>
                  <Switch v-model:checked="settings.notifications.sms" />
                </div>

                <div class="flex items-center justify-between">
                  <div class="space-y-0.5">
                    <Label>Desktop Notifications</Label>
                    <div class="text-sm text-muted-foreground">
                      Show desktop notifications when app is in background
                    </div>
                  </div>
                  <Switch v-model:checked="settings.notifications.desktop" />
                </div>
              </div>

              <Separator />

              <Alert>
                <Info class="h-4 w-4" />
                <AlertTitle>Notification Frequency</AlertTitle>
                <AlertDescription>
                  You can configure specific notification types and frequencies in your profile settings.
                </AlertDescription>
              </Alert>

              <div class="flex justify-end gap-2">
                <Button variant="outline">Test Notifications</Button>
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <!-- Security Settings -->
        <TabsContent value="security" class="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your account security and privacy</CardDescription>
            </CardHeader>
            <CardContent class="space-y-6">
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div class="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <div class="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </div>
                  </div>
                  <Switch v-model:checked="settings.security.twoFactor" />
                </div>

                <div class="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Select v-model="settings.security.sessionTimeout">
                    <SelectTrigger id="sessionTimeout">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                      <SelectItem value="never">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div class="space-y-4">
                <h4 class="text-sm font-medium">Change Password</h4>
                <div class="space-y-4">
                  <div class="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input id="currentPassword" type="password" />
                  </div>
                  <div class="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" type="password" />
                  </div>
                  <div class="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input id="confirmPassword" type="password" />
                  </div>
                </div>
              </div>

              <Separator />

              <Alert variant="destructive">
                <AlertTriangle class="h-4 w-4" />
                <AlertTitle>Danger Zone</AlertTitle>
                <AlertDescription>
                  <div class="mt-2 space-y-2">
                    <p>Irreversible actions that affect your account</p>
                    <div class="flex gap-2">
                      <Button variant="destructive" size="sm">Delete Account</Button>
                      <Button variant="outline" size="sm">Export Data</Button>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>

              <div class="flex justify-end gap-2">
                <Button variant="outline">Cancel</Button>
                <Button>Update Security Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <!-- Data & Storage Settings -->
        <TabsContent value="data" class="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data & Storage</CardTitle>
              <CardDescription>Manage your data and storage preferences</CardDescription>
            </CardHeader>
            <CardContent class="space-y-6">
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div class="space-y-0.5">
                    <Label>Activity Tracking</Label>
                    <div class="text-sm text-muted-foreground">
                      Allow the app to track your activity for analytics
                    </div>
                  </div>
                  <Switch v-model:checked="settings.privacy.activityTracking" />
                </div>

                <div class="flex items-center justify-between">
                  <div class="space-y-0.5">
                    <Label>Usage Analytics</Label>
                    <div class="text-sm text-muted-foreground">
                      Help improve the app by sharing usage statistics
                    </div>
                  </div>
                  <Switch v-model:checked="settings.privacy.analytics" />
                </div>
              </div>

              <Separator />

              <div class="space-y-4">
                <h4 class="text-sm font-medium">Storage Usage</h4>
                <div class="space-y-3">
                  <div class="flex justify-between text-sm">
                    <span>Cache</span>
                    <span class="text-muted-foreground">128 MB</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span>Documents</span>
                    <span class="text-muted-foreground">2.4 GB</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span>Images</span>
                    <span class="text-muted-foreground">856 MB</span>
                  </div>
                  <Separator />
                  <div class="flex justify-between text-sm font-medium">
                    <span>Total Used</span>
                    <span>3.38 GB / 10 GB</span>
                  </div>
                  <div class="w-full bg-secondary rounded-full h-2">
                    <div class="bg-primary h-2 rounded-full" style="width: 33.8%"></div>
                  </div>
                </div>
              </div>

              <Separator />

              <div class="flex justify-between items-center">
                <div>
                  <h4 class="text-sm font-medium">Clear Cache</h4>
                  <p class="text-sm text-muted-foreground">Free up space by clearing cached data</p>
                </div>
                <Button variant="outline">Clear Cache</Button>
              </div>

              <div class="flex justify-end gap-2">
                <Button variant="outline">Export All Data</Button>
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  </AppLayout>
</template>

