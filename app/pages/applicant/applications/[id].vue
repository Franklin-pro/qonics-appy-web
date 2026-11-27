<script setup lang="ts">
import type { Application } from '~/types/application'
import { useApplicationsStore } from '~/stores/applications'

definePageMeta({ layout: 'applicant', middleware: ['auth', 'applicant'] })

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
useHead({ title: computed(() => `${app.value?.reference ?? 'Application'} | Qonics Inc.`) })
// Keep in sync if the store copy changes (e.g. status updates).
watchEffect(() => { const s = store.byId(id.value); if (s && app.value) app.value = s })
</script>

<template>
  <div>
    <PageHeader :title="app?.reference ?? 'Application'" back-to="/applicant/applications" back-label="My applications">
      <StatusTag v-if="app" :status="app.status" />
    </PageHeader>
    <LoadingState v-if="loading && !app" :rows="4" />
    <ErrorState v-else-if="error" :message="error" @retry="load" />
    <div v-else-if="app" class="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <div class="space-y-6">
        <Card>
          <template #title><span class="text-base">Application information</span></template>
          <template #content>
            <ApplicationSummary
              :department="app.department" :specialization="app.specialization" :package-name="app.packageName" :package-skills="app.skills" :amount="app.amount" :start-date="app.startDate" :education-level="app.educationLevel" :session="app.session"
              :duration-months="app.durationMonths" :work-mode="app.workMode" :motivation="app.motivation" :experience="app.experience"
            />
            <p v-if="app.interviewAt" class="mt-4 rounded-lg bg-primary-50 p-3 text-sm text-primary-700">
              <i class="pi pi-calendar mr-1.5" aria-hidden="true" /> Interview scheduled for <strong>{{ formatDate(app.interviewAt, true) }}</strong>
            </p>
          </template>
        </Card>
        <Card>
          <template #title><span class="text-base">Documents</span></template>
          <template #content><DocumentList :documents="app.documents" /></template>
        </Card>
      </div>
      <Card class="self-start">
        <template #title><span class="text-base">Status timeline</span></template>
        <template #content><ApplicationTimeline :events="app.history" /></template>
      </Card>
    </div>
  </div>
</template>
