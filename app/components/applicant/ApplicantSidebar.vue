<script setup lang="ts">
import { useNotificationsStore } from '~/stores/notifications'

const notifications = useNotificationsStore()
const items = computed(() => [
  { label: 'Overview', icon: 'pi pi-th-large', to: '/applicant', exact: true },
  { label: 'My Profile', icon: 'pi pi-user', to: '/applicant/profile' },
  { label: 'Apply for Internship', icon: 'pi pi-send', to: '/applicant/apply' },
  { label: 'My Applications', icon: 'pi pi-file', to: '/applicant/applications' },
  { label: 'Notifications', icon: 'pi pi-bell', to: '/applicant/notifications', badge: notifications.unreadCount },
  { label: 'Settings', icon: 'pi pi-cog', to: '/applicant/settings' }
])
</script>

<template>
  <SidebarNav :items="items" area="Applicant" />
</template>
