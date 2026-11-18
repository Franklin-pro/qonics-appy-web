<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: ['auth', 'admin'] })
useHead({ title: 'Applications | Qonics Inc. Admin' })

const route = useRoute()
const { store, items } = useApplications()

// Filtering happens on the server: these become ?search, ?reference, ?status, ?department, ?submitted_from, ?submitted_to.
const query = reactive({
  search: typeof route.query.q === 'string' ? route.query.q : '',
  reference: '',
  status: null as string | null,
  department: null as string | null,
  submittedFrom: '',
  submittedTo: ''
})
const load = () => store.fetchAll({ ...query, status: query.status ?? undefined, department: query.department ?? undefined })
watchDebounced(query, load, { debounce: 350, deep: true })
onMounted(load)
</script>

<template>
  <div>
    <PageHeader title="Applications" :subtitle="`${items.length} shown · search, filter and review`">
      <Button label="Refresh" icon="pi pi-refresh" severity="secondary" outlined :loading="store.loading" @click="load" />
    </PageHeader>
    <ErrorState v-if="store.error" :message="store.error" class="mb-4" @retry="load" />
    <ApplicationsDataTable v-model:query="query" :applications="items" :loading="store.loading" />
  </div>
</template>
