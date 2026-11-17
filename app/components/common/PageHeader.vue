<script setup lang="ts">
defineProps<{ title: string; subtitle?: string; backTo?: string; backLabel?: string }>()
</script>

<template>
  <div class="mb-6 flex flex-wrap items-end justify-between gap-3">
    <div class="min-w-0">
      <NuxtLink v-if="backTo" :to="backTo" class="link-quiet mb-1 inline-flex items-center gap-1.5 text-sm">
        <i class="pi pi-arrow-left text-xs" aria-hidden="true" /> {{ backLabel ?? 'Back' }}
      </NuxtLink>
      <h1 class="text-2xl font-bold tracking-tight text-navy">{{ title }}</h1>
      <p v-if="subtitle" class="mt-1 text-sm text-muted">{{ subtitle }}</p>
    </div>
    <div class="flex flex-wrap items-center gap-2"><slot /></div>
  </div>
</template>
