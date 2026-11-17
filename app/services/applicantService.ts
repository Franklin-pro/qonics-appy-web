import type { AppNotification, AppSettings } from '~/types/application'
import type { ApplicantProfile, ApplicantSummary } from '~/types/user'
import { api, ApiError, isDemoMode } from './api'
import * as db from './mock/db'

export const applicantService = {
  async getProfile(userId: string): Promise<ApplicantProfile> {
    if (!isDemoMode()) return api<ApplicantProfile>('/applicant/profile')
    await db.delay(200)
    const profile = db.profiles.find(p => p.id === userId)
    if (!profile) throw new ApiError('Profile not found.', 404)
    return structuredClone(profile)
  },

  async saveProfile(userId: string, data: ApplicantProfile): Promise<ApplicantProfile> {
    if (!isDemoMode()) return api<ApplicantProfile>('/applicant/profile', { method: 'PUT', body: data })
    await db.delay(500)
    const idx = db.profiles.findIndex(p => p.id === userId)
    if (idx < 0) throw new ApiError('Profile not found.', 404)
    db.profiles[idx] = { ...data, id: userId }
    return structuredClone(db.profiles[idx]!)
  },

  /** Admin: all applicants with their application counts. */
  async listApplicants(): Promise<ApplicantSummary[]> {
    if (!isDemoMode()) return api<ApplicantSummary[]>('/applicants')
    await db.delay()
    return db.profiles.map(p => ({
      ...structuredClone(p),
      registeredAt: db.registrationDate(p.id),
      totalApplications: db.applications.filter(a => a.applicant.id === p.id).length
    }))
  },

  async listNotifications(): Promise<AppNotification[]> {
    if (!isDemoMode()) return api<AppNotification[]>('/notifications')
    await db.delay(200)
    return structuredClone(db.notifications)
  },

  async markNotificationsRead(ids: string[]): Promise<void> {
    if (!isDemoMode()) return api('/notifications/read', { method: 'POST', body: { ids } })
    db.notifications.forEach(n => { if (ids.includes(n.id)) n.read = true })
  },

  async getSettings(): Promise<AppSettings> {
    if (!isDemoMode()) return api<AppSettings>('/settings')
    return structuredClone(db.settings)
  },

  async saveSettings(data: AppSettings): Promise<AppSettings> {
    if (!isDemoMode()) return api<AppSettings>('/settings', { method: 'PUT', body: data })
    await db.delay(400)
    Object.assign(db.settings, data)
    return structuredClone(db.settings)
  }
}
