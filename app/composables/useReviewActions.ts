import type { Application, ApplicationStatus } from '~/types/application'
import { useApplicationsStore } from '~/stores/applications'

export const REVIEW_ACTIONS: Array<{ status: ApplicationStatus; label: string; icon: string; severity: 'info' | 'warn' | 'success' | 'danger' | 'secondary' }> = [
  { status: 'under_review', label: 'Mark Under Review', icon: 'pi pi-search', severity: 'info' },
  { status: 'shortlisted', label: 'Shortlist', icon: 'pi pi-star', severity: 'warn' },
  { status: 'interview', label: 'Schedule Interview', icon: 'pi pi-calendar', severity: 'secondary' },
  { status: 'accepted', label: 'Accept', icon: 'pi pi-check', severity: 'success' },
  { status: 'rejected', label: 'Reject', icon: 'pi pi-times', severity: 'danger' }
]

interface DialogState {
  interview: { visible: boolean; app: Application | null; at: Date | null; note: string }
  reject: { visible: boolean; app: Application | null; note: string }
  busy: boolean
}

/**
 * Shared admin decision flow. Dialog state is global (useState) and rendered once by <ReviewDialogs />
 * in the admin layout, so tables and the review panel trigger identical dialogs.
 */
export function useReviewActions() {
  const state = useState<DialogState>('review-dialogs', () => ({
    interview: { visible: false, app: null, at: null, note: '' },
    reject: { visible: false, app: null, note: '' },
    busy: false
  }))
  const confirm = useConfirm()
  const toast = useToast()
  const store = useApplicationsStore()

  async function apply(app: Application, status: ApplicationStatus, extra: { note?: string; interviewAt?: string | null } = {}) {
    state.value.busy = true
    try {
      await store.updateStatus(app.id, { status, ...extra })
      toast.add({ severity: 'success', summary: `${app.reference}: ${STATUS_META[status].label}`, life: 3000 })
      return true
    } catch (e) {
      toast.add({ severity: 'error', summary: 'Could not update the application', detail: (e as Error).message, life: 5000 })
      return false
    } finally {
      state.value.busy = false
    }
  }

  function request(app: Application, status: ApplicationStatus) {
    if (status === 'interview') {
      state.value.interview = { visible: true, app, at: null, note: '' }
    } else if (status === 'rejected') {
      state.value.reject = { visible: true, app, note: '' }
    } else {
      const meta = REVIEW_ACTIONS.find(a => a.status === status)!
      confirm.require({
        header: meta.label,
        message: `${meta.label} for ${app.applicant.fullName} (${app.reference})? The applicant will be notified.`,
        icon: 'pi pi-question-circle',
        rejectProps: { label: 'Cancel', severity: 'secondary', outlined: true },
        acceptProps: { label: 'Confirm', severity: status === 'accepted' ? 'success' : undefined },
        accept: () => { void apply(app, status) }
      })
    }
  }

  async function submitInterview() {
    const { app, at, note } = state.value.interview
    if (!app || !at) return
    if (await apply(app, 'interview', { interviewAt: at.toISOString(), note: note || undefined })) state.value.interview.visible = false
  }

  async function submitReject() {
    const { app, note } = state.value.reject
    if (!app) return
    if (await apply(app, 'rejected', { note: note || undefined })) state.value.reject.visible = false
  }

  return { state, request, submitInterview, submitReject, actions: REVIEW_ACTIONS }
}
