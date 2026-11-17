import { useAuthStore } from '~/stores/auth'

/** Keeps signed-in users away from login/register. */
export default defineNuxtRouteMiddleware(() => {
  const auth = useAuthStore()
  if (auth.isAuthenticated) return navigateTo(auth.homePath)
})
