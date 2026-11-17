import { useApplicationsStore } from '~/stores/applications'

/** Applications plus derived stats for dashboards; works for both applicant and admin views. */
export function useApplications() {
  const store = useApplicationsStore()
  const items = computed(() => store.items)
  const statusCounts = computed(() => countByStatus(store.items))
  const departmentCounts = computed(() => countByDepartment(store.items))
  const trend = computed(() => monthlyTrend(store.items))
  const total = computed(() => store.items.length)
  const recent = computed(() =>
    [...store.items].sort((a, b) => +new Date(b.submittedAt) - +new Date(a.submittedAt)).slice(0, 6)
  )
  /** Applications still awaiting a first review action. */
  const newCount = computed(() => statusCounts.value.submitted)
  return { store, items, total, recent, newCount, statusCounts, departmentCounts, trend }
}
