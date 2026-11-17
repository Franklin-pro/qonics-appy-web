<script setup lang="ts">
import type { ApplicationStatus } from '~/types/application'

defineProps<{ status: ApplicationStatus }>()
</script>

<template>
  <Tag :value="STATUS_META[status].label" :severity="STATUS_META[status].severity" rounded class="!whitespace-nowrap !text-xs !font-medium" />
</template>
