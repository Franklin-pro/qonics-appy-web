import { useNotificationsStore } from '~/stores/notifications'

export function useNotifications() {
  const store = useNotificationsStore()
  return { store, items: computed(() => store.items), unread: computed(() => store.unreadCount) }
}
