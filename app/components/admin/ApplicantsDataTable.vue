<script setup lang="ts">
import { FilterMatchMode } from '@primevue/core/api'
import type { ApplicantSummary } from '~/types/user'

const props = defineProps<{ applicants: ApplicantSummary[]; loading?: boolean }>()

const filters = ref({ global: { value: null as string | null, matchMode: FilterMatchMode.CONTAINS } })
const showSkeleton = computed(() => props.loading && !props.applicants.length)
const tableValue = computed(() => (showSkeleton.value ? (Array.from({ length: 6 }, (_, i) => ({ id: `sk-${i}` })) as unknown as ApplicantSummary[]) : props.applicants))

// Opens that applicant's applications in the applications table, pre-searched by name.
const viewApplications = (a: ApplicantSummary) => navigateTo({ path: '/admin/applications', query: { q: a.fullName } })
</script>

<template>
  <DataTable
    v-model:filters="filters" :value="tableValue" data-key="id" class="q-table" size="small" paginator :rows="10"
    :rows-per-page-options="[5, 10, 25, 50]" :global-filter-fields="['fullName', 'email', 'institution', 'fieldOfStudy']"
    paginator-template="RowsPerPageDropdown FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
    current-page-report-template="{first}–{last} of {totalRecords}" sort-field="registeredAt" :sort-order="-1" removable-sort
    scrollable :table-style="{ minWidth: '56rem' }" row-hover
  >
    <template #header>
      <IconField class="w-full sm:w-72">
        <InputIcon class="pi pi-search" />
        <InputText v-model="filters.global.value" placeholder="Search applicants" aria-label="Search applicants" size="small" fluid />
      </IconField>
    </template>
    <Column field="fullName" header="Applicant" sortable>
      <template #body="{ data }"><Skeleton v-if="showSkeleton" width="8rem" /><span v-else class="font-medium text-ink">{{ data.fullName }}</span></template>
    </Column>
    <Column field="email" header="Email" sortable>
      <template #body="{ data }"><Skeleton v-if="showSkeleton" width="10rem" /><span v-else class="text-muted">{{ data.email }}</span></template>
    </Column>
    <Column field="institution" header="Institution" sortable>
      <template #body="{ data }"><Skeleton v-if="showSkeleton" width="8rem" /><template v-else>{{ data.institution || '—' }}</template></template>
    </Column>
    <Column field="fieldOfStudy" header="Field of study" sortable>
      <template #body="{ data }"><Skeleton v-if="showSkeleton" width="7rem" /><template v-else>{{ data.fieldOfStudy || '—' }}</template></template>
    </Column>
    <Column field="registeredAt" header="Registered" sortable>
      <template #body="{ data }"><Skeleton v-if="showSkeleton" width="5rem" /><span v-else class="whitespace-nowrap">{{ formatDate(data.registeredAt) }}</span></template>
    </Column>
    <Column field="totalApplications" header="Applications" sortable>
      <template #body="{ data }"><Skeleton v-if="showSkeleton" width="2rem" /><Tag v-else :value="String(data.totalApplications)" severity="secondary" rounded /></template>
    </Column>
    <Column header="Actions" :style="{ width: '5rem' }">
      <template #body="{ data }">
        <Button v-if="!showSkeleton" icon="pi pi-file" severity="secondary" text rounded size="small" :disabled="!data.totalApplications" :aria-label="`View applications by ${data.fullName}`" @click="viewApplications(data)" />
      </template>
    </Column>
    <template #empty>
      <EmptyState title="No applicants found" message="Try a different search." icon="pi pi-users" />
    </template>
  </DataTable>
</template>
