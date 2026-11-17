<script setup lang="ts">
import { useNotificationsStore } from '~/stores/notifications'

definePageMeta({ layout: 'applicant', middleware: ['auth', 'applicant'] })
useHead({ title: 'Notifications | Qonics Inc.' })

const store = useNotificationsStore()
onMounted(() => store.fetch())
</script>

<template>
  <div class="mx-auto max-w-3xl">
    <PageHeader title="Notifications" subtitle="Updates about your applications.">
      <Button label="Mark all as read" icon="pi pi-check" severity="secondary" outlined size="small" :disabled="!store.unreadCount" @click="store.markAllRead()" />
    </PageHeader>
    <LoadingState v-if="store.loading && !store.items.length" :rows="3" />
    <ErrorState v-else-if="store.error" :message="store.error" @retry="store.fetch()" />
    <div v-else-if="!store.items.length" class="surface-card"><EmptyState title="No notifications yet" message="You will see status updates here." icon="pi pi-bell" /></div>
    <ul v-else class="surface-card divide-y divide-line">
      <li v-for="n in store.items" :key="n.id" class="flex items-start gap-3 p-4" :class="{ 'bg-primary-50/40': !n.read }">
        <span class="mt-1.5 size-2 shrink-0 rounded-full" :class="n.read ? 'bg-transparent' : 'bg-brand'" :aria-label="n.read ? undefined : 'Unread'" role="img" />
        <div class="min-w-0 flex-1">
          <p class="text-sm" :class="n.read ? 'text-ink' : 'font-semibold text-navy'">{{ n.title }}</p>
          <p class="mt-0.5 text-sm text-muted">{{ n.message }}</p>
          <p class="mt-1 text-xs text-muted">{{ timeAgo(n.at) }}</p>
        </div>
        <Button v-if="!n.read" label="Mark read" size="small" text severity="secondary" @click="store.markRead([n.id])" />
      </li>
    </ul>
  </div>
</template>
