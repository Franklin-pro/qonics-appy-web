<script setup lang="ts">
import { useApplicationsStore } from '~/stores/applications'

definePageMeta({ layout: 'admin', middleware: ['auth', 'admin'] })
useHead({ title: 'Applicants | Qonics Inc. Admin' })

const store = useApplicationsStore()

// Filtering and paging happen on the server: these become ?search, ?institution, ?field_of_study, ?page, ?limit.
const query = reactive({ search: '', institution: '', fieldOfStudy: '', page: 1, limit: 10 })
const load = () => store.fetchApplicants({ ...query })

// A new filter always starts from page 1; typing is debounced so each keystroke is not a request.
watch(() => [query.search, query.institution, query.fieldOfStudy], () => { query.page = 1 })
watchDebounced(query, load, { debounce: 350, deep: true })
onMounted(load)
</script>

<template>
  <div>
    <PageHeader title="Applicants" :subtitle="`${store.applicantsTotal} applicants`" />
    <ErrorState v-if="store.error" :message="store.error" class="mb-4" @retry="load" />
    <ApplicantsDataTable v-model:query="query" :applicants="store.applicants" :total="store.applicantsTotal" :loading="store.loading" />
  </div>
</template>
