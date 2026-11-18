import { defineStore } from 'pinia'
import type { Application, DocumentType, NewApplicationPayload, StatusUpdatePayload } from '~/types/application'
import type { ApplicantSummary } from '~/types/user'
import type { Booking } from '~/utils/sessions'
import { applicationService } from '~/services/applicationService'
import { applicantService } from '~/services/applicantService'

export const useApplicationsStore = defineStore('applications', () => {
  const items = ref<Application[]>([])
  const applicants = ref<ApplicantSummary[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function run<T>(fn: () => Promise<T>) {
    loading.value = true
    error.value = null
    try {
      return await fn()
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      loading.value = false
    }
  }

  const fetchMine = () => run(async () => { items.value = await applicationService.listMine() })
  const fetchAll = () => run(async () => { items.value = await applicationService.listAll() })
  const fetchApplicants = () => run(async () => { applicants.value = await applicantService.listApplicants() })

  function upsert(app: Application) {
    const i = items.value.findIndex(a => a.id === app.id)
    if (i >= 0) items.value[i] = app
    else items.value.unshift(app)
    return app
  }

  async function fetchOne(id: string) {
    const app = await applicationService.get(id)
    return upsert(app)
  }

  async function create(payload: NewApplicationPayload, files: Partial<Record<DocumentType, File>> = {}) {
    return upsert(await applicationService.create(payload, files))
  }

  async function updateStatus(id: string, payload: StatusUpdatePayload) {
    return upsert(await applicationService.updateStatus(id, payload))
  }

  async function addNote(id: string, text: string) {
    return upsert(await applicationService.addNote(id, text))
  }

  const availability = ref<Booking[]>([])
  async function fetchAvailability() {
    availability.value = await applicationService.availability()
  }

  const byId = (id: string) => items.value.find(a => a.id === id)

  return { items, applicants, loading, error, fetchMine, fetchAll, fetchApplicants, fetchOne, availability, fetchAvailability, create, updateStatus, addNote, byId }
})
