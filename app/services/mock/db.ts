/**
 * DEMO DATA ONLY. Used when NUXT_PUBLIC_API_BASE is not set.
 * Everything here lives in memory and is reset on page reload; nothing is sent anywhere.
 */
import type {
  Application, ApplicationStatus, AppNotification, AppSettings, ApplicationDocument, StatusEvent
} from '~/types/application'
import type { ApplicantProfile, User } from '~/types/user'
import { DEPARTMENTS } from '~/utils/departments'
import { SESSION_CAPACITY } from '~/utils/sessions'

export const DEMO_ACCOUNTS = {
  applicant: { email: 'applicant@demo.qonics', password: 'Demo1234!' },
  admin: { email: 'admin@demo.qonics', password: 'Demo1234!' }
}

// Small deterministic PRNG so the demo data is stable between reloads.
let seed = 42
const rand = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296 }
const pick = <T>(list: T[]): T => list[Math.floor(rand() * list.length)]!

const DAY = 86400000
const daysAgo = (n: number, hour = 10) => {
  const d = new Date(Date.now() - n * DAY)
  d.setHours(hour, Math.floor(rand() * 60), 0, 0)
  return d.toISOString()
}

const NAMES = [
  'Amara Okafor', 'Liam Johnson', 'Sofia Martins', 'Kwame Mensah', 'Aisha Bello', 'Daniel Kimani',
  'Grace Mwangi', 'Noah Patel', 'Fatima Hassan', 'Ethan Brown', 'Zainab Yusuf', 'Lucas Silva',
  'Chiamaka Eze', 'Omar Farouk', 'Hannah Lee', 'Tendai Moyo', 'Priya Sharma', 'Samuel Adeyemi',
  'Layla Ahmed', 'Joseph Otieno', 'Mia Rossi', 'David Nkosi', 'Esther Banda', 'Yusuf Demir'
]
const INSTITUTIONS = ['University of Nairobi', 'University of Lagos', 'KNUST Ghana', 'University of Cape Town', 'Makerere University', 'University of Ibadan', 'Strathmore University']
const FIELDS = ['Computer Science', 'Software Engineering', 'Electrical Engineering', 'Information Technology', 'Computer Engineering', 'Mechatronics']
const SOFT_SKILLS = ['Vue', 'TypeScript', 'Node.js', 'Python', 'PostgreSQL', 'React Native', 'Docker', 'Flutter']
const IOT_SKILLS = ['C/C++', 'Arduino', 'ESP32', 'MQTT', 'PCB design', 'Python', 'Sensors', 'FreeRTOS']
const COUNTRIES: Array<[string, string]> = [['Kenya', 'Nairobi'], ['Nigeria', 'Lagos'], ['Ghana', 'Kumasi'], ['South Africa', 'Cape Town'], ['Uganda', 'Kampala']]

function makeProfile(i: number, name: string, email?: string): ApplicantProfile {
  const [country, city] = pick(COUNTRIES)
  const slug = name.toLowerCase().replace(/\s+/g, '')
  const iot = i % 3 === 0
  return {
    id: `u-${i}`,
    fullName: name,
    email: email ?? `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
    phone: `+254 7${Math.floor(10000000 + rand() * 89999999)}`,
    country, city,
    institution: pick(INSTITUTIONS),
    fieldOfStudy: pick(FIELDS),
    qualification: pick(['BSc', 'BEng', 'Diploma', 'MSc']),
    academicStatus: pick(['Undergraduate', 'Final-year student', 'Recent graduate']),
    graduationYear: pick([2026, 2027, 2025]),
    skills: [...(iot ? IOT_SKILLS : SOFT_SKILLS)].sort(() => rand() - 0.5).slice(0, 4),
    bio: 'Curious builder who enjoys turning ideas into working products and learning from experienced teams.',
    githubUrl: `https://github.com/${slug}`,
    linkedinUrl: `https://linkedin.com/in/${slug}`,
    portfolioUrl: ''
  }
}

const DEMO_APPLICANT_PROFILE: ApplicantProfile = {
  ...makeProfile(0, 'Demo Applicant', DEMO_ACCOUNTS.applicant.email),
  id: 'u-demo', country: 'Kenya', city: 'Nairobi', institution: 'University of Nairobi',
  fieldOfStudy: 'Computer Science', qualification: 'BSc', academicStatus: 'Final-year student', graduationYear: 2026
}

export const users: User[] = [
  { id: 'u-demo', fullName: 'Demo Applicant', email: DEMO_ACCOUNTS.applicant.email, phone: DEMO_APPLICANT_PROFILE.phone, role: 'applicant' },
  { id: 'a-1', fullName: 'Demo Administrator', email: DEMO_ACCOUNTS.admin.email, role: 'admin' }
]

export const profiles: ApplicantProfile[] = [
  DEMO_APPLICANT_PROFILE,
  ...NAMES.map((n, i) => makeProfile(i + 1, n))
]
const registeredAt = new Map(profiles.map((p, i) => [p.id, daysAgo(20 + i * 6)]))
export const registrationDate = (id: string) => registeredAt.get(id) ?? new Date().toISOString()

const FLOW: ApplicationStatus[] = ['submitted', 'under_review', 'shortlisted', 'interview', 'accepted']
const DOCS: Array<[ApplicationDocument['type'], string]> = [['cv', 'CV_Resume.pdf'], ['transcript', 'Academic_Transcript.pdf'], ['certificates', 'Certificates.pdf'], ['cover_letter', 'Cover_Letter.pdf']]

