<script setup lang="ts">
import { useApplicationsStore } from '~/stores/applications'

definePageMeta({ layout: 'admin', middleware: ['auth', 'admin'] })
useHead({ title: 'Applicants | Qonics Inc. Admin' })

const store = useApplicationsStore()
onMounted(() => store.fetchApplicants())
</script>

<template>
  <div>
    <PageHeader title="Applicants" :subtitle="`${store.applicants.length} registered applicants`" />
    <ErrorState v-if="store.error" :message="store.error" class="mb-4" @retry="store.fetchApplicants()" />
    <ApplicantsDataTable :applicants="store.applicants" :loading="store.loading" />
  </div>
</template>
