<script setup lang="ts">
import type { TrainingPackage } from '~/types/training'

const { items, loading, failed, reload } = useTrainingPackages()

function enroll(pkg: TrainingPackage) {
  return navigateTo({ path: '/applicant/apply', query: { package: String(pkg.id) } })
}
</script>

<template>
  <section id="training" class="container-x scroll-mt-20 py-20" aria-labelledby="training-title">
    <p class="eyebrow">Training programs</p>
    <h2 id="training-title" class="h-section mt-2 max-w-xl">Hands-on technology training, from first line of code to embedded systems</h2>
    <p class="lead mt-3">Choose the package that matches your goals. Every package is built around practical exercises, projects and mentorship.</p>

    <div v-if="loading" class="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Loading training packages">
      <div v-for="i in 3" :key="i" class="surface-card space-y-4 p-6">
        <Skeleton width="40%" height="1rem" /><Skeleton width="70%" height="2.5rem" /><Skeleton height="3rem" />
        <Skeleton v-for="j in 5" :key="j" height="1rem" /><Skeleton height="2.5rem" />
      </div>
    </div>

    <div v-else-if="failed" class="mt-12 flex flex-col items-center rounded-2xl border border-line bg-white px-4 py-10 text-center" role="alert">
      <span class="mb-3 flex size-12 items-center justify-center rounded-full bg-red-50 text-bad"><i class="pi pi-exclamation-triangle text-xl" aria-hidden="true" /></span>
      <p class="font-semibold text-navy">Unable to load training packages.</p>
      <p class="mt-1 text-sm text-muted">Please try again.</p>
      <Button class="mt-4" label="Retry" icon="pi pi-refresh" severity="secondary" outlined @click="reload" />
    </div>

    <EmptyState v-else-if="!items.length" class="mt-12" icon="pi pi-book" title="No training packages are currently available." message="Please check back soon." />

    <template v-else>
      <div class="mt-12 grid items-stretch gap-8 md:grid-cols-2 lg:grid-cols-3">
        <TrainingPackageCard v-for="p in items" :key="p.id" :pkg="p" @enroll="enroll" />
      </div>
      <h3 class="mt-16 text-xl font-bold tracking-tight text-navy">Compare packages</h3>
      <div class="mt-5"><TrainingPackageComparison :packages="items" /></div>
    </template>
  </section>
</template>
