<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: ['auth', 'admin'] })
useHead({ title: 'Reports | Qonics Inc. Admin' })

const toast = useToast()
const { store, items } = useApplications()
onMounted(() => store.fetchAll())

const range = ref<Array<Date | null> | null>(null)
const department = ref<string | null>(null)

const filtered = computed(() => items.value.filter((a) => {
  if (department.value && a.department !== department.value) return false
  if (range.value?.[0]) {
    const start = new Date(range.value[0]); start.setHours(0, 0, 0, 0)
    const end = new Date(range.value[1] ?? range.value[0]); end.setHours(23, 59, 59, 999)
    const t = new Date(a.submittedAt).getTime()
    if (t < start.getTime() || t > end.getTime()) return false
  }
  return true
}))
const counts = computed(() => countByStatus(filtered.value))
const decided = computed(() => counts.value.accepted + counts.value.rejected)
const acceptRate = computed(() => (decided.value ? Math.round((counts.value.accepted / decided.value) * 100) : null))

function exportCsv() {
  if (!filtered.value.length) {
    toast.add({ severity: 'info', summary: 'Nothing to export', detail: 'No applications match the current filters.', life: 3000 })
    return
  }
  downloadCsv(`qonics-applications-${new Date().toISOString().slice(0, 10)}.csv`, filtered.value.map(a => ({
    Reference: a.reference, Applicant: a.applicant.fullName, Email: a.applicant.email,
    Institution: a.applicant.institution, Department: departmentName(a.department),
    Specialization: specializationName(a.department, a.specialization), Status: STATUS_META[a.status].label,
    'Education level': educationLabel(a.educationLevel), 'Starting date': formatDate(a.startDate), 'Daily session': sessionLabel(a.session),
    Submitted: formatDate(a.submittedAt)
  })))
  toast.add({ severity: 'success', summary: `Exported ${filtered.value.length} applications`, life: 3000 })
}
</script>

<template>
  <div>
    <PageHeader title="Reports" subtitle="Analyse intake and export data.">
      <Button label="Export CSV" icon="pi pi-download" :disabled="store.loading" @click="exportCsv" />
    </PageHeader>
    <ErrorState v-if="store.error" :message="store.error" class="mb-4" @retry="store.fetchAll()" />

    <div class="surface-card mb-4 flex flex-wrap items-end gap-3 p-4">
      <AppField id="rp-dept" label="Department" class="w-full sm:w-56">
        <Select v-model="department" input-id="rp-dept" :options="departmentOptions" option-label="label" option-value="value" placeholder="All departments" show-clear fluid />
      </AppField>
      <AppField id="rp-range" label="Submitted between" class="w-full sm:w-64">
        <DatePicker v-model="range" input-id="rp-range" selection-mode="range" date-format="dd M yy" show-button-bar show-icon icon-display="input" placeholder="Any date" fluid />
      </AppField>
      <p class="pb-2 text-sm text-muted">{{ filtered.length }} of {{ items.length }} applications</p>
    </div>

    <div class="mb-4 grid gap-4 sm:grid-cols-3">
      <StatCard label="Applications in range" :value="filtered.length" icon="pi pi-file-pdf" :loading="store.loading && !items.length" />
      <StatCard label="Accepted" :value="counts.accepted" icon="pi pi-check-circle" color="#16a34a" :loading="store.loading && !items.length" />
      <StatCard label="Acceptance rate (decided)" :value="acceptRate === null ? '—' : `${acceptRate}%`" icon="pi pi-percentage" color="#06b6d4" :loading="store.loading && !items.length" />
    </div>

    <DashboardCharts :applications="filtered" by-specialization />
  </div>
</template>
