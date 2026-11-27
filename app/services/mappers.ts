import type { TrainingModule, TrainingPackage } from '~/types/training'
import type { Application, ApplicationDocument, AppNotification, AppSettings, DocumentType, ReviewNote, StatusEvent } from '~/types/application'
import type { ApplicantProfile, ApplicantSummary, Session, User } from '~/types/user'

/** The API speaks snake_case; the UI speaks camelCase. Everything crosses this boundary here. */
export type Raw = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any

const str = (v: unknown) => (typeof v === 'string' ? v : '')

export function toUser(r: Raw): User {
  return { id: String(r.id), fullName: str(r.full_name), email: str(r.email), phone: r.phone ?? undefined, role: r.role === 'admin' ? 'admin' : 'applicant' }
}

export const toSession = (r: Raw): Session => ({ token: r.token, user: toUser(r.user) })

export function toProfile(r: Raw): ApplicantProfile {
  return {
    id: String(r.id ?? r.user_id ?? ''), fullName: str(r.full_name), email: str(r.email), phone: str(r.phone), country: str(r.country), city: str(r.city),
    institution: str(r.institution), fieldOfStudy: str(r.field_of_study), qualification: str(r.qualification), academicStatus: str(r.academic_status),
    graduationYear: r.graduation_year ?? null, skills: Array.isArray(r.skills) ? r.skills : [], bio: str(r.bio),
    githubUrl: str(r.github_url), linkedinUrl: str(r.linkedin_url), portfolioUrl: str(r.portfolio_url)
  }
}

export const fromProfile = (p: ApplicantProfile) => ({
  full_name: p.fullName, email: p.email, phone: p.phone, country: p.country, city: p.city, institution: p.institution,
  field_of_study: p.fieldOfStudy, qualification: p.qualification, academic_status: p.academicStatus, graduation_year: p.graduationYear,
  skills: p.skills, bio: p.bio, github_url: p.githubUrl, linkedin_url: p.linkedinUrl, portfolio_url: p.portfolioUrl
})

export const toApplicantSummary = (r: Raw): ApplicantSummary => ({
  ...toProfile(r),
  registeredAt: str(r.registered_at ?? r.created_at),
  totalApplications: Number(r.total_applications ?? r.applications_count ?? 0)
})

const toDocument = (r: Raw): ApplicationDocument => ({
  id: String(r.file_id ?? r.id), type: (r.file_type ?? r.type) as DocumentType, name: str(r.file_name ?? r.name),
  size: Number(r.file_size ?? r.size ?? 0), uploadedAt: str(r.uploaded_at ?? r.created_at)
})

const toEvent = (r: Raw): StatusEvent => ({ status: r.status, at: str(r.at), note: r.note ?? undefined })
const toNote = (r: Raw): ReviewNote => ({ id: String(r.id ?? `${r.at}-${r.author}`), author: str(r.author), text: str(r.text), at: str(r.at) })

export function toApplication(r: Raw): Application {
  // List endpoints may embed the applicant as an object or as flat fields; accept both.
  const applicant = r.applicant
    ? toProfile(r.applicant)
    : toProfile({ id: r.applicant_id ?? r.user_id, full_name: r.full_name ?? r.applicant_name, email: r.email ?? r.applicant_email, phone: r.phone })
  return {
    id: String(r.id), reference: str(r.reference), applicant, department: r.department, specialization: str(r.specialization),
    packageId: r.package_id ?? null, packageName: str(r.package_name) || null,
    skills: Array.isArray(r.skills) ? r.skills.map(String) : [],
    amount: r.amount == null ? null : Number(r.amount),
    motivation: str(r.motivation), experience: str(r.experience), startDate: r.start_date ?? null, educationLevel: r.education_level,
    session: r.session, durationMonths: Number(r.duration_months), workMode: r.work_mode, status: r.status, submittedAt: str(r.submitted_at),
    interviewAt: r.interview_at ?? null,
    documents: Array.isArray(r.documents) ? r.documents.map(toDocument) : [],
    history: Array.isArray(r.history) ? r.history.map(toEvent) : [],
    notes: Array.isArray(r.notes) ? r.notes.map(toNote) : []
  }
}

export const toNotification = (r: Raw): AppNotification => ({ id: String(r.id), title: str(r.title), message: str(r.message), at: str(r.at), read: !!r.read })

export const toSettings = (r: Raw): AppSettings => ({
  applicationsOpen: !!(r.applications_open ?? r.application_open), closeOn: r.close_on || null, closureMessage: str(r.closure_message)
})

export const fromSettings = (s: AppSettings) => ({
  applications_open: s.applicationsOpen, close_on: s.closeOn ?? '', closure_message: s.closureMessage
})

/** List endpoints answer either with the array itself or with an object that holds it under `key` (e.g. `{ applications, summary }`). */
export function rows(data: unknown, key: string): Raw[] {
  if (Array.isArray(data)) return data
  const inner = (data as Raw | null | undefined)?.[key]
  return Array.isArray(inner) ? inner : []
}

/** Total number of matching rows when a paged response reports one (`total`, or inside `pagination` / `meta`). */
export function totalOf(data: unknown): number | undefined {
  if (Array.isArray(data) || !data || typeof data !== 'object') return undefined
  const d = data as Raw
  const n = d.total ?? d.total_count ?? d.pagination?.total ?? d.meta?.total
  return typeof n === 'number' ? n : undefined
}

export function toTrainingModule(r: Raw | string): TrainingModule {
  if (typeof r === 'string') return { id: r, name: r }
  return { id: String(r.id ?? r.name), name: str(r.name ?? r.title) }
}

export function toTrainingPackage(r: Raw): TrainingPackage {
  return {
    id: r.id, name: str(r.name), slug: str(r.slug), description: str(r.description),
    price: Math.trunc(Number(r.price)) || 0, currency: str(r.currency) || 'RWF', duration: str(r.duration ?? r.period) || null,
    // The API sends `skills` as plain strings (e.g. "3d-printing"); older shape used `modules`.
    modules: [r.skills, r.modules].find(Array.isArray)?.map(toTrainingModule) ?? [],
    recommended: !!(r.recommended ?? r.is_recommended), active: !!(r.active ?? r.is_active ?? true),
    displayOrder: Number(r.display_order ?? r.displayOrder ?? 0) || 0
  }
}
