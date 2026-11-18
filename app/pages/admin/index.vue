<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: ['auth', 'admin'] })
useHead({ title: 'Dashboard | Qonics Inc. Admin' })

const { store, items, total, recent, newCount, statusCounts } = useApplications()
onMounted(() => store.fetchAll())
const loadingFirst = computed(() => store.loading && !total.value)
</script>

<template>
  <div>
    <PageHeader title="Dashboard" subtitle="Internship applications at a glance.">
      <LinkButton to="/admin/applications" label="Manage applications" icon="pi pi-arrow-right" icon-pos="right" severity="secondary" outlined />
    </PageHeader>
    <ErrorState v-if="store.error" :message="store.error" class="mb-6" @retry="store.fetchAll()" />

    <div class="grid grid-cols-2 gap-4 md:grid-cols-3 2xl:grid-cols-6">
      <StatCard label="Total" :value="total" icon="pi pi-file-pdf" :loading="loadingFirst" />
      <StatCard label="New" :value="newCount" icon="pi pi-inbox" color="#64748b" :loading="loadingFirst" />
      <StatCard label="Under review" :value="statusCounts.under_review" icon="pi pi-search" color="#2563eb" :loading="loadingFirst" />
      <StatCard label="Shortlisted" :value="statusCounts.shortlisted" icon="pi pi-star" color="#d97706" :loading="loadingFirst" />
      <StatCard label="Accepted" :value="statusCounts.accepted" icon="pi pi-check-circle" color="#16a34a" :loading="loadingFirst" />
      <StatCard label="Rejected" :value="statusCounts.rejected" icon="pi pi-times-circle" color="#dc2626" :loading="loadingFirst" />
    </div>

    <div class="mt-6"><DashboardCharts :applications="items" /></div>

    <section class="mt-8" aria-labelledby="recent">
      <div class="mb-3 flex items-center justify-between">
        <h2 id="recent" class="text-lg font-semibold text-navy">Recent applications</h2>
        <NuxtLink to="/admin/applications" class="text-sm font-medium text-brand hover:underline">View all</NuxtLink>
      </div>
      <ApplicationsDataTable :applications="recent" :loading="store.loading" compact />
    </section>
  </div>
</template>
