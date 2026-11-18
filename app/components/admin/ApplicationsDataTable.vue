<script setup lang="ts">
import { FilterMatchMode, FilterService } from '@primevue/core/api'
import type { Application, ApplicationStatus } from '~/types/application'

/**
 * The one management table for applications. `variant="admin"` shows applicant columns and decision
 * actions; `variant="applicant"` is the applicant's own list. `compact` drops filters and paging
 * (used for "recent applications" on the dashboard).
 */
const props = withDefaults(defineProps<{
  applications: Application[]
  loading?: boolean
  variant?: 'admin' | 'applicant'
  compact?: boolean
  rows?: number
  initialSearch?: string
}>(), { variant: 'admin', rows: 10 })

// Date-range matcher for the submission-date filter (a single pick matches that whole day).
FilterService.register('dateRange', (value: string, range: Array<Date | null> | null) => {
  if (!range?.[0]) return true
  const start = new Date(range[0]); start.setHours(0, 0, 0, 0)
  const end = new Date(range[1] ?? range[0]); end.setHours(23, 59, 59, 999)
  const d = new Date(value).getTime()
  return d >= start.getTime() && d <= end.getTime()
})

const isAdmin = computed(() => props.variant === 'admin')
const basePath = computed(() => (isAdmin.value ? '/admin/applications' : '/applicant/applications'))
const { request, actions } = useReviewActions()

const flatRows = computed(() => props.applications.map(a => ({
  ...a,
  applicantName: a.applicant.fullName,
  email: a.applicant.email,
  departmentName: departmentName(a.department),
  specializationLabel: specializationName(a.department, a.specialization)
})))
type Row = (typeof flatRows.value)[number]

const defaultFilters = () => ({
  global: { value: null as string | null, matchMode: FilterMatchMode.CONTAINS },
  department: { value: null as string | null, matchMode: FilterMatchMode.EQUALS },
  status: { value: null as ApplicationStatus | null, matchMode: FilterMatchMode.EQUALS },
  submittedAt: { value: null as Array<Date | null> | null, matchMode: 'dateRange' }
})
const filters = ref(defaultFilters())
const globalFields = ['reference', 'applicantName', 'email', 'departmentName', 'specializationLabel']

/**
 * Server mode: when the page passes `v-model:query`, the filter boxes edit that object (the page sends
 * it to the API as ?search, ?reference, ?status, ?department, ?submitted_from, ?submitted_to) and the
 * table shows whatever comes back. Without it the table filters its own rows in the browser.
 */
interface ServerQuery { search: string; reference: string; status: string | null; department: string | null; submittedFrom: string; submittedTo: string }
const query = defineModel<ServerQuery>('query')
const serverMode = computed(() => !!query.value)
if (!query.value) filters.value.global.value = props.initialSearch || null

const searchModel = computed<string | null>({
  get: () => (query.value ? query.value.search : filters.value.global.value),
  set: (v) => { if (query.value) query.value.search = v ?? ''; else filters.value.global.value = v }
})
const departmentModel = computed<string | null>({
  get: () => (query.value ? query.value.department : filters.value.department.value),
  set: (v) => { if (query.value) query.value.department = v ?? null; else filters.value.department.value = v }
})
const statusModel = computed<string | null>({
  get: () => (query.value ? query.value.status : filters.value.status.value),
  set: (v) => { if (query.value) query.value.status = v ?? null; else filters.value.status.value = v as ApplicationStatus | null }
})
const dateModel = computed<Array<Date | null> | null>({
  get: () => {
    if (!query.value) return filters.value.submittedAt.value
    const { submittedFrom, submittedTo } = query.value
    return submittedFrom ? [new Date(`${submittedFrom}T00:00:00`), submittedTo ? new Date(`${submittedTo}T00:00:00`) : null] : null
  },
  set: (v) => {
    if (!query.value) { filters.value.submittedAt.value = v; return }
    query.value.submittedFrom = v?.[0] ? dateKey(v[0]) : ''
    query.value.submittedTo = v?.[1] ? dateKey(v[1]) : (v?.[0] ? dateKey(v[0]) : '')
  }
})
const hasFilters = computed(() => query.value
  ? !!(query.value.search || query.value.reference || query.value.status || query.value.department || query.value.submittedFrom)
  : Object.values(filters.value).some(f => f.value && (!Array.isArray(f.value) || f.value[0])))
const resetFilters = () => {
  if (query.value) Object.assign(query.value, { search: '', reference: '', status: null, department: null, submittedFrom: '', submittedTo: '' })
  else filters.value = defaultFilters()
}

const menu = ref()
const menuRow = ref<Row | null>(null)
const menuItems = computed(() => {
  const row = menuRow.value
  if (!row) return []
  const items: Array<Record<string, unknown>> = [
    { label: 'View details', icon: 'pi pi-eye', command: () => navigateTo(`${basePath.value}/${row.id}`) }
  ]
  if (isAdmin.value) {
    items.push({ separator: true })
    actions.filter(a => a.status !== row.status).forEach(a =>
      items.push({ label: a.label, icon: a.icon, command: () => request(row, a.status) })
    )
  }
  return items
})
const openMenu = (event: Event, row: Row) => { menuRow.value = row; menu.value.toggle(event) }

