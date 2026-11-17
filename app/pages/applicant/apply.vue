<script setup lang="ts">
import type { Application } from '~/types/application'
import { useApplicantStore } from '~/stores/applicant'
import { useAuthStore } from '~/stores/auth'
import { useSettingsStore } from '~/stores/settings'

definePageMeta({ layout: 'applicant', middleware: ['auth', 'applicant'] })
useHead({ title: 'Apply for Internship | Qonics Inc.' })

const auth = useAuthStore()
const applicant = useApplicantStore()
const settings = useSettingsStore()
const done = ref<Application | null>(null)

onMounted(async () => {
  await Promise.all([settings.fetch(), auth.user && !applicant.profile ? applicant.fetchProfile(auth.user.id) : undefined])
})
const ready = computed(() => settings.loaded && !applicant.loading && !!applicant.profile)
</script>

<template>
  <div class="mx-auto max-w-4xl">
    <PageHeader title="Apply for an internship" subtitle="Five short steps. You can go back at any time." />

    <LoadingState v-if="!ready && !applicant.error" :rows="3" />
    <ErrorState v-else-if="applicant.error" :message="applicant.error" @retry="auth.user && applicant.fetchProfile(auth.user.id)" />

    <div v-else-if="done" class="surface-card p-8 text-center">
      <span class="mx-auto flex size-14 items-center justify-center rounded-full bg-ok/10 text-ok"><i class="pi pi-check text-2xl" aria-hidden="true" /></span>
      <h2 class="mt-4 text-xl font-bold text-navy">Application {{ auth.demoMode ? 'saved (demo)' : 'submitted' }}</h2>
      <p class="mt-1 text-sm text-muted">Reference <strong class="text-ink">{{ done.reference }}</strong></p>
      <div class="mt-6 flex flex-wrap justify-center gap-3">
        <LinkButton :to="`/applicant/applications/${done.id}`" label="View application" />
        <LinkButton to="/applicant" label="Back to overview" severity="secondary" outlined />
      </div>
    </div>

    <Message v-else-if="!settings.isOpen" severity="warn" :closable="false">
      <p class="font-semibold">Applications are currently paused</p>
      <p class="mt-1 text-sm">{{ settings.settings.closureMessage || 'Please check back soon.' }}</p>
    </Message>

    <Message v-else-if="!applicant.isComplete" severity="info" :closable="false">
      <p class="font-semibold">Complete your profile first</p>
      <p class="mt-1 text-sm">Add your institution, field of study, academic status and at least one technical skill so reviewers can assess your application.</p>
      <LinkButton to="/applicant/profile" label="Go to my profile" size="small" class="mt-3" />
    </Message>

    <div v-else class="surface-card p-5 sm:p-7">
      <ApplicationStepper @submitted="done = $event" />
    </div>
  </div>
</template>
