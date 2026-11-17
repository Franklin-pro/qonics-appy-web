import type { DepartmentId } from './department'
import type { ApplicantProfile } from './user'

export type ApplicationStatus = 'submitted' | 'under_review' | 'shortlisted' | 'interview' | 'accepted' | 'rejected'

export type DocumentType = 'cv' | 'transcript' | 'diploma' | 'certificates' | 'cover_letter'

export interface ApplicationDocument {
  id: string
  type: DocumentType
  name: string
  size: number
  uploadedAt: string
  /** Present only when the backend serves the file. */
  url?: string
}

export interface StatusEvent {
  status: ApplicationStatus
  at: string
  note?: string
}

export interface ReviewNote {
  id: string
  author: string
  text: string
  at: string
}

export type WorkMode = 'onsite' | 'remote' | 'hybrid'
export type EducationLevel = 'university' | 'high_school'
export type SessionId = 'morning' | 'afternoon'

export interface Application {
  id: string
  reference: string
  applicant: ApplicantProfile
  department: DepartmentId
  specialization: string
  motivation: string
  experience: string
  startDate: string | null
  educationLevel: EducationLevel
  session: SessionId
  durationMonths: number
  workMode: WorkMode
  status: ApplicationStatus
  submittedAt: string
  interviewAt?: string | null
  documents: ApplicationDocument[]
  history: StatusEvent[]
  notes: ReviewNote[]
}

export interface NewApplicationPayload {
  department: DepartmentId
  specialization: string
  motivation: string
  experience: string
  startDate: string | null
  educationLevel: EducationLevel
  session: SessionId
  durationMonths: number
  workMode: WorkMode
  documents: ApplicationDocument[]
}

export interface StatusUpdatePayload {
  status: ApplicationStatus
  note?: string
  interviewAt?: string | null
}

export interface AppNotification {
  id: string
  title: string
  message: string
  at: string
  read: boolean
}

export interface AppSettings {
  applicationsOpen: boolean
  closeOn: string | null
  closureMessage: string
}
