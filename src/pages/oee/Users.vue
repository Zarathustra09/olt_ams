<script setup lang="ts">
import AppLayout from '@/layouts/AppLayout.vue'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { UserPlus, Mail, Shield, Edit, Trash2, Search } from 'lucide-vue-next'
import { ref } from 'vue'

const users = ref([
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Admin',
    department: 'Operations',
    status: 'active',
    avatar: 'https://ui.shadcn.com/avatars/01.png',
    initials: 'JD',
    lastActive: '2 hours ago'
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'Operator',
    department: 'Production',
    status: 'active',
    avatar: 'https://ui.shadcn.com/avatars/02.png',
    initials: 'JS',
    lastActive: '5 min ago'
  },
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    role: 'Supervisor',
    department: 'Quality',
    status: 'active',
    avatar: 'https://ui.shadcn.com/avatars/03.png',
    initials: 'BJ',
    lastActive: '1 day ago'
  },
  {
    id: 4,
    name: 'Alice Brown',
    email: 'alice.brown@example.com',
    role: 'Operator',
    department: 'Production',
    status: 'inactive',
    avatar: 'https://ui.shadcn.com/avatars/04.png',
    initials: 'AB',
    lastActive: '3 days ago'
  },
])

const getRoleBadgeVariant = (role: string) => {
  switch (role) {
    case 'Admin': return 'destructive'
    case 'Supervisor': return 'default'
    case 'Operator': return 'secondary'
    default: return 'outline'
  }
}
</script>

<template>
  <AppLayout>
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold">OEE Users</h1>
          <p class="text-muted-foreground">Manage users and permissions for OEE system access</p>
        </div>
        <Dialog>
          <DialogTrigger as-child>
            <Button>
              <UserPlus class="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent class="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new user account for OEE system access
              </DialogDescription>
            </DialogHeader>
            <div class="grid gap-4 py-4">
              <div class="grid gap-2">
                <Label for="name">Full Name</Label>
                <Input id="name" placeholder="Enter full name" />
              </div>
              <div class="grid gap-2">
                <Label for="email">Email</Label>
                <Input id="email" type="email" placeholder="user@example.com" />
              </div>
              <div class="grid gap-2">
                <Label for="role">Role</Label>
                <Select>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                    <SelectItem value="operator">Operator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div class="grid gap-2">
                <Label for="department">Department</Label>
                <Select>
                  <SelectTrigger id="department">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operations">Operations</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                    <SelectItem value="quality">Quality</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Create User</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div class="flex gap-4">
        <div class="relative flex-1">
          <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search users..." class="pl-9" />
        </div>
        <Select>
          <SelectTrigger class="w-[180px]">
            <SelectValue placeholder="Filter by Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="supervisor">Supervisor</SelectItem>
            <SelectItem value="operator">Operator</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger class="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card v-for="user in users" :key="user.id">
          <CardHeader>
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-4">
                <Avatar class="h-12 w-12">
                  <AvatarImage :src="user.avatar" :alt="user.name" />
                  <AvatarFallback>{{ user.initials }}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle class="text-lg">{{ user.name }}</CardTitle>
                  <CardDescription class="flex items-center gap-1">
                    <Mail class="h-3 w-3" />
                    {{ user.email }}
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <Shield class="h-4 w-4 text-muted-foreground" />
                <span class="text-sm text-muted-foreground">Role</span>
              </div>
              <Badge :variant="getRoleBadgeVariant(user.role)">{{ user.role }}</Badge>
            </div>
            <Separator />
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-muted-foreground">Department</span>
                <span class="font-medium">{{ user.department }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Last Active</span>
                <span class="font-medium">{{ user.lastActive }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-muted-foreground">Status</span>
                <div class="flex items-center gap-2">
                  <span class="text-xs font-medium capitalize">{{ user.status }}</span>
                  <Switch :checked="user.status === 'active'" />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter class="flex gap-2">
            <Button variant="outline" size="sm" class="flex-1">
              <Edit class="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button variant="outline" size="sm">
              <Trash2 class="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  </AppLayout>
</template>
