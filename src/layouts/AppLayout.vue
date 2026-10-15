<!-- src/layouts/AppLayout.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDark } from '@vueuse/core'
import NotificationBell from '@/components/dashboard/NotificationBell.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useFirstLoad } from '@/composables/useFirstLoad'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { Factory, Home, Cpu, BarChart3, User, Settings, Moon, Sun, ChevronUp, LogOut, Bell, ScrollText, Users, ShieldCheck, Map as MapIcon, Tv } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import logoBlack from '@/assets/images/logo-black.png'
import logoWhite from '@/assets/images/logo-white.png'

// Persisted by vueuse and kept in sync with the <html> class.
const isDarkMode = useDark({ initialValue: 'light' })
const route = useRoute()
const router = useRouter()
const ready = useFirstLoad()

const user = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  avatar: 'https://ui.shadcn.com/avatars/01.png',
  initials: 'JD'
}

const breadcrumbs = computed(() => {
  const pathArray = route.path.split('/').filter(p => p && p !== 'oee')
  const crumbs = [{ name: 'Home', path: '/' }]

  let currentPath = ''
  pathArray.forEach((segment, index) => {
    currentPath += `/${segment}`
    const isLast = index === pathArray.length - 1

    // Get name from route meta or format segment
    const matchedRoute = route.matched[route.matched.length - 1]
    let name = matchedRoute?.meta?.title as string || segment.charAt(0).toUpperCase() + segment.slice(1)

    // Format specific segments
    if (segment === 'activity-logs') name = 'Activity Logs'
    if (segment === 'role-management') name = 'Role Management'

    crumbs.push({
      name: name,
      path: isLast ? '' : currentPath
    })
  })

  return crumbs
})

const isActiveRoute = (path: string) => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}

const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
}

const currentLogo = computed(() => isDarkMode.value ? logoWhite : logoBlack)
</script>

<template>
  <SidebarProvider>
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <div class="flex aspect-square size-24 items-center justify-center rounded-lg">
                <img :src="currentLogo" alt="Olterra Solutions Logo" class="size-24 object-contain" />
              </div>
              <div class="grid flex-1 text-left text-sm leading-tight">
                <span class="truncate font-semibold">Olterra Solutions</span>
                <span class="truncate text-xs">OEE Management</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton as-child :isActive="isActiveRoute('/')">
                  <RouterLink to="/">
                    <Home class="size-4" />
                    <span>Home</span>
                  </RouterLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton as-child :isActive="isActiveRoute('/machines')">
                  <RouterLink to="/machines">
                    <Cpu class="size-4" />
                    <span>Machines</span>
                  </RouterLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton as-child :isActive="isActiveRoute('/floor')">
                  <RouterLink to="/floor">
                    <MapIcon class="size-4" />
                    <span>Plant floor</span>
                  </RouterLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton as-child :isActive="isActiveRoute('/analytics')">
                  <RouterLink to="/analytics">
                    <BarChart3 class="size-4" />
                    <span>Analytics</span>
                  </RouterLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton as-child :isActive="isActiveRoute('/wall')">
                  <RouterLink to="/wall">
                    <Tv class="size-4" />
                    <span>Wall display</span>
                  </RouterLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>OEE Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton as-child :isActive="isActiveRoute('/oee/alerts')">
                  <RouterLink to="/oee/alerts">
                    <Bell class="size-4" />
                    <span>Alerts</span>
                  </RouterLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton as-child :isActive="isActiveRoute('/oee/activity-logs')">
                  <RouterLink to="/oee/activity-logs">
                    <ScrollText class="size-4" />
                    <span>Activity Logs</span>
                  </RouterLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Administration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton as-child :isActive="isActiveRoute('/oee/users')">
                  <RouterLink to="/oee/users">
                    <Users class="size-4" />
                    <span>Users</span>
                  </RouterLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton as-child :isActive="isActiveRoute('/oee/roles')">
                  <RouterLink to="/oee/roles">
                    <ShieldCheck class="size-4" />
                    <span>Role Management</span>
                  </RouterLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <SidebarMenuButton
                  size="lg"
                  class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar class="h-8 w-8 rounded-lg">
                    <AvatarImage :src="user.avatar" :alt="user.name" />
                    <AvatarFallback class="rounded-lg">{{ user.initials }}</AvatarFallback>
                  </Avatar>
                  <div class="grid flex-1 text-left text-sm leading-tight">
                    <span class="truncate font-semibold">{{ user.name }}</span>
                    <span class="truncate text-xs">{{ user.email }}</span>
                  </div>
                  <ChevronUp class="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                class="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                :side-offset="4"
              >
                <DropdownMenuItem as-child>
                  <RouterLink to="/profile" class="cursor-pointer">
                    <User class="mr-2 size-4" />
                    Profile
                  </RouterLink>
                </DropdownMenuItem>
                <DropdownMenuItem as-child>
                  <RouterLink to="/settings" class="cursor-pointer">
                    <Settings class="mr-2 size-4" />
                    Settings
                  </RouterLink>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem @select.prevent @click="toggleTheme" class="cursor-pointer">
                  <component :is="isDarkMode ? Sun : Moon" class="mr-2 size-4" />
                  <span class="flex-1">{{ isDarkMode ? 'Light Mode' : 'Dark Mode' }}</span>
                  <Switch :checked="isDarkMode" class="pointer-events-none" />
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem class="cursor-pointer">
                  <LogOut class="mr-2 size-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
    <SidebarInset>
      <header class="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div class="flex items-center gap-2 px-4">
          <SidebarTrigger class="-ml-1" />
          <Separator orientation="vertical" class="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <template v-for="(crumb, index) in breadcrumbs" :key="crumb.path || crumb.name">
                <BreadcrumbItem v-if="index < breadcrumbs.length - 1">
                  <BreadcrumbLink as-child>
                    <RouterLink :to="crumb.path">{{ crumb.name }}</RouterLink>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbItem v-else>
                  <BreadcrumbPage>{{ crumb.name }}</BreadcrumbPage>
                </BreadcrumbItem>
                <BreadcrumbSeparator v-if="index < breadcrumbs.length - 1" />
              </template>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div class="ml-auto flex items-center gap-1 px-4">
          <Badge variant="outline" class="mr-2 hidden gap-1.5 md:inline-flex">
            <Factory class="size-3.5" /> Plant 01 · Day shift
          </Badge>
          <Tooltip>
            <TooltipTrigger as-child>
              <Button variant="ghost" size="icon" class="size-9" aria-label="Open wall display" @click="router.push('/wall')">
                <Tv class="size-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Wall display</TooltipContent>
          </Tooltip>
          <NotificationBell />
        </div>
      </header>
      <div class="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div v-if="!ready" class="space-y-6" aria-busy="true" aria-label="Loading">
          <div class="space-y-2">
            <Skeleton class="h-8 w-64" />
            <Skeleton class="h-4 w-96 max-w-full" />
          </div>
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Skeleton v-for="n in 4" :key="n" class="h-64 rounded-xl" />
          </div>
          <Skeleton class="h-40 rounded-xl" />
          <Skeleton class="h-64 rounded-xl" />
        </div>
        <div v-else class="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <slot />
        </div>
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>

<style scoped>
</style>