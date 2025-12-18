<script setup lang="ts">
import { ref } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { User, Mail, Phone, MapPin, Briefcase, Calendar, Shield, Bell } from 'lucide-vue-next'

const user = ref({
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1 (555) 123-4567',
  location: 'San Francisco, CA',
  position: 'Production Manager',
  department: 'Manufacturing',
  joinDate: 'January 15, 2022',
  bio: 'Experienced production manager with over 10 years in manufacturing operations. Passionate about optimizing processes and improving efficiency.',
  avatar: 'https://ui.shadcn.com/avatars/01.png',
  initials: 'JD'
})

const recentActivity = [
  { action: 'Updated machine M-001 status', time: '2 hours ago', type: 'update' },
  { action: 'Completed OEE report review', time: '5 hours ago', type: 'task' },
  { action: 'Scheduled maintenance for Machine A', time: '1 day ago', type: 'schedule' },
  { action: 'Approved quality inspection', time: '2 days ago', type: 'approval' },
  { action: 'Created new production order', time: '3 days ago', type: 'create' },
]

const permissions = [
  { name: 'View Dashboard', granted: true },
  { name: 'Edit Machine Settings', granted: true },
  { name: 'Approve Production Orders', granted: true },
  { name: 'Manage Users', granted: false },
  { name: 'System Administration', granted: false },
]
</script>

<template>
  <AppLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Profile</h1>
        <p class="text-muted-foreground">Manage your account information and preferences</p>
      </div>

      <!-- Profile Overview Card -->
      <Card>
        <CardContent class="pt-6">
          <div class="flex items-start gap-6">
            <Avatar class="h-24 w-24">
              <AvatarImage :src="user.avatar" :alt="user.name" />
              <AvatarFallback class="text-2xl">{{ user.initials }}</AvatarFallback>
            </Avatar>
            <div class="flex-1 space-y-3">
              <div>
                <h2 class="text-2xl font-bold">{{ user.name }}</h2>
                <p class="text-muted-foreground">{{ user.position }}</p>
              </div>
              <div class="flex flex-wrap gap-4 text-sm">
                <div class="flex items-center gap-2">
                  <Mail class="h-4 w-4 text-muted-foreground" />
                  <span>{{ user.email }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <Phone class="h-4 w-4 text-muted-foreground" />
                  <span>{{ user.phone }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <MapPin class="h-4 w-4 text-muted-foreground" />
                  <span>{{ user.location }}</span>
                </div>
              </div>
              <div class="flex gap-2">
                <Badge variant="secondary">
                  <Briefcase class="h-3 w-3 mr-1" />
                  {{ user.department }}
                </Badge>
                <Badge variant="outline">
                  <Calendar class="h-3 w-3 mr-1" />
                  Joined {{ user.joinDate }}
                </Badge>
              </div>
            </div>
            <Button>Edit Profile</Button>
          </div>
        </CardContent>
      </Card>

      <!-- Detailed Information Tabs -->
      <Tabs default-value="info" class="space-y-4">
        <TabsList>
          <TabsTrigger value="info">Personal Information</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="info" class="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details and profile information</CardDescription>
            </CardHeader>
            <CardContent class="space-y-6">
              <div class="grid gap-6 md:grid-cols-2">
                <div class="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" v-model="user.name" />
                </div>
                <div class="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" v-model="user.email" />
                </div>
                <div class="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" v-model="user.phone" />
                </div>
                <div class="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" v-model="user.location" />
                </div>
                <div class="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Input id="position" v-model="user.position" />
                </div>
                <div class="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input id="department" v-model="user.department" />
                </div>
              </div>
              <div class="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" v-model="user.bio" rows="4" />
              </div>
              <Separator />
              <div class="flex justify-end gap-2">
                <Button variant="outline">Cancel</Button>
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" class="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest actions and interactions in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div class="space-y-4">
                <div v-for="activity in recentActivity" :key="activity.action"
                  class="flex items-start gap-4 pb-4 last:pb-0 border-b last:border-0">
                  <div class="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                    <User class="h-4 w-4 text-primary" />
                  </div>
                  <div class="flex-1 space-y-1">
                    <p class="text-sm font-medium">{{ activity.action }}</p>
                    <p class="text-xs text-muted-foreground">{{ activity.time }}</p>
                  </div>
                  <Badge variant="outline">{{ activity.type }}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" class="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Access Permissions</CardTitle>
              <CardDescription>Your current access levels and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div class="space-y-3">
                <div v-for="permission in permissions" :key="permission.name"
                  class="flex items-center justify-between p-3 border rounded-lg">
                  <div class="flex items-center gap-3">
                    <Shield :class="['h-5 w-5', permission.granted ? 'text-green-500' : 'text-muted-foreground']" />
                    <span class="font-medium">{{ permission.name }}</span>
                  </div>
                  <Badge :variant="permission.granted ? 'default' : 'secondary'">
                    {{ permission.granted ? 'Granted' : 'Not Granted' }}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" class="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
              <div class="flex items-center justify-between p-4 border rounded-lg">
                <div class="flex items-center gap-3">
                  <Bell class="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div class="font-medium">Email Notifications</div>
                    <div class="text-sm text-muted-foreground">Receive updates via email</div>
                  </div>
                </div>
                <Button variant="outline" size="sm">Configure</Button>
              </div>
              <div class="flex items-center justify-between p-4 border rounded-lg">
                <div class="flex items-center gap-3">
                  <Bell class="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div class="font-medium">Push Notifications</div>
                    <div class="text-sm text-muted-foreground">Browser push notifications</div>
                  </div>
                </div>
                <Button variant="outline" size="sm">Configure</Button>
              </div>
              <div class="flex items-center justify-between p-4 border rounded-lg">
                <div class="flex items-center gap-3">
                  <Bell class="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div class="font-medium">SMS Notifications</div>
                    <div class="text-sm text-muted-foreground">Critical alerts via SMS</div>
                  </div>
                </div>
                <Button variant="outline" size="sm">Configure</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  </AppLayout>
</template>
