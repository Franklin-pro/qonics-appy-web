<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useNotificationsStore } from '~/stores/notifications'
import { useSettingsStore } from '~/stores/settings'

const auth = useAuthStore()
const notifications = useNotificationsStore()
const settings = useSettingsStore()

onMounted(() => {
  if (auth.isAuthenticated) {
    notifications.fetch()
    settings.fetch()
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
