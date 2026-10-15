import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/pages/Home.vue'
import Machine from '@/pages/Machine.vue'
import NotFound from '@/pages/NotFound.vue'
import { MACHINES } from '@/data/machines'

// Unknown machine ids fall through to the 404 page.
const machineExists = (to: { params: Record<string, unknown> }) =>
    MACHINES.some((m) => m.id === Number(to.params.id)) || '/404'

export const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', component: Home, meta: { title: 'Home' } },
        { path: '/machines', component: Machine, meta: { title: 'Machines' } },
        { path: '/machines/:id', component: () => import('@/pages/MachineDetails.vue'), beforeEnter: machineExists, meta: { title: 'Machine Details' } },
        { path: '/machines/:id/settings', component: () => import('@/pages/MachineSettings.vue'), beforeEnter: machineExists, meta: { title: 'Settings' } },
        { path: '/analytics', component: () => import('@/pages/Analytics.vue'), meta: { title: 'Analytics' } },
        { path: '/profile', component: () => import('@/pages/Profile.vue'), meta: { title: 'Profile' } },
        { path: '/settings', component: () => import('@/pages/Settings.vue'), meta: { title: 'Settings' } },
        { path: '/oee/alerts', component: () => import('@/pages/oee/Alerts.vue'), meta: { title: 'Alerts' } },
        { path: '/oee/activity-logs', component: () => import('@/pages/oee/ActivityLogs.vue'), meta: { title: 'Activity Logs' } },
        { path: '/oee/users', component: () => import('@/pages/oee/Users.vue'), meta: { title: 'Users' } },
        { path: '/oee/roles', component: () => import('@/pages/oee/RoleManagement.vue'), meta: { title: 'Role Management' } },
        { path: '/:pathMatch(.*)*', component: NotFound, meta: { title: '404 - Page Not Found' } },
    ],
})