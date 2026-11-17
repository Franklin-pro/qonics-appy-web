<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: ['auth', 'admin'] })
useHead({ title: 'Applications | Qonics Inc. Admin' })

const route = useRoute()
const { store, items } = useApplications()
onMounted(() => store.fetchAll())
</script>

<template>
  <div>
    <PageHeader title="Applications" :subtitle="`${items.length} total · search, filter and review`">
      <Button label="Refresh" icon="pi pi-refresh" severity="secondary" outlined :loading="store.loading" @click="store.fetchAll()" />
    </PageHeader>
    <ErrorState v-if="store.error" :message="store.error" class="mb-4" @retry="store.fetchAll()" />
    <ApplicationsDataTable :applications="items" :loading="store.loading" :initial-search="typeof route.query.q === 'string' ? route.query.q : undefined" />
  </div>
</template>
