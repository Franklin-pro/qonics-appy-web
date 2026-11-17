<script setup lang="ts">
import type { StatusEvent } from '~/types/application'

const props = defineProps<{ events: StatusEvent[] }>()
const ordered = computed(() => [...props.events].sort((a, b) => +new Date(b.at) - +new Date(a.at)))
</script>

<template>
  <Timeline :value="ordered" class="app-timeline">
    <template #marker="{ item }">
      <span
        class="flex size-7 items-center justify-center rounded-full text-white"
        :style="{ backgroundColor: STATUS_META[(item as StatusEvent).status].color }"
      >
        <i :class="STATUS_META[(item as StatusEvent).status].icon" class="text-xs" aria-hidden="true" />
      </span>
    </template>
    <template #content="{ item }">
      <div class="pb-5">
        <p class="text-sm font-semibold text-navy">{{ STATUS_META[(item as StatusEvent).status].label }}</p>
        <p class="text-xs text-muted">{{ formatDate((item as StatusEvent).at, true) }}</p>
        <p v-if="(item as StatusEvent).note" class="mt-1 text-sm text-ink">{{ (item as StatusEvent).note }}</p>
      </div>
    </template>
  </Timeline>
</template>

<style scoped>
.app-timeline :deep(.p-timeline-event-opposite) { display: none; }
.app-timeline :deep(.p-timeline-event-content) { padding-left: 0.75rem; }
</style>
