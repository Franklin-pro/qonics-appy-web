export type UserRole = 'applicant' | 'admin'

export interface User {
  id: string
  fullName: string
  email: string
  phone?: string
  role: UserRole
}

export interface Session {
  token: string
  user: User
}

export interface ApplicantProfile {
  id: string
  fullName: string
  email: string
  phone: string
  country: string
  city: string
  institution: string
  fieldOfStudy: string
  qualification: string
  academicStatus: string
  graduationYear: number | null
  skills: string[]
  bio: string
  githubUrl: string
  linkedinUrl: string
  portfolioUrl: string
}

export interface ApplicantSummary extends ApplicantProfile {
  registeredAt: string
  totalApplications: number
}
