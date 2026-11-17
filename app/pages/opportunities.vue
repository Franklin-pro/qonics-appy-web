<script setup lang="ts">
import { useSettingsStore } from '~/stores/settings'

useHead({ title: 'Internship Opportunities | Qonics Inc.' })
const settings = useSettingsStore()
onMounted(() => settings.fetch())
</script>

<template>
  <div>
    <PageBanner
      eyebrow="Internship Opportunities"
      title="Find your specialization"
      lead="Choose a department and a specialization that matches your skills and curiosity."
    />
    <section class="container-x py-12">
      <Message v-if="settings.loaded && !settings.isOpen" severity="warn" :closable="false" class="mb-8">
        {{ settings.settings.closureMessage || 'Applications are currently paused.' }}
      </Message>
      <Message v-else severity="success" :closable="false" class="mb-8">
        Applications are open throughout the year unless the program is paused by our administrators.
      </Message>

      <div class="space-y-10">
        <div v-for="d in DEPARTMENTS" :key="d.id">
          <div class="mb-4 flex items-center gap-3">
            <span class="flex size-10 items-center justify-center rounded-lg bg-navy text-accent"><i :class="d.icon" aria-hidden="true" /></span>
            <div><h2 class="text-xl font-bold text-navy">{{ d.name }}</h2><p class="text-sm text-muted">{{ d.description }}</p></div>
          </div>
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div v-for="s in d.specializations" :key="s.id" class="surface-card flex gap-3 p-4">
              <i :class="s.icon" class="mt-0.5 text-lg text-brand" aria-hidden="true" />
              <div><h3 class="font-semibold text-navy">{{ s.name }}</h3><p class="mt-1 text-sm text-muted">{{ s.description }}</p></div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <ApplyCta />
  </div>
</template>
