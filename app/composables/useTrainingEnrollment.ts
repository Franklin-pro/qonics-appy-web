import type { TrainingEnrollmentInput } from '~/types/training'
import { trainingService } from '~/services/trainingService'

export function useTrainingEnrollment() {
  const submitting = ref(false)
  const error = ref('')

  /** Returns true on success. A second call while one is in flight is ignored. */
  async function submit(data: TrainingEnrollmentInput) {
    if (submitting.value) return false
    submitting.value = true
    error.value = ''
    try {
      await trainingService.submitTrainingEnrollment(data)
      return true
    } catch {
      error.value = 'We could not submit your enrollment. Please check your details and try again.'
      return false
    } finally {
      submitting.value = false
    }
  }
  return { submitting, error, submit }
}
