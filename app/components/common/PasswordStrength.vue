<script setup lang="ts">
const props = defineProps<{ password: string }>()
const score = computed(() => passwordScore(props.password ?? ''))
const meta = computed(() => [
  { label: 'Too weak', color: '#dc2626' }, { label: 'Weak', color: '#dc2626' }, { label: 'Fair', color: '#d97706' },
  { label: 'Good', color: '#2563eb' }, { label: 'Strong', color: '#16a34a' }
][score.value]!)
</script>

<template>
  <div v-if="password" aria-live="polite">
    <ProgressBar :value="score * 25" :show-value="false" style="height: 6px" :pt="{ value: { style: { background: meta.color } } }" />
    <p class="mt-1 text-xs" :style="{ color: meta.color }">Password strength: {{ meta.label }}</p>
  </div>
  <p v-else class="text-xs text-muted">At least 8 characters with upper and lower case letters, a number and a symbol.</p>
</template>
