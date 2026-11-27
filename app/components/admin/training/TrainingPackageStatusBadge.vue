<script setup lang="ts">
defineProps<{ active: boolean }>()
</script>

<template>
  <Tag :value="active ? 'Active' : 'Inactive'" :severity="active ? 'success' : 'secondary'" rounded class="!whitespace-nowrap !text-xs !font-medium" />
</template>
