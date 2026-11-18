import type { Session } from '~/types/user'
import { api } from './api'
import { toSession } from './mappers'

export interface RegisterPayload { fullName: string; email: string; phone: string; password: string }

export const authService = {
  async login(email: string, password: string): Promise<Session> {
    return toSession(await api('/auth/login', { method: 'POST', body: { email, password } }))
  },

  async register(payload: RegisterPayload): Promise<Session> {
    const { fullName, ...rest } = payload
    return toSession(await api('/auth/register', { method: 'POST', body: { full_name: fullName, ...rest } }))
  },

  async forgotPassword(email: string): Promise<void> {
    await api('/auth/forgot-password', { method: 'POST', body: { email } })
  },

  async resetPassword(token: string, password: string): Promise<void> {
    await api('/auth/reset-password', { method: 'POST', body: { token, password } })
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api('/auth/change-password', { method: 'POST', body: { currentPassword, newPassword } })
  },

  async logout(): Promise<void> {
    await api('/auth/logout', { method: 'POST' }).catch(() => undefined) // sign out locally even if the call fails
  }
}
