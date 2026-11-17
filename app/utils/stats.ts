import type { Application, ApplicationStatus } from '~/types/application'
import { STATUS_KEYS } from './status'
import { DEPARTMENTS } from './departments'

export function countByStatus(apps: Application[]) {
  const counts = Object.fromEntries(STATUS_KEYS.map(k => [k, 0])) as Record<ApplicationStatus, number>
  apps.forEach(a => { counts[a.status]++ })
  return counts
}

export function countByDepartment(apps: Application[]) {
  return DEPARTMENTS.map(d => ({ id: d.id, name: d.name, count: apps.filter(a => a.department === d.id).length }))
}

/** Applications per calendar month for the last `months` months (oldest first). */
export function monthlyTrend(apps: Application[], months = 6) {
  const now = new Date()
  const buckets = Array.from({ length: months }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1)
    return { key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString('en-GB', { month: 'short' }), count: 0 }
  })
  apps.forEach(a => {
    const d = new Date(a.submittedAt)
    const bucket = buckets.find(b => b.key === `${d.getFullYear()}-${d.getMonth()}`)
    if (bucket) bucket.count++
  })
  return buckets
}
