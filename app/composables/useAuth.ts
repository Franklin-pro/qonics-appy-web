import { useAuthStore } from '~/stores/auth'

export function useAuth() {
  const store = useAuthStore()
  const toast = useToast()
  const route = useRoute() // captured here: composables cannot be called after an await

  async function signIn(email: string, password: string) {
    const user = await store.login(email, password)
    toast.add({ severity: 'success', summary: `Welcome back, ${user.fullName.split(' ')[0]}`, life: 3000 })
    const redirect = route.query.redirect
    const target = typeof redirect === 'string' && redirect.startsWith(`/${user.role}`) ? redirect : store.homePath
    await navigateTo(target)
  }

  async function signOut() {
    await store.logout()
    toast.add({ severity: 'info', summary: 'You have been signed out', life: 3000 })
    await navigateTo('/auth/login')
  }

  return { store, signIn, signOut }
}
