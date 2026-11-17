import { defineStore } from 'pinia'
import type { ApplicantProfile } from '~/types/user'
import { applicantService } from '~/services/applicantService'

export const useApplicantStore = defineStore('applicant', () => {
  const profile = ref<ApplicantProfile | null>(null)
  const loading = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)

  async function fetchProfile(userId: string) {
    loading.value = true
    error.value = null
    try {
      profile.value = await applicantService.getProfile(userId)
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      loading.value = false
    }
  }

  async function saveProfile(userId: string, data: ApplicantProfile) {
    saving.value = true
    try {
      profile.value = await applicantService.saveProfile(userId, data)
    } finally {
      saving.value = false
    }
  }

  /** A profile is complete enough to apply once the academic basics are filled in. */
  const isComplete = computed(() => {
    const p = profile.value
    return !!p && !!p.institution && !!p.fieldOfStudy && !!p.academicStatus && p.skills.length > 0
  })

  return { profile, loading, saving, error, isComplete, fetchProfile, saveProfile }
})
