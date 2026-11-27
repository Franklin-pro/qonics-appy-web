<script setup lang="ts">
import { useNotificationsStore } from '~/stores/notifications'

const notifications = useNotificationsStore()
const items = computed(() => [
  { label: 'Dashboard', icon: 'pi pi-chart-bar', to: '/admin', exact: true },
  { label: 'Applications', icon: 'pi pi-file-pdf', to: '/admin/applications' },
  { label: 'Applicants', icon: 'pi pi-users', to: '/admin/applicants' },
  { label: 'Departments', icon: 'pi pi-sitemap', to: '/admin/departments' },
  { label: 'Training Packages', icon: 'pi pi-book', to: '/admin/training' },
  { label: 'Reports', icon: 'pi pi-chart-line', to: '/admin/reports' },
  { label: 'Notifications', icon: 'pi pi-bell', to: '/admin/notifications', badge: notifications.unreadCount },
  { label: 'Settings', icon: 'pi pi-cog', to: '/admin/settings' }
])
</script>

<template>
  <SidebarNav :items="items" area="Admin" />
</template>