const skeletonRows = Array.from({ length: 6 }, (_, i) => ({ id: `sk-${i}` })) as unknown as Row[]
const tableValue = computed(() => (props.loading && !flatRows.value.length ? skeletonRows : flatRows.value))
const showSkeleton = computed(() => props.loading && !flatRows.value.length)
</script>

<template>
  <DataTable
    v-model:filters="filters"
    :value="tableValue"
    data-key="id"
    class="q-table"
    size="small"
    :paginator="!compact"
    :rows="rows"
    :rows-per-page-options="[5, 10, 25, 50]"
    paginator-template="RowsPerPageDropdown FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
    current-page-report-template="{first}–{last} of {totalRecords}"
    :global-filter-fields="serverMode ? [] : globalFields"
    sort-field="submittedAt"
    :sort-order="-1"
    removable-sort
    scrollable
    :table-style="{ minWidth: isAdmin ? '66rem' : '46rem' }"
    row-hover
  >
    <template v-if="!compact" #header>
      <div class="flex flex-wrap items-center gap-2">
        <IconField class="w-full sm:w-64">
          <InputIcon class="pi pi-search" />
          <InputText v-model="searchModel" placeholder="Search applications" aria-label="Search applications" size="small" fluid />
        </IconField>
        <InputText v-if="query" v-model="query.reference" placeholder="Reference" aria-label="Filter by reference" size="small" class="w-full sm:w-40" />
        <Select v-model="departmentModel" :options="departmentOptions" option-label="label" option-value="value" placeholder="Department" show-clear size="small" class="w-full sm:w-52" aria-label="Filter by department" />
        <Select v-model="statusModel" :options="STATUS_OPTIONS" option-label="label" option-value="value" placeholder="Status" show-clear size="small" class="w-full sm:w-40" aria-label="Filter by status" />
        <DatePicker v-model="dateModel" selection-mode="range" date-format="dd M yy" placeholder="Submitted between" show-button-bar show-icon icon-display="input" size="small" class="w-full sm:w-56" input-id="date-filter" aria-label="Filter by submission date" />
        <Button v-if="hasFilters" label="Clear" icon="pi pi-filter-slash" severity="secondary" text size="small" @click="resetFilters" />
        <slot name="toolbar" />
      </div>
    </template>

    <Column field="reference" header="Reference" sortable>
      <template #body="{ data }">
        <Skeleton v-if="showSkeleton" width="6rem" />
        <NuxtLink v-else :to="`${basePath}/${data.id}`" class="whitespace-nowrap font-medium text-brand hover:underline">{{ data.reference }}</NuxtLink>
      </template>
    </Column>
    <Column v-if="isAdmin" field="applicantName" header="Applicant" sortable>
      <template #body="{ data }"><Skeleton v-if="showSkeleton" width="8rem" /><span v-else class="font-medium text-ink">{{ data.applicantName }}</span></template>
    </Column>
    <Column v-if="isAdmin" field="email" header="Email" sortable>
      <template #body="{ data }"><Skeleton v-if="showSkeleton" width="10rem" /><span v-else class="text-muted">{{ data.email }}</span></template>
    </Column>
    <Column field="departmentName" header="Department" sortable>
      <template #body="{ data }"><Skeleton v-if="showSkeleton" width="7rem" /><span v-else class="whitespace-nowrap">{{ data.departmentName }}</span></template>
    </Column>
    <Column field="specializationLabel" header="Specialization" sortable>
      <template #body="{ data }"><Skeleton v-if="showSkeleton" width="7rem" /><template v-else>{{ data.specializationLabel }}</template></template>
    </Column>
    <Column field="submittedAt" header="Submitted" sortable>
      <template #body="{ data }"><Skeleton v-if="showSkeleton" width="5rem" /><span v-else class="whitespace-nowrap">{{ formatDate(data.submittedAt) }}</span></template>
    </Column>
    <Column field="status" header="Status" sortable>
      <template #body="{ data }"><Skeleton v-if="showSkeleton" width="5rem" height="1.4rem" border-radius="1rem" /><StatusTag v-else :status="data.status" /></template>
    </Column>
    <Column header="Actions" :style="{ width: '6rem' }">
      <template #body="{ data }">
        <Skeleton v-if="showSkeleton" width="4rem" />
        <div v-else class="flex items-center justify-end gap-1">
          <LinkButton :to="`${basePath}/${data.id}`" icon="pi pi-eye" severity="secondary" text rounded size="small" :aria-label="`View ${data.reference}`" />
          <Button icon="pi pi-ellipsis-v" severity="secondary" text rounded size="small" aria-haspopup="true" :aria-label="`More actions for ${data.reference}`" @click="openMenu($event, data)" />
        </div>
      </template>
    </Column>

    <template #empty>
      <EmptyState
        :title="hasFilters ? 'No applications match your filters' : 'No applications yet'"
        :message="hasFilters ? 'Try a different search or clear the filters.' : isAdmin ? 'New applications will appear here as they are submitted.' : 'Applications you submit will appear here.'"
        icon="pi pi-file-pdf"
      >
        <Button v-if="hasFilters" label="Clear filters" severity="secondary" outlined size="small" @click="resetFilters" />
        <LinkButton v-else-if="!isAdmin" to="/applicant/apply" label="Apply for an internship" size="small" />
      </EmptyState>
    </template>
  </DataTable>
  <Menu ref="menu" :model="menuItems" popup />
</template>
