import type { Application, DocumentType, NewApplicationPayload, StatusUpdatePayload } from '~/types/application'
import { SESSION_CAPACITY, bookingsFrom, seatsFor, usesSeat, type Booking } from '~/utils/sessions'
import { api, ApiError, isDemoMode } from './api'
import * as db from './mock/db'

const STATUS_MESSAGES: Record<string, string> = {
  under_review: 'A reviewer has started looking at your application.',
  shortlisted: 'Your application has been shortlisted.',
  interview: 'An interview has been scheduled for your application.',
  accepted: 'Congratulations! Your application has been accepted.',
  rejected: 'Your application was not successful this time.'
}

const find = (id: string) => {
  const app = db.applications.find(a => a.id === id)
  if (!app) throw new ApiError('Application not found.', 404)
  return app
}

export const applicationService = {
  /** Applicant: their own applications. */
  async listMine(userId: string): Promise<Application[]> {
    if (!isDemoMode()) return api<Application[]>('/applications/mine')
    await db.delay()
    return db.applications.filter(a => a.applicant.id === userId).map(a => structuredClone(a))
  },

  /** Admin: every application. */
  async listAll(): Promise<Application[]> {
    if (!isDemoMode()) return api<Application[]>('/applications')
    await db.delay()
    return db.applications.map(a => structuredClone(a))
  },

  async get(id: string): Promise<Application> {
    if (!isDemoMode()) return api<Application>(`/applications/${id}`)
    await db.delay(200)
    return structuredClone(find(id))
  },

  /** Anonymous on-site/hybrid seat bookings (start, duration, session) across all applicants. */
  async availability(): Promise<Booking[]> {
    if (!isDemoMode()) return api<Booking[]>('/sessions/bookings')
    await db.delay(150)
    return bookingsFrom(db.applications)
  },

  /** Real mode sends multipart: a JSON `payload` field plus one file field per document type. */
  async create(userId: string, payload: NewApplicationPayload, files: Partial<Record<DocumentType, File>> = {}): Promise<Application> {
    if (!isDemoMode()) {
      const form = new FormData()
      form.append('payload', JSON.stringify(payload))
      Object.entries(files).forEach(([type, file]) => { if (file) form.append(type, file, file.name) })
      return api<Application>('/applications', { method: 'POST', body: form })
    }
    await db.delay(700)
    if (payload.startDate && usesSeat(payload.workMode) &&
      seatsFor(bookingsFrom(db.applications), payload.session, new Date(payload.startDate), payload.durationMonths) <= 0) {
      throw new ApiError(`That session is full for your internship period (${SESSION_CAPACITY} on-site/hybrid students at a time). Choose the other session, a later starting date, or remote work.`, 409)
    }
    const profile = db.profiles.find(p => p.id === userId)
    if (!profile) throw new ApiError('Profile not found.', 404)
    const now = new Date().toISOString()
    const reference = db.nextReference()
    const app: Application = {
      id: reference.toLowerCase(), reference, applicant: structuredClone(profile),
      ...payload, status: 'submitted', submittedAt: now, interviewAt: null,
      history: [{ status: 'submitted', at: now, note: 'Application received.' }], notes: []
    }
    db.applications.unshift(app)
    return structuredClone(app)
  },

  async updateStatus(id: string, payload: StatusUpdatePayload): Promise<Application> {
    if (!isDemoMode()) return api<Application>(`/applications/${id}/status`, { method: 'PATCH', body: payload })
    await db.delay(300)
    const app = find(id)
    const at = new Date().toISOString()
    app.status = payload.status
    app.interviewAt = payload.status === 'interview' ? payload.interviewAt ?? null : app.interviewAt
    app.history.push({ status: payload.status, at, note: payload.note })
    if (app.applicant.id === 'u-demo' && STATUS_MESSAGES[payload.status]) {
      db.notifications.unshift({ id: `n-${Date.now()}`, title: `Application ${payload.status.replace('_', ' ')}`, message: STATUS_MESSAGES[payload.status]!, at, read: false })
    }
    return structuredClone(app)
  },

  async addNote(id: string, author: string, text: string): Promise<Application> {
    if (!isDemoMode()) return api<Application>(`/applications/${id}/notes`, { method: 'POST', body: { text } })
    await db.delay(200)
    const app = find(id)
    app.notes.unshift({ id: `n-${Date.now()}`, author, text, at: new Date().toISOString() })
    return structuredClone(app)
  }
}
