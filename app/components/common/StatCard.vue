<script setup lang="ts">
defineProps<{ label: string; value: number | string; icon: string; color?: string; loading?: boolean }>()
</script>

<template>
  <div class="surface-card flex items-center gap-4 p-4">
    <span
      class="flex size-11 shrink-0 items-center justify-center rounded-lg"
      :style="{ backgroundColor: (color ?? '#118254') + '1a', color: color ?? '#118254' }"
    >
      <i :class="icon" class="text-lg" aria-hidden="true" />
    </span>
    <div class="min-w-0">
      <p class="truncate text-sm text-muted">{{ label }}</p>
      <Skeleton v-if="loading" width="3rem" height="1.75rem" class="mt-1" />
      <p v-else class="text-2xl font-bold leading-tight text-navy">{{ value }}</p>
    </div>
  </div>
</template>
