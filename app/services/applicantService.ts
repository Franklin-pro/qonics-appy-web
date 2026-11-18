import type { AppNotification, AppSettings } from '~/types/application'
import type { ApplicantProfile, ApplicantSummary } from '~/types/user'
import { api } from './api'
import { rows, fromProfile, fromSettings, toApplicantSummary, toNotification, toProfile, toSettings } from './mappers'

export const applicantService = {
  async getProfile(): Promise<ApplicantProfile> {
    return toProfile(await api('/applicant/profile'))
  },

  async saveProfile(data: ApplicantProfile): Promise<ApplicantProfile> {
    return toProfile(await api('/applicant/profile', { method: 'PUT', body: fromProfile(data) }))
  },

  /** Admin: all applicants. */
  async listApplicants(): Promise<ApplicantSummary[]> {
    return rows(await api('/applicants'), 'applicants').map(toApplicantSummary)
  },

  async listNotifications(): Promise<AppNotification[]> {
    return rows(await api('/notifications'), 'notifications').map(toNotification)
  },

  async markNotificationsRead(ids: string[]): Promise<void> {
    await api('/notifications/read', { method: 'POST', body: { ids } })
  },

  async getSettings(): Promise<AppSettings> {
    return toSettings(await api('/settings'))
  },

  async saveSettings(data: AppSettings): Promise<AppSettings> {
    return toSettings(await api('/settings', { method: 'PUT', body: fromSettings(data) }))
  }
}
