import type { TrainingModule, TrainingPackage } from '~/types/training'
import { trainingService } from '~/services/trainingService'

/** Loads a list with loading/error state and a retry. Not run on the server: the API is called from the browser. */
function useLoader<T>(fetcher: () => Promise<T[]>) {
  const items = ref<T[]>([]) as Ref<T[]>
  const loading = ref(true)
  const failed = ref(false)
  async function load() {
    loading.value = true
    failed.value = false
    try { items.value = await fetcher() } catch { failed.value = true } finally { loading.value = false }
  }
  onMounted(load)
  return { items, loading, failed, reload: load }
}

/** Public: active packages. */
export const useTrainingPackages = () => useLoader<TrainingPackage>(trainingService.getTrainingPackages)

/** Admin: all packages. */
export const useAdminTrainingPackages = () => useLoader<TrainingPackage>(trainingService.listAllPackages)

export const useTrainingModules = () => useLoader<TrainingModule>(trainingService.getTrainingModules)
