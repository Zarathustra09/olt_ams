<script setup lang="ts">
import { ref } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, ShieldCheck } from 'lucide-vue-next'

interface Permission {
  id: string
  name: string
  description: string
}

interface Role {
  id: string
  name: string
  description: string
  userCount: number
  permissions: string[]
}

const roles = ref<Role[]>([
  {
    id: '1',
    name: 'Administrator',
    description: 'Full system access',
    userCount: 3,
    permissions: ['view_machines', 'edit_machines', 'delete_machines', 'manage_users', 'manage_roles', 'view_analytics']
  },
  {
    id: '2',
    name: 'Operator',
    description: 'Can operate and view machines',
    userCount: 15,
    permissions: ['view_machines', 'edit_machines', 'view_analytics']
  },
  {
    id: '3',
    name: 'Viewer',
    description: 'Read-only access',
    userCount: 8,
    permissions: ['view_machines', 'view_analytics']
  },
])

const availablePermissions = ref<Permission[]>([
  { id: 'view_machines', name: 'View Machines', description: 'View machine information' },
  { id: 'edit_machines', name: 'Edit Machines', description: 'Modify machine settings' },
  { id: 'delete_machines', name: 'Delete Machines', description: 'Remove machines from system' },
  { id: 'view_analytics', name: 'View Analytics', description: 'Access analytics dashboard' },
  { id: 'manage_users', name: 'Manage Users', description: 'Create and manage users' },
  { id: 'manage_roles', name: 'Manage Roles', description: 'Create and manage roles' },
])

const isDialogOpen = ref(false)
const editingRole = ref<Role | null>(null)
const formData = ref({
  name: '',
  description: '',
  permissions: [] as string[]
})

const openCreateDialog = () => {
  editingRole.value = null
  formData.value = {
    name: '',
    description: '',
    permissions: []
  }
  isDialogOpen.value = true
}

const openEditDialog = (role: Role) => {
  editingRole.value = role
  formData.value = {
    name: role.name,
    description: role.description,
    permissions: [...role.permissions]
  }
  isDialogOpen.value = true
}

const togglePermission = (permissionId: string) => {
  const index = formData.value.permissions.indexOf(permissionId)
  if (index > -1) {
    formData.value.permissions.splice(index, 1)
  } else {
    formData.value.permissions.push(permissionId)
  }
}

const saveRole = () => {
  if (editingRole.value) {
    // Update existing role
    const index = roles.value.findIndex(r => r.id === editingRole.value!.id)
    if (index > -1) {
      roles.value[index] = {
        ...roles.value[index],
        name: formData.value.name,
        description: formData.value.description,
        permissions: [...formData.value.permissions]
      }
    }
  } else {
    // Create new role
    roles.value.push({
      id: String(Date.now()),
      name: formData.value.name,
      description: formData.value.description,
      userCount: 0,
      permissions: [...formData.value.permissions]
    })
  }
  isDialogOpen.value = false
}

const deleteRole = (roleId: string) => {
  const index = roles.value.findIndex(r => r.id === roleId)
  if (index > -1) {
    roles.value.splice(index, 1)
  }
}
</script>

<template>
  <AppLayout>
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold tracking-tight">Role Management</h1>
          <p class="text-muted-foreground">Manage roles and permissions for your organization</p>
        </div>
        <Dialog v-model:open="isDialogOpen">
          <DialogTrigger as-child>
            <Button @click="openCreateDialog">
              <Plus class="mr-2 h-4 w-4" />
              Create Role
            </Button>
          </DialogTrigger>
          <DialogContent class="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {{ editingRole ? 'Edit Role' : 'Create New Role' }}
              </DialogTitle>
              <DialogDescription>
                {{ editingRole ? 'Update role details and permissions' : 'Add a new role with specific permissions' }}
              </DialogDescription>
            </DialogHeader>
            <div class="grid gap-4 py-4">
              <div class="grid gap-2">
                <Label for="name">Role Name</Label>
                <Input id="name" v-model="formData.name" placeholder="e.g., Manager" />
              </div>
              <div class="grid gap-2">
                <Label for="description">Description</Label>
                <Input id="description" v-model="formData.description" placeholder="Brief description of the role" />
              </div>
              <div class="grid gap-2">
                <Label>Permissions</Label>
                <Card>
                  <CardContent class="pt-6">
                    <div class="space-y-4">
                      <div
                        v-for="permission in availablePermissions"
                        :key="permission.id"
                        class="flex items-start space-x-3"
                      >
                        <Checkbox
                          :id="permission.id"
                          :checked="formData.permissions.includes(permission.id)"
                          @update:checked="togglePermission(permission.id)"
                        />
                        <div class="grid gap-1.5 leading-none">
                          <label
                            :for="permission.id"
                            class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {{ permission.name }}
                          </label>
                          <p class="text-sm text-muted-foreground">
                            {{ permission.description }}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" @click="isDialogOpen = false">Cancel</Button>
              <Button @click="saveRole">
                {{ editingRole ? 'Update Role' : 'Create Role' }}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Roles</CardTitle>
          <CardDescription>A list of all roles in your organization</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead class="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="role in roles" :key="role.id">
                <TableCell class="font-medium">
                  <div class="flex items-center gap-2">
                    <ShieldCheck class="h-4 w-4 text-muted-foreground" />
                    {{ role.name }}
                  </div>
                </TableCell>
                <TableCell>{{ role.description }}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{{ role.userCount }} users</Badge>
                </TableCell>
                <TableCell>
                  <div class="flex flex-wrap gap-1">
                    <Badge
                      v-for="permission in role.permissions.slice(0, 3)"
                      :key="permission"
                      variant="outline"
                      class="text-xs"
                    >
                      {{ availablePermissions.find(p => p.id === permission)?.name }}
                    </Badge>
                    <Badge
                      v-if="role.permissions.length > 3"
                      variant="outline"
                      class="text-xs"
                    >
                      +{{ role.permissions.length - 3 }} more
                    </Badge>
                  </div>
                </TableCell>
                <TableCell class="text-right">
                  <div class="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" @click="openEditDialog(role)">
                      <Edit class="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      @click="deleteRole(role.id)"
                      :disabled="role.userCount > 0"
                    >
                      <Trash2 class="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  </AppLayout>
</template>

