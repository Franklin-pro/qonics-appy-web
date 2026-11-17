<script setup lang="ts">
import type { Application } from '~/types/application'
import { useApplicationsStore } from '~/stores/applications'

definePageMeta({ layout: 'admin', middleware: ['auth', 'admin'] })

const route = useRoute()
const store = useApplicationsStore()
const id = computed(() => String(route.params.id))
const app = ref<Application | null>(null)
const loading = ref(true)
const error = ref('')

async function load() {
  loading.value = true
  error.value = ''
  try {
    app.value = await store.fetchOne(id.value)
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    loading.value = false
  }
}
onMounted(load)
watch(id, load)
// Status changes and notes update the store copy; mirror it here.
watchEffect(() => { const s = store.byId(id.value); if (s && app.value) app.value = s })
useHead({ title: computed(() => `${app.value?.reference ?? 'Application'} | Qonics Inc. Admin`) })
</script>

<template>
  <div>
    <PageHeader
      :title="app ? `${app.applicant.fullName}` : 'Application'"
      :subtitle="app ? `${app.reference} · submitted ${formatDate(app.submittedAt)}` : undefined"
      back-to="/admin/applications" back-label="Applications"
    />
    <LoadingState v-if="loading && !app" :rows="5" />
    <ErrorState v-else-if="error" :message="error" @retry="load" />
    <ReviewPanel v-else-if="app" :application="app" />
  </div>
</template>
