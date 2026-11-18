<script setup lang="ts">
import type { ApplicantSummary } from '~/types/user'

interface ApplicantFilters { search: string; institution: string; fieldOfStudy: string; page: number; limit: number }

const props = defineProps<{ applicants: ApplicantSummary[]; total: number; loading?: boolean }>()
const query = defineModel<ApplicantFilters>('query', { required: true })

const showSkeleton = computed(() => props.loading && !props.applicants.length)
const tableValue = computed(() => (showSkeleton.value ? (Array.from({ length: 6 }, (_, i) => ({ id: `sk-${i}` })) as unknown as ApplicantSummary[]) : props.applicants))
const hasFilters = computed(() => !!(query.value.search || query.value.institution || query.value.fieldOfStudy))
const first = computed(() => (query.value.page - 1) * query.value.limit)

function onPage(e: { page: number; rows: number }) {
  query.value.page = e.page + 1
  query.value.limit = e.rows
}
const clear = () => { query.value.search = ''; query.value.institution = ''; query.value.fieldOfStudy = '' }

// Opens that applicant's applications in the applications table, pre-searched by name.
const viewApplications = (a: ApplicantSummary) => navigateTo({ path: '/admin/applications', query: { q: a.fullName } })
</script>

<template>
  <DataTable
    :value="tableValue" data-key="id" class="q-table" size="small" lazy paginator :rows="query.limit" :first="first" :total-records="total"
    :rows-per-page-options="[5, 10, 25, 50]"
    paginator-template="RowsPerPageDropdown FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
    current-page-report-template="{first}–{last} of {totalRecords}" scrollable :table-style="{ minWidth: '56rem' }" row-hover @page="onPage"
  >
    <template #header>
      <div class="flex flex-wrap items-center gap-2">
        <IconField class="w-full sm:w-64">
          <InputIcon class="pi pi-search" />
          <InputText v-model="query.search" placeholder="Search applicants" aria-label="Search applicants" size="small" fluid />
        </IconField>
        <InputText v-model="query.institution" placeholder="Institution" aria-label="Filter by institution" size="small" class="w-full sm:w-52" />
        <InputText v-model="query.fieldOfStudy" placeholder="Field of study" aria-label="Filter by field of study" size="small" class="w-full sm:w-52" />
        <Button v-if="hasFilters" label="Clear" icon="pi pi-filter-slash" severity="secondary" text size="small" @click="clear" />
      </div>
    </template>
    <Column field="fullName" header="Applicant">
      <template #body="{ data }"><Skeleton v-if="showSkeleton" width="8rem" /><span v-else class="font-medium text-ink">{{ data.fullName }}</span></template>
    </Column>
    <Column field="email" header="Email">
      <template #body="{ data }"><Skeleton v-if="showSkeleton" width="10rem" /><span v-else class="text-muted">{{ data.email }}</span></template>
    </Column>
    <Column field="institution" header="Institution">
      <template #body="{ data }"><Skeleton v-if="showSkeleton" width="8rem" /><template v-else>{{ data.institution || '—' }}</template></template>
    </Column>
    <Column field="fieldOfStudy" header="Field of study">
      <template #body="{ data }"><Skeleton v-if="showSkeleton" width="7rem" /><template v-else>{{ data.fieldOfStudy || '—' }}</template></template>
    </Column>
    <Column field="registeredAt" header="Registered">
      <template #body="{ data }"><Skeleton v-if="showSkeleton" width="5rem" /><span v-else class="whitespace-nowrap">{{ formatDate(data.registeredAt) }}</span></template>
    </Column>
    <Column field="totalApplications" header="Applications">
      <template #body="{ data }"><Skeleton v-if="showSkeleton" width="2rem" /><Tag v-else :value="String(data.totalApplications)" severity="secondary" rounded /></template>
    </Column>
    <Column header="Actions" :style="{ width: '5rem' }">
      <template #body="{ data }">
        <Button v-if="!showSkeleton" icon="pi pi-file-pdf" severity="secondary" text rounded size="small" :disabled="!data.totalApplications" :aria-label="`View applications by ${data.fullName}`" @click="viewApplications(data)" />
      </template>
    </Column>
    <template #empty>
      <EmptyState title="No applicants found" message="Try a different search or clear the filters." icon="pi pi-users" />
    </template>
  </DataTable>
</template>
