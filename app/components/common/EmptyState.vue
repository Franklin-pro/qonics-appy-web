<script setup lang="ts">
defineProps<{ title: string; message?: string; icon?: string }>()
</script>

<template>
  <div class="flex flex-col items-center justify-center px-4 py-12 text-center">
    <span class="mb-3 flex size-12 items-center justify-center rounded-full bg-surface-100 text-muted">
      <i :class="icon ?? 'pi pi-inbox'" class="text-xl" aria-hidden="true" />
    </span>
    <p class="font-semibold text-navy">{{ title }}</p>
    <p v-if="message" class="mt-1 max-w-sm text-sm text-muted">{{ message }}</p>
    <div class="mt-4"><slot /></div>
  </div>
</template>
