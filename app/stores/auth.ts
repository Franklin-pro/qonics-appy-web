import { defineStore } from 'pinia'
import type { Session, User } from '~/types/user'
import { authService, type RegisterPayload } from '~/services/authService'
import { SESSION_COOKIE, isDemoMode } from '~/services/api'

export const useAuthStore = defineStore('auth', () => {
  // The session is kept in a cookie so it survives reloads and is readable by route middleware.
  const session = useCookie<Session | null>(SESSION_COOKIE, { maxAge: 60 * 60 * 8, sameSite: 'lax', default: () => null })

  const user = computed<User | null>(() => session.value?.user ?? null)
  const isAuthenticated = computed(() => !!session.value?.token)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isApplicant = computed(() => user.value?.role === 'applicant')
  const homePath = computed(() => (isAdmin.value ? '/admin' : '/applicant'))
  const demoMode = computed(() => isDemoMode())

  async function login(email: string, password: string) {
    session.value = await authService.login(email, password)
    return session.value.user
  }

  async function register(payload: RegisterPayload) {
    session.value = await authService.register(payload)
    return session.value.user
  }

  async function logout() {
    await authService.logout()
    session.value = null
  }

  function updateUser(patch: Partial<User>) {
    if (session.value) session.value = { ...session.value, user: { ...session.value.user, ...patch } }
  }

  return { session, user, isAuthenticated, isAdmin, isApplicant, homePath, demoMode, login, register, logout, updateUser }
})
