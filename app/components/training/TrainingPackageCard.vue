<script setup lang="ts">
import type { TrainingPackage } from '~/types/training'

defineProps<{ pkg: TrainingPackage }>()
defineEmits<{ enroll: [pkg: TrainingPackage] }>()
</script>

<template>
  <article
    class="relative flex h-full flex-col rounded-2xl border bg-white p-6 shadow-card transition-shadow duration-200 hover:shadow-lg"
    :class="pkg.recommended ? 'border-brand ring-2 ring-brand/30' : 'border-line'"
    :aria-labelledby="`pkg-${pkg.id}`"
  >
    <span v-if="pkg.recommended" class="absolute -top-3 left-6 inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
      <i class="pi pi-star-fill text-[0.65rem]" aria-hidden="true" /> Recommended
    </span>
    <h3 :id="`pkg-${pkg.id}`" class="text-sm font-semibold uppercase tracking-widest text-brand">{{ pkg.name }}</h3>
    <p class="mt-4 flex flex-wrap items-baseline gap-x-2">
      <span class="text-4xl font-bold tracking-tight text-navy">{{ pkg.price.toLocaleString('en-US') }}</span>
      <span class="text-base font-semibold text-muted">{{ pkg.currency }}</span>
    </p>
    <p v-if="pkg.duration" class="mt-1 flex items-center gap-1.5 text-sm text-muted"><i class="pi pi-clock text-xs" aria-hidden="true" /> {{ pkg.duration }}</p>
    <p v-if="pkg.description" class="mt-4 text-sm leading-relaxed text-muted">{{ pkg.description }}</p>
    <hr class="my-5 border-line">
    <p class="mb-3 text-xs font-semibold uppercase tracking-wide text-ink">What you will learn</p>
    <ul class="flex-1 space-y-2.5">
      <TrainingPackageFeature v-for="m in pkg.modules" :key="m.id" :name="m.name" />
    </ul>
    <Button
      class="mt-6" label="Enroll Now" :severity="pkg.recommended ? 'success' : 'secondary'" :outlined="!pkg.recommended" fluid
      :aria-label="`Enroll in the ${pkg.name} package`" @click="$emit('enroll', pkg)"
    />
  </article>
</template>
