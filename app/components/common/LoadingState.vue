<script setup lang="ts">
withDefaults(defineProps<{ rows?: number; label?: string }>(), { rows: 4, label: 'Loading' })
</script>

<template>
  <div class="space-y-3" role="status" :aria-label="label">
    <Skeleton v-for="i in rows" :key="i" height="2.5rem" />
  </div>
</template>
