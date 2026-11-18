<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useNotificationsStore } from '~/stores/notifications'

const auth = useAuthStore()
const notifications = useNotificationsStore()

onMounted(() => {
  if (auth.isAuthenticated) {
    notifications.fetch()
  }
})
</script>

<template>
  <PortalShell>
    <template #sidebar><ApplicantSidebar /></template>
    <template #header="{ openMenu }"><ApplicantHeader @menu="openMenu" /></template>
    <slot />
  </PortalShell>
</template>
