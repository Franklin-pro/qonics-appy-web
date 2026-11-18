import type { EducationLevel, SessionId, WorkMode } from '~/types/application'

/** Maximum on-site / hybrid students attending the same daily session at the same time. */
export const SESSION_CAPACITY = 6

export const SESSIONS: Array<{ id: SessionId; label: string; time: string }> = [
  { id: 'morning', label: 'Morning session', time: '09:00 – 11:00' },
  { id: 'afternoon', label: 'Afternoon session', time: '14:00 – 17:00' }
]

export const EDUCATION_LEVELS: Array<{ value: EducationLevel; label: string; icon: string }> = [
  { value: 'university', label: 'University', icon: 'pi pi-graduation-cap' },
  { value: 'high_school', label: 'High school', icon: 'pi pi-book' }
]

export const educationLabel = (v: EducationLevel | null | undefined) => EDUCATION_LEVELS.find(l => l.value === v)?.label ?? '—'
export const sessionLabel = (v: SessionId | null | undefined) => {
  const s = SESSIONS.find(x => x.id === v)
  return s ? `${s.label} (${s.time})` : '—'
}

/** Local yyyy-mm-dd (stable key for a picked date). */
export function dateKey(value: string | Date) {
  const d = typeof value === 'string' ? new Date(value) : value
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Remote interns can join any session; only on-site and hybrid interns take one of the limited seats. */
export const usesSeat = (mode: WorkMode | null | undefined) => mode !== 'remote'

/**
 * A seat is held for the whole internship: the intern attends Monday to Friday at the same daily
 * session from their starting date until `startDate + durationMonths`. So availability depends on
 * the session (time) and on who is attending during the period, not on one calendar day.
 */

/** A seat window from `GET /sessions/bookings`: `booked` seats of one session are held from startDate to endDate. */
export interface Booking { startDate: string; endDate: string; session: SessionId; booked: number; capacity: number }

const dayStart = (d: Date | string) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x }
const endOf = (start: Date, months: number) => { const x = new Date(start); x.setMonth(x.getMonth() + months); return x }

/** Free seats in `session` for an internship starting `start` and lasting `months` (the worst day in the period). */
export function seatsFor(bookings: Booking[], session: SessionId, start: Date, months: number) {
  const s0 = dayStart(start)
  const mine = { s: s0.getTime(), e: endOf(s0, months).getTime() }
  const forSession = bookings.filter(b => b.session === session)
  const capacity = forSession[0]?.capacity ?? SESSION_CAPACITY
  const overlapping = forSession
    .map(b => ({ s: dayStart(b.startDate).getTime(), e: dayStart(b.endDate).getTime(), n: b.booked }))
    .filter(b => b.s < mine.e && b.e > mine.s)
  // Concurrency only increases when another booking starts, so check the start of my period and each later start.
  const checkpoints = [mine.s, ...overlapping.filter(b => b.s > mine.s).map(b => b.s)]
  const peak = Math.max(0, ...checkpoints.map(t => overlapping.filter(b => b.s <= t && b.e > t).reduce((sum, b) => sum + b.n, 0)))
  return capacity - peak
}

export interface SlotSuggestion { date: Date; session: SessionId; left: number }

/** Alternatives: the other session on the same start date, then the earliest later start date for each session. */
export function suggestSlots(bookings: Booking[], start: Date, session: SessionId, months: number, limit = 4): SlotSuggestion[] {
  const out: SlotSuggestion[] = []
  const other = SESSIONS.find(s => s.id !== session)!.id
  const add = (d: Date, s: SessionId) => {
    const left = seatsFor(bookings, s, d, months)
    if (left > 0 && out.length < limit) out.push({ date: d, session: s, left })
    return left > 0
  }
  const found = new Set<SessionId>()
  // If the other session is free right away, no need to look for a later start for it.
  if (add(start, other)) found.add(other)
  for (let i = 1; i <= 365 && found.size < 2 && out.length < limit; i++) {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i)
    if (d.getDay() === 0 || d.getDay() === 6) continue
    for (const s of [session, other]) if (!found.has(s) && add(d, s)) found.add(s)
  }
  return out
}
