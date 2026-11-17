import type { ApplicationStatus } from '~/types/application'

export type TagSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast'

export const STATUS_META: Record<ApplicationStatus, { label: string; severity: TagSeverity; icon: string; color: string }> = {
  submitted: { label: 'Submitted', severity: 'secondary', icon: 'pi pi-send', color: '#64748b' },
  under_review: { label: 'Under Review', severity: 'info', icon: 'pi pi-search', color: '#2563eb' },
  shortlisted: { label: 'Shortlisted', severity: 'warn', icon: 'pi pi-star', color: '#d97706' },
  interview: { label: 'Interview', severity: 'contrast', icon: 'pi pi-calendar', color: '#06b6d4' },
  accepted: { label: 'Accepted', severity: 'success', icon: 'pi pi-check-circle', color: '#16a34a' },
  rejected: { label: 'Rejected', severity: 'danger', icon: 'pi pi-times-circle', color: '#dc2626' }
}

export const STATUS_KEYS = Object.keys(STATUS_META) as ApplicationStatus[]

export const STATUS_OPTIONS = STATUS_KEYS.map(value => ({ label: STATUS_META[value].label, value }))
