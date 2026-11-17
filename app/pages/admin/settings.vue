<script setup lang="ts">
import { useSettingsStore } from '~/stores/settings'

definePageMeta({ layout: 'admin', middleware: ['auth', 'admin'] })
useHead({ title: 'Settings | Qonics Inc. Admin' })

const store = useSettingsStore()
const toast = useToast()
const open = ref(true)
const closeOn = ref<Date | null>(null)
const message = ref('')
const today = new Date()

function fill() {
  open.value = store.settings.applicationsOpen
  closeOn.value = store.settings.closeOn ? new Date(store.settings.closeOn) : null
  message.value = store.settings.closureMessage
}
onMounted(async () => { await store.fetch(); fill() })

const messageError = computed(() => (!open.value && !message.value.trim() ? 'Add a message applicants will see while applications are paused.' : ''))

async function save() {
  if (messageError.value) return
  try {
    await store.save({ applicationsOpen: open.value, closeOn: closeOn.value ? closeOn.value.toISOString() : null, closureMessage: message.value.trim() })
    toast.add({ severity: 'success', summary: 'Settings saved', detail: open.value ? 'Applications are open.' : 'Applications are paused.', life: 3000 })
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Could not save settings', detail: (e as Error).message, life: 5000 })
  }
}
</script>

<template>
  <div class="mx-auto max-w-2xl">
    <PageHeader title="Settings" subtitle="Control internship application availability." />
    <Card>
      <template #title><span class="text-base">Application availability</span></template>
      <template #content>
        <form class="space-y-6" novalidate @submit.prevent="save">
          <div class="flex items-start justify-between gap-4 rounded-lg border border-line p-4">
            <div>
              <label for="open" class="font-medium text-navy">Accept applications</label>
              <p class="text-sm text-muted">Applications are open year-round unless you pause them.</p>
            </div>
            <ToggleSwitch v-model="open" input-id="open" />
          </div>
          <AppField id="closeOn" label="Automatically close on" hint="Optional. Leave empty to stay open until you pause intake.">
            <DatePicker v-model="closeOn" input-id="closeOn" :min-date="today" show-icon icon-display="input" show-button-bar date-format="dd M yy" :disabled="!open" fluid />
          </AppField>
          <AppField id="msg" label="Closure message" :error="messageError" hint="Shown to applicants when applications are closed.">
            <Textarea id="msg" v-model="message" rows="3" auto-resize :invalid="!!messageError" fluid />
          </AppField>
          <div class="flex items-center justify-between">
            <Tag :value="store.isOpen ? 'Currently open' : 'Currently closed'" :severity="store.isOpen ? 'success' : 'danger'" rounded />
            <Button type="submit" label="Save settings" icon="pi pi-check" :loading="store.saving" />
          </div>
        </form>
      </template>
    </Card>
  </div>
</template>
