<script setup lang="ts">
import { useApplicantStore } from '~/stores/applicant'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'applicant', middleware: ['auth', 'applicant'] })
useHead({ title: 'Overview | Qonics Inc.' })

const auth = useAuthStore()
const applicant = useApplicantStore()
const { store, statusCounts, total, recent } = useApplications()

onMounted(() => {
  if (!auth.user) return
  store.fetchMine()
  if (!applicant.profile) applicant.fetchProfile()
})
const load = () => auth.user && store.fetchMine()
</script>

<template>
  <div>
    <PageHeader :title="`Hello, ${auth.user?.fullName.split(' ')[0] ?? ''}`" subtitle="Here is where your internship applications stand.">
      <LinkButton to="/applicant/apply" label="New application" icon="pi pi-plus" />
    </PageHeader>

    <ErrorState v-if="store.error" :message="store.error" class="mb-6" @retry="load" />

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Total applications" :value="total" icon="pi pi-file" :loading="store.loading && !total" />
      <StatCard label="Under review" :value="statusCounts.under_review" icon="pi pi-search" color="#2563eb" :loading="store.loading && !total" />
      <StatCard label="Shortlisted" :value="statusCounts.shortlisted" icon="pi pi-star" color="#d97706" :loading="store.loading && !total" />
      <StatCard label="Accepted" :value="statusCounts.accepted" icon="pi pi-check-circle" color="#16a34a" :loading="store.loading && !total" />
    </div>

    <Message v-if="applicant.profile && !applicant.isComplete" severity="info" :closable="false" class="mt-6">
      <div class="flex flex-wrap items-center gap-3">
        <span>Your profile is incomplete. Finish it so you can apply.</span>
        <LinkButton to="/applicant/profile" label="Complete profile" size="small" />
      </div>
    </Message>

    <section class="mt-8" aria-labelledby="recent">
      <div class="mb-3 flex items-center justify-between">
        <h2 id="recent" class="text-lg font-semibold text-navy">Recent applications</h2>
        <NuxtLink to="/applicant/applications" class="text-sm font-medium text-brand hover:underline">View all</NuxtLink>
      </div>
      <ApplicationsDataTable :applications="recent" :loading="store.loading" variant="applicant" compact />
    </section>
  </div>
</template>
