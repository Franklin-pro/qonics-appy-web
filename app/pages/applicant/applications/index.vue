<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'applicant', middleware: ['auth', 'applicant'] })
useHead({ title: 'My Applications | Qonics Inc.' })

const auth = useAuthStore()
const { store, items } = useApplications()
const load = () => auth.user && store.fetchMine()
onMounted(load)
</script>

<template>
  <div>
    <PageHeader title="My applications" subtitle="Search, filter and open any application.">
      <LinkButton to="/applicant/apply" label="New application" icon="pi pi-plus" />
    </PageHeader>
    <ErrorState v-if="store.error" :message="store.error" class="mb-4" @retry="load" />
    <ApplicationsDataTable :applications="items" :loading="store.loading" variant="applicant" />
  </div>
</template>
