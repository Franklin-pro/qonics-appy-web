import type { Session, User } from '~/types/user'
import { api, ApiError, isDemoMode } from './api'
import * as db from './mock/db'

export interface RegisterPayload { fullName: string; email: string; phone: string; password: string }

// Demo-mode passwords for accounts registered during this page session only.
const demoPasswords = new Map<string, string>([
  [db.DEMO_ACCOUNTS.applicant.email, db.DEMO_ACCOUNTS.applicant.password],
  [db.DEMO_ACCOUNTS.admin.email, db.DEMO_ACCOUNTS.admin.password]
])

export const authService = {
  async login(email: string, password: string): Promise<Session> {
    if (!isDemoMode()) return api<Session>('/auth/login', { method: 'POST', body: { email, password } })
    await db.delay()
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase())
    if (!user || demoPasswords.get(user.email) !== password) throw new ApiError('Invalid email or password.', 401)
    return { token: `demo-${user.id}`, user }
  },

  async register(payload: RegisterPayload): Promise<Session> {
    if (!isDemoMode()) return api<Session>('/auth/register', { method: 'POST', body: payload })
    await db.delay()
    if (db.users.some(u => u.email.toLowerCase() === payload.email.toLowerCase())) {
      throw new ApiError('An account with this email already exists.', 409)
    }
    const user: User = { id: `u-${Date.now()}`, fullName: payload.fullName, email: payload.email, phone: payload.phone, role: 'applicant' }
    db.users.push(user)
    demoPasswords.set(user.email, payload.password)
    db.profiles.push({
      id: user.id, fullName: user.fullName, email: user.email, phone: payload.phone, country: '', city: '', institution: '',
      fieldOfStudy: '', qualification: '', academicStatus: '', graduationYear: null, skills: [], bio: '',
      githubUrl: '', linkedinUrl: '', portfolioUrl: ''
    })
    return { token: `demo-${user.id}`, user }
  },

  async forgotPassword(email: string): Promise<void> {
    if (!isDemoMode()) return api('/auth/forgot-password', { method: 'POST', body: { email } })
    await db.delay() // Demo mode: no email is sent.
  },

  async resetPassword(token: string, password: string): Promise<void> {
    if (!isDemoMode()) return api('/auth/reset-password', { method: 'POST', body: { token, password } })
    await db.delay() // Demo mode: nothing is changed.
  },

  async changePassword(email: string, currentPassword: string, newPassword: string): Promise<void> {
    if (!isDemoMode()) return api('/auth/change-password', { method: 'POST', body: { currentPassword, newPassword } })
    await db.delay()
    if (demoPasswords.get(email) !== currentPassword) throw new ApiError('Current password is incorrect.', 400)
    demoPasswords.set(email, newPassword)
  },

  async logout(): Promise<void> {
    if (!isDemoMode()) await api('/auth/logout', { method: 'POST' }).catch(() => undefined)
  }
}
