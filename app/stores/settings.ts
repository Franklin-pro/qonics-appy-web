import { defineStore } from 'pinia'
import type { AppSettings } from '~/types/application'
import { applicantService } from '~/services/applicantService'

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<AppSettings>({ applicationsOpen: true, closeOn: null, closureMessage: '' })
  const loaded = ref(false)
  const saving = ref(false)

  async function fetch() {
    try {
      settings.value = await applicantService.getSettings()
    } catch {
      // Keep the optimistic default (open) if settings cannot be read.
    } finally {
      loaded.value = true // pages wait on this flag, so it must be set even when the request fails
    }
  }

  async function save(data: AppSettings) {
    saving.value = true
    try {
      settings.value = await applicantService.saveSettings(data)
    } finally {
      saving.value = false
    }
  }

  /** Open unless an admin paused intake or the configured closing date has passed. */
  const isOpen = computed(() => {
    if (!settings.value.applicationsOpen) return false
    return !settings.value.closeOn || new Date(settings.value.closeOn).getTime() > Date.now()
  })

  return { settings, loaded, saving, isOpen, fetch, save }
})
