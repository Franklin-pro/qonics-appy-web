<script setup lang="ts">
import { useSettingsStore } from '~/stores/settings'
import { applicantService } from '~/services/applicantService'
import { departmentOptions, getDepartment } from '~/utils/departments'
import type { DepartmentId } from '~/types/department'

definePageMeta({ layout: 'admin', middleware: ['auth', 'admin'] })
useHead({ title: 'Settings | Qonics Inc. Admin' })

const store = useSettingsStore()
const toast = useToast()
const open = ref(true)
const closeOn = ref<Date | null>(null)
const message = ref('')
const price = ref<number | null>(null)
const currency = ref('')
const priceDepartment = ref<DepartmentId>('software')
const priceSpecialization = ref(getDepartment('software')!.specializations[0]!.id)
const priceDuration = ref(3)
const specializationOptions = computed(() => getDepartment(priceDepartment.value)?.specializations.map(s => ({ label: s.name, value: s.id })) ?? [])
const durationOptions = [1, 2, 3, 4, 5, 6].map(months => ({ label: `${months} months`, value: months }))
const priceSaving = ref(false)
const priceLoaded = ref(false)
const today = new Date()

function fill() {
  open.value = store.settings.applicationsOpen
  closeOn.value = store.settings.closeOn ? new Date(store.settings.closeOn) : null
  message.value = store.settings.closureMessage
}
async function loadCoursePrice(department: DepartmentId, specialization: string, durationMonths: number) {
  priceLoaded.value = false
  try {
    const result = await applicantService.getCoursePrice(department, specialization, durationMonths)
    if (priceDepartment.value !== department || priceSpecialization.value !== specialization || priceDuration.value !== durationMonths) return
    price.value = result.price
    currency.value = result.currency
    priceLoaded.value = true
  } catch (e) {
    if (((e as { status?: number }).status === 404 || (e as Error).message.startsWith('No price is set for'))
      && priceDepartment.value === department && priceSpecialization.value === specialization && priceDuration.value === durationMonths) {
      price.value = null
      currency.value = ''
      priceLoaded.value = true
      return
    }
    toast.add({ severity: 'error', summary: 'Could not load course price', detail: (e as Error).message, life: 5000 })
  }
}

watch([priceDepartment, priceSpecialization, priceDuration], ([department, specialization, duration]) => {
  if (specialization) void loadCoursePrice(department, specialization, duration)
})
watch(priceDepartment, department => { priceSpecialization.value = getDepartment(department)?.specializations[0]?.id ?? '' })

onMounted(async () => {
  await store.fetch()
  fill()
  await loadCoursePrice(priceDepartment.value, priceSpecialization.value, priceDuration.value)
})

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

async function savePrice() {
  if (price.value === null || !Number.isFinite(price.value) || price.value < 0 || !currency.value.trim()) return
  priceSaving.value = true
  try {
    const saved = await applicantService.saveCoursePrice({
      department: priceDepartment.value, specialization: priceSpecialization.value,
      durationMonths: priceDuration.value, price: price.value, currency: currency.value.trim().toUpperCase()
    })
    price.value = saved.price
    currency.value = saved.currency
    toast.add({ severity: 'success', summary: 'Course price saved', detail: 'The price will be included in new applications.', life: 3000 })
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Could not save course price', detail: (e as Error).message, life: 5000 })
  } finally {
    priceSaving.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-2xl">
    <PageHeader title="Settings" subtitle="Control internship application availability." />
    <Tabs value="availability">
      <TabList>
        <Tab value="availability">Application availability</Tab>
        <Tab value="price">Course price</Tab>
      </TabList>
      <TabPanels>
        <TabPanel value="availability">
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
        </TabPanel>
        <TabPanel value="price">
          <Card>
            <template #title><span class="text-base">Course price</span></template>
            <template #content>
              <form class="space-y-6" novalidate @submit.prevent="savePrice">
                <AppField id="priceDepartment" label="Course">
                  <Select v-model="priceDepartment" input-id="priceDepartment" :options="departmentOptions" option-label="label" option-value="value" fluid />
                </AppField>
                <AppField id="priceSpecialization" label="Specialization">
                  <Select v-model="priceSpecialization" input-id="priceSpecialization" :options="specializationOptions" option-label="label" option-value="value" :disabled="!priceDepartment" fluid />
                </AppField>
                <AppField id="priceDuration" label="Duration">
                  <Select v-model="priceDuration" input-id="priceDuration" :options="durationOptions" option-label="label" option-value="value" fluid />
                </AppField>
                <AppField id="price" label="Price" hint="Set the total price for this course, specialization, and duration.">
                  <InputNumber v-model="price" input-id="price" :min="0" :min-fraction-digits="0" :max-fraction-digits="0" :disabled="!priceLoaded" fluid />
                </AppField>
                <AppField id="currency" label="Currency" hint="Use the three-letter currency code, such as RWF.">
                  <InputText id="currency" v-model="currency" maxlength="3" :disabled="!priceLoaded" fluid />
                </AppField>
                <div class="flex justify-end">
                  <Button type="submit" label="Save price" icon="pi pi-check" :loading="priceSaving" :disabled="!priceLoaded" />
                </div>
              </form>
            </template>
          </Card>
        </TabPanel>
      </TabPanels>
    </Tabs>
  </div>
</template>
