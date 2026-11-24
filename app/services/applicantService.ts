import type { AppNotification, AppSettings } from '~/types/application'
import type { ApplicantProfile, ApplicantSummary } from '~/types/user'
import type { DepartmentId } from '~/types/department'
import { api } from './api'
import { rows, totalOf, fromProfile, fromSettings, toApplicantSummary, toNotification, toProfile, toSettings } from './mappers'

export interface ApplicantQuery { search?: string; institution?: string; fieldOfStudy?: string; page?: number; limit?: number }

export interface CoursePrice { department: DepartmentId; specialization: string; durationMonths: number; price: number; currency: string }

const toCoursePrice = (value: unknown): CoursePrice => {
  const raw = value && typeof value === 'object' ? value as Record<string, unknown> : {}
  const data = raw.price && typeof raw.price === 'object' ? raw.price as Record<string, unknown> : raw
  const amount = Number(data.price)
  if (!Number.isFinite(amount)) throw new Error('The price record does not contain a valid price.')
  return {
    department: (data.department ?? data.course) as DepartmentId,
    specialization: String(data.specialization ?? ''),
    durationMonths: Number(data.duration_months ?? data.durationMonths),
    price: amount,
    currency: String(data.currency ?? '')
  }
}

export const applicantService = {
  async getProfile(): Promise<ApplicantProfile> {
    return toProfile(await api('/applicant/profile'))
  },

  async saveProfile(data: ApplicantProfile): Promise<ApplicantProfile> {
    return toProfile(await api('/applicant/profile', { method: 'PUT', body: fromProfile(data) }))
  },

  /** Admin: applicants, filtered and paged by the server (`search`, `institution`, `field_of_study`, `page`, `limit`). */
  async listApplicants(params: ApplicantQuery = {}): Promise<{ items: ApplicantSummary[]; total: number }> {
    const query: Record<string, string> = {}
    if (params.search?.trim()) query.search = params.search.trim()
    if (params.institution?.trim()) query.institution = params.institution.trim()
    if (params.fieldOfStudy?.trim()) query.field_of_study = params.fieldOfStudy.trim()
    if (params.page) query.page = String(params.page)
    if (params.limit) query.limit = String(params.limit)
    const data = await api<unknown>('/applicants', { query })
    const items = rows(data, 'applicants').map(toApplicantSummary)
    // If the server reports no total, assume another page exists while this one is full.
    const limit = params.limit ?? 0
    const seen = ((params.page ?? 1) - 1) * limit + items.length
    return { items, total: totalOf(data) ?? (limit && items.length >= limit ? seen + 1 : seen) }
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
  },

  async getCoursePrice(department: DepartmentId, specialization: string, durationMonths: number): Promise<CoursePrice> {
    const response = await api<unknown>('/prices', { query: { department, specialization, duration_months: String(durationMonths) } })
    const raw = response && typeof response === 'object' ? response as Record<string, unknown> : {}
    const records = Array.isArray(response) ? response : Array.isArray(raw.data) ? raw.data : Array.isArray(raw.prices) ? raw.prices : null
    const match = records?.find((item) => {
      if (!item || typeof item !== 'object') return false
      const row = item as Record<string, unknown>
      return row.department === department
        && row.specialization === specialization
        && Number(row.duration_months ?? row.durationMonths) === durationMonths
    })
    if (records && !match) throw new Error(`No price is set for ${department} / ${specialization} / ${durationMonths} months.`)
    return toCoursePrice(match ?? response)
  },

  async saveCoursePrice(data: CoursePrice): Promise<CoursePrice> {
    return toCoursePrice(await api('/prices', { method: 'PUT', body: {
      department: data.department, specialization: data.specialization,
      duration_months: data.durationMonths, price: data.price, currency: data.currency
    } }))
  }
}
