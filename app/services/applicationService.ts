import type { Application, DocumentType, NewApplicationPayload, StatusUpdatePayload } from '~/types/application'
import { SESSION_CAPACITY, usesSeat, type Booking } from '~/utils/sessions'
import { api, ApiError } from './api'
import { rows, toApplication } from './mappers'

interface PresignedUpload { presigned_url: string; file_id: string }

/**
 * Upload one file: get a presigned URL, then PUT the bytes through the same-origin
 * `/api/r2` proxy. Routing through the Nuxt server avoids the browser CORS preflight to
 * R2, so the bucket needs no CORS policy. Returns what confirm-upload needs.
 */
async function uploadFile(type: DocumentType, file: File): Promise<{ fileId: string; file: File }> {
  const slot = await api<PresignedUpload>('/files/presigned-url', {
    method: 'POST', body: { file_name: file.name, file_type: type, file_size: file.size }
  })
  const proxyUrl = `/api/r2?url=${encodeURIComponent(slot.presigned_url)}`
  const put = await fetch(proxyUrl, { method: 'PUT', body: file, headers: file.type ? { 'Content-Type': file.type } : {} })
  if (!put.ok) throw new ApiError(`Could not upload ${file.name} (storage answered ${put.status}).`, put.status)
  return { fileId: slot.file_id, file }
}

export const applicationService = {
  /** Applicant: their own applications. */
  async listMine(): Promise<Application[]> {
    return rows(await api('/applications/mine'), 'applications').map(toApplication)
  },

  /** Admin: every application. */
  async listAll(): Promise<Application[]> {
    return rows(await api('/applications'), 'applications').map(toApplication)
  },

  async get(id: string): Promise<Application> {
    return toApplication(await api(`/applications/${id}`))
  },

  /**
   * Seat windows built from the signed-in user's own applications (`GET /applications/mine`):
   * on-site/hybrid, not rejected. The server still enforces the real capacity on submit.
   */
  async availability(): Promise<Booking[]> {
    const mine = await this.listMine()
    return mine
      .filter(a => a.startDate && a.status !== 'rejected' && usesSeat(a.workMode))
      .map(a => {
        const end = new Date(a.startDate!)
        end.setMonth(end.getMonth() + a.durationMonths)
        return { startDate: a.startDate!, endDate: end.toISOString(), session: a.session, booked: 1, capacity: SESSION_CAPACITY }
      })
  },

  /**
   * Uploads each document, confirms it, then creates the application with the resulting
   * file ids. Confirmation must happen before creation: the backend rejects `document_ids`
   * that are not yet confirmed. The backend re-links the files to the application
   * (source_table / source_table_id) on create, so confirm only needs `file_id`.
   */
  async create(payload: NewApplicationPayload, files: Partial<Record<DocumentType, File>> = {}): Promise<Application> {
    const entries = Object.entries(files).filter((e): e is [DocumentType, File] => !!e[1])
    const uploaded = await Promise.all(entries.map(([type, file]) => uploadFile(type, file)))
    await Promise.all(uploaded.map(u => api('/files/confirm-upload', {
      method: 'POST', body: { file_id: u.fileId }
    })))
    return toApplication(await api('/applications', {
      method: 'POST',
      body: {
        department: payload.department, specialization: payload.specialization, motivation: payload.motivation, experience: payload.experience,
        start_date: payload.startDate, education_level: payload.educationLevel, session: payload.session,
        duration_months: payload.durationMonths, work_mode: payload.workMode, document_ids: uploaded.map(u => u.fileId)
      }
    }))
  },

  async updateStatus(id: string, payload: StatusUpdatePayload): Promise<Application> {
    return toApplication(await api(`/applications/${id}/status`, {
      method: 'PATCH', body: { status: payload.status, note: payload.note, interview_at: payload.interviewAt ?? undefined }
    }))
  },

  async addNote(id: string, text: string): Promise<Application> {
    return toApplication(await api(`/applications/${id}/notes`, { method: 'POST', body: { text } }))
  },

  /** Short-lived download link for a confirmed file (owner or admin). */
  async fileUrl(fileId: string): Promise<string> {
    return (await api<{ url: string }>(`/files/${fileId}/url`)).url
  }
}