import { defineStore } from 'pinia'
import type { Application, DocumentType, NewApplicationPayload, StatusUpdatePayload } from '~/types/application'
import type { ApplicantSummary } from '~/types/user'
import type { Booking } from '~/utils/sessions'
import { applicationService, type ApplicationQuery } from '~/services/applicationService'
import { applicantService, type ApplicantQuery } from '~/services/applicantService'

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
  const fetchAll = (query: ApplicationQuery = {}) => run(async () => { items.value = await applicationService.listAll(query) })
  const applicantsTotal = ref(0)
  const fetchApplicants = (query: ApplicantQuery = {}) => run(async () => {
    const res = await applicantService.listApplicants(query)
    applicants.value = res.items
    applicantsTotal.value = res.total
  })

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

  return { items, applicants, applicantsTotal, loading, error, fetchMine, fetchAll, fetchApplicants, fetchOne, availability, fetchAvailability, create, updateStatus, addNote, byId }
})
