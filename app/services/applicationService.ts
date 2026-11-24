import type { Application, DocumentType, NewApplicationPayload, StatusUpdatePayload } from '~/types/application'
import { SESSION_CAPACITY, type Booking } from '~/utils/sessions'
import { api, ApiError } from './api'
import { rows, toApplication } from './mappers'

interface PresignedUpload { presigned_url: string; file_id: string; guest_token?: string }

/**
 * Upload one file: get a presigned URL, then PUT the bytes through the same-origin
 * `/api/r2` proxy. Routing through the Nuxt server avoids the browser CORS preflight to
 * R2, so the bucket needs no CORS policy. Returns what confirm-upload needs.
 */
async function uploadFile(type: DocumentType, file: File, guestToken?: string): Promise<{ fileId: string; file: File; guestToken?: string }> {
  const isGuest = guestToken !== undefined
  const slot = await api<PresignedUpload>(isGuest ? '/files/guest/presigned-url' : '/files/presigned-url', {
    method: 'POST', body: {
      file_name: file.name, file_type: type, file_size: file.size,
      ...(isGuest && guestToken ? { guest_token: guestToken } : {})
    }
  })
  const proxyUrl = `/api/r2?url=${encodeURIComponent(slot.presigned_url)}`
  const put = await fetch(proxyUrl, { method: 'PUT', body: file, headers: file.type ? { 'Content-Type': file.type } : {} })
  if (!put.ok) throw new ApiError(`Could not upload ${file.name} (storage answered ${put.status}).`, put.status)
  return { fileId: slot.file_id, file, guestToken: slot.guest_token ?? guestToken }
}

export interface ApplicationQuery { search?: string; reference?: string; status?: string; department?: string; submittedFrom?: string; submittedTo?: string }

export const applicationService = {
  /** Applicant: their own applications. */
  async listMine(): Promise<Application[]> {
    return rows(await api('/applications/mine'), 'applications').map(toApplication)
  },

  /** Admin: applications, filtered by the server (`search`, `reference`, `status`, `department`, `submitted_from`, `submitted_to`). */
  async listAll(params: ApplicationQuery = {}): Promise<Application[]> {
    const query: Record<string, string> = {}
    if (params.search?.trim()) query.search = params.search.trim()
    if (params.reference?.trim()) query.reference = params.reference.trim()
    if (params.status) query.status = params.status
    if (params.department) query.department = params.department
    if (params.submittedFrom) query.submitted_from = params.submittedFrom
    if (params.submittedTo) query.submitted_to = params.submittedTo
    return rows(await api('/applications', { query }), 'applications').map(toApplication)
  },

  async get(id: string): Promise<Application> {
    return toApplication(await api(`/applications/${id}`))
  },

  /** Public seat availability; this endpoint also works before an applicant signs in. */
  async availability(): Promise<Booking[]> {
    const data = await api<unknown>('/sessions/bookings')
    return rows(data, 'bookings').map(booking => {
      const capacity = Number(booking.capacity ?? SESSION_CAPACITY)
      const availableSeats = booking.available_seats ?? booking.availableSeats
      return {
        startDate: String(booking.start_date ?? booking.startDate ?? ''),
        endDate: String(booking.end_date ?? booking.endDate ?? ''),
        session: booking.session,
        booked: Number(booking.booked ?? booking.booked_seats ?? booking.count ?? (availableSeats != null ? capacity - Number(availableSeats) : 0)),
        capacity
      }
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
    const isGuest = !!(payload.fullName && payload.email && payload.phone)
    let guestToken: string | undefined
    const uploaded: Array<{ fileId: string; file: File }> = []
    // Guest uploads share a token returned by the first presign request, so upload them in order.
    for (const [type, file] of entries) {
      const result = await uploadFile(type, file, isGuest ? guestToken ?? '' : undefined)
      guestToken = result.guestToken
      uploaded.push(result)
    }
    for (const u of uploaded) {
      await api(isGuest ? '/files/guest/confirm-upload' : '/files/confirm-upload', {
        method: 'POST', body: { file_id: u.fileId, ...(isGuest ? { guest_token: guestToken } : {}) }
      })
    }
    return toApplication(await api('/applications', {
      method: 'POST',
      body: {
        department: payload.department, specialization: payload.specialization, motivation: payload.motivation, experience: payload.experience,
        start_date: payload.startDate, education_level: payload.educationLevel, session: payload.session,
        duration_months: payload.durationMonths, work_mode: payload.workMode, document_ids: uploaded.map(u => u.fileId),
        price: payload.price, currency: payload.currency,
        ...(isGuest ? {
          full_name: payload.fullName, email: payload.email, phone: payload.phone,
          ...(guestToken ? { guest_token: guestToken } : {})
        } : {})
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
