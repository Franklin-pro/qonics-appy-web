<script setup lang="ts">
import type { Application } from '~/types/application'
import { useSettingsStore } from '~/stores/settings'

definePageMeta({ layout: 'default' })
useHead({ title: 'Apply for Internship | Qonics Inc.' })

const settings = useSettingsStore()
const done = ref<Application | null>(null)

onMounted(async () => {
  await settings.fetch()
})
const ready = computed(() => settings.loaded)
</script>

<template>
  <div class="mx-auto max-w-4xl">
    <PageHeader title="Apply for an internship" subtitle="Five short steps. You can go back at any time." />

    <LoadingState v-if="!ready" :rows="3" />

    <div v-else-if="done" class="surface-card p-8 text-center">
      <span class="mx-auto flex size-14 items-center justify-center rounded-full bg-ok/10 text-ok"><i class="pi pi-check text-2xl" aria-hidden="true" /></span>
      <h2 class="mt-4 text-xl font-bold text-navy">Application submitted</h2>
      <p class="mt-1 text-sm text-muted">Reference <strong class="text-ink">{{ done.reference }}</strong></p>
      <div class="mt-6 flex flex-wrap justify-center gap-3">
        <LinkButton :to="`/applicant/applications/${done.id}`" label="View application" />
        <LinkButton to="/applicant" label="Back to overview" severity="secondary" outlined />
      </div>
    </div>

    <Message v-else-if="!settings.isOpen" severity="warn" :closable="false">
      {{ settings.settings.closureMessage || 'Applications are currently closed.' }}
    </Message>

    <div v-else class="surface-card p-5 sm:p-7">
      <ApplicationStepper @submitted="done = $event" />
    </div>
  </div>
</template>
