<script setup lang="ts">
import type { Department } from '~/types/department'

defineProps<{ department: Department }>()
</script>

<template>
  <article class="surface-card flex h-full flex-col p-6 transition-shadow hover:shadow-lg">
    <span class="flex size-12 items-center justify-center rounded-xl bg-navy text-accent">
      <i :class="department.icon" class="text-xl" aria-hidden="true" />
    </span>
    <h3 class="mt-4 text-xl font-bold text-navy">{{ department.name }}</h3>
    <p class="mt-1 text-sm font-medium text-brand">{{ department.tagline }}</p>
    <p class="mt-3 text-sm leading-relaxed text-muted">{{ department.description }}</p>
    <ul class="mt-5 flex flex-wrap gap-2">
      <li v-for="s in department.specializations" :key="s.id">
        <Tag :value="s.name" severity="secondary" rounded class="!font-medium" />
      </li>
    </ul>
    <div class="mt-auto pt-6">
      <LinkButton to="/applicant/apply" label="Apply to this department" icon="pi pi-arrow-right" icon-pos="right" text size="small" class="!px-0" />
    </div>
  </article>
</template>