export function buildHistory(finalStatus: ApplicationStatus, submittedAt: string): StatusEvent[] {
  const events: StatusEvent[] = [{ status: 'submitted', at: submittedAt, note: 'Application received.' }]
  const submitted = new Date(submittedAt).getTime()
  const path = finalStatus === 'rejected' ? ['under_review', 'rejected'] : FLOW.slice(1, FLOW.indexOf(finalStatus) + 1)
  path.forEach((status, i) => {
    events.push({ status: status as ApplicationStatus, at: new Date(Math.min(Date.now(), submitted + (i + 1) * 3 * DAY)).toISOString() })
  })
  return events
}

export function makeDocuments(submittedAt: string, withOptional = rand() > 0.5): ApplicationDocument[] {
  return DOCS.filter(([t]) => withOptional || t === 'cv' || t === 'transcript').map(([type, name], i) => ({
    id: `d-${Math.floor(rand() * 1e6)}-${i}`, type, name, size: Math.floor(120000 + rand() * 900000), uploadedAt: submittedAt
  }))
}

/** The nth upcoming weekday (1 = next weekday), as an ISO string at local midnight. */
export function weekdayAhead(n: number) {
  const d = new Date(); d.setHours(0, 0, 0, 0)
  while (n > 0) { d.setDate(d.getDate() + 1); if (d.getDay() !== 0 && d.getDay() !== 6) n-- }
  return d.toISOString()
}

let refCounter = 0
export function nextReference(date = new Date()) {
  refCounter++
  return `QON-${date.getFullYear()}-${String(refCounter).padStart(4, '0')}`
}

const STATUS_WEIGHTS: ApplicationStatus[] = ['submitted', 'submitted', 'under_review', 'under_review', 'under_review', 'shortlisted', 'shortlisted', 'interview', 'accepted', 'rejected', 'rejected']

function makeApplication(profile: ApplicantProfile, ageDays: number, status: ApplicationStatus, deptIndex?: number): Application {
  const dept = DEPARTMENTS[deptIndex ?? (rand() > 0.55 ? 0 : 1)]!
  const spec = pick(dept.specializations)
  const submittedAt = daysAgo(ageDays)
  const reference = nextReference(new Date(submittedAt))
  return {
    id: reference.toLowerCase(),
    reference,
    applicant: profile,
    department: dept.id,
    specialization: spec.id,
    motivation: `I want to grow as a ${spec.name.toLowerCase()} intern at Qonics Inc. My coursework and personal projects have prepared me to contribute, and I am eager to learn from your engineers while delivering real work.`,
    experience: 'Built several course and personal projects, including a final-year project that I deployed and presented to a panel.',
    startDate: weekdayAhead(1 + Math.floor(rand() * 150)),
    educationLevel: rand() > 0.3 ? 'university' : 'high_school',
    session: rand() > 0.5 ? 'morning' : 'afternoon',
    durationMonths: 3,
    workMode: rand() < 0.75 ? 'remote' : pick(['onsite', 'hybrid'] as const),
    status,
    submittedAt,
    interviewAt: status === 'interview' ? new Date(Date.now() + 5 * DAY).toISOString() : null,
    documents: makeDocuments(submittedAt),
    history: buildHistory(status, submittedAt),
    notes: status === 'submitted' ? [] : [{ id: `n-${reference}`, author: 'Demo Administrator', text: 'Solid profile; review portfolio before shortlisting.', at: submittedAt }]
  }
}

export const applications: Application[] = (() => {
  const list: Application[] = []
  // Demo applicant: a spread of statuses so every state is visible in the portal.
  ;(['accepted', 'shortlisted', 'under_review', 'submitted'] as ApplicationStatus[]).forEach((s, i) => {
    list.push(makeApplication(DEMO_APPLICANT_PROFILE, 40 - i * 12, s, i % 2))
  })
  for (let i = 0; i < 40; i++) {
    list.push(makeApplication(pick(profiles.slice(1)), Math.floor(rand() * 170) + 1, pick(STATUS_WEIGHTS)))
  }
  // Demo: one slot (3rd upcoming weekday, morning) is already at capacity so the "full" flow can be tried.
  list.filter(a => a.applicant.id !== 'u-demo' && a.status !== 'rejected').slice(0, SESSION_CAPACITY).forEach((a) => {
    a.startDate = weekdayAhead(3)
    a.session = 'morning'
    a.workMode = 'onsite'
    a.durationMonths = 3
  })
  return list
})()

export const notifications: AppNotification[] = [
  { id: 'n1', title: 'Application shortlisted', message: 'Your application has been shortlisted. Expect an interview invitation soon.', at: daysAgo(3), read: false },
  { id: 'n2', title: 'Application under review', message: 'A reviewer has started looking at your application.', at: daysAgo(9), read: false },
  { id: 'n3', title: 'Welcome to Qonics Inc.', message: 'Complete your profile to speed up future applications.', at: daysAgo(30), read: true }
]

export const settings: AppSettings = {
  applicationsOpen: true,
  closeOn: null,
  closureMessage: 'Applications are temporarily paused. Please check back soon.'
}

export const delay = (ms = 350) => new Promise(resolve => setTimeout(resolve, ms))
