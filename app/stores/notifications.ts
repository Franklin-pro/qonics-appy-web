import { defineStore } from 'pinia'
import type { AppNotification } from '~/types/application'
import { applicantService } from '~/services/applicantService'

export const useNotificationsStore = defineStore('notifications', () => {
  const items = ref<AppNotification[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const unreadCount = computed(() => items.value.filter(n => !n.read).length)

  async function fetch() {
    loading.value = true
    error.value = null
    try {
      items.value = await applicantService.listNotifications()
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      loading.value = false
    }
  }

  async function markRead(ids: string[]) {
    await applicantService.markNotificationsRead(ids)
    items.value.forEach(n => { if (ids.includes(n.id)) n.read = true })
  }

  const markAllRead = () => markRead(items.value.filter(n => !n.read).map(n => n.id))

  return { items, loading, error, unreadCount, fetch, markRead, markAllRead }
})
