<script setup lang="ts">
import { useNotificationsStore } from '~/stores/notifications'

defineEmits<{ menu: [] }>()
const notifications = useNotificationsStore()
</script>

<template>
  <PortalHeader title="Applicant portal" settings-to="/applicant/settings" @menu="$emit('menu')">
    <NuxtLink to="/applicant/notifications" aria-label="Notifications">
      <OverlayBadge v-if="notifications.unreadCount" :value="notifications.unreadCount" severity="danger" size="small">
        <Button icon="pi pi-bell" severity="secondary" text rounded tabindex="-1" />
      </OverlayBadge>
      <Button v-else icon="pi pi-bell" severity="secondary" text rounded tabindex="-1" />
    </NuxtLink>
  </PortalHeader>
</template>
