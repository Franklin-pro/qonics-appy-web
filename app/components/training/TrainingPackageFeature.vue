<script setup lang="ts">
defineProps<{ name: string; included?: boolean }>()
</script>

<template>
  <li class="flex items-start gap-2.5 text-sm" :class="included === false ? 'text-muted' : 'text-ink'">
    <i :class="included === false ? 'pi pi-minus' : 'pi pi-check-circle text-brand'" class="mt-0.5 text-sm" aria-hidden="true" />
    <span>{{ name }}<span v-if="included === false" class="sr-only"> (not included)</span></span>
  </li>
</template>
