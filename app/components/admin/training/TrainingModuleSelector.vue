<script setup lang="ts">
import type { TrainingModule } from '~/types/training'

defineProps<{ modules: TrainingModule[]; loading?: boolean; failed?: boolean; invalid?: boolean }>()
defineEmits<{ retry: [] }>()
const selected = defineModel<Array<string | number>>({ required: true })
</script>

<template>
  <fieldset class="min-w-0 rounded-lg border p-3" :class="invalid ? 'border-bad' : 'border-line'">
    <legend class="px-1 text-sm font-medium text-ink">Select Training Modules <span class="text-bad" aria-hidden="true">*</span></legend>
    <Skeleton v-if="loading" height="6rem" />
    <div v-else-if="failed" class="flex items-center gap-3 text-sm text-muted">
      Could not load modules. <Button label="Retry" size="small" severity="secondary" outlined @click="$emit('retry')" />
    </div>
    <p v-else-if="!modules.length" class="text-sm text-muted">No training modules are available.</p>
    <div v-else class="grid gap-2 sm:grid-cols-2">
      <label v-for="m in modules" :key="m.id" class="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm hover:bg-surface-50">
        <Checkbox v-model="selected" :value="m.id" :input-id="`mod-${m.id}`" />
        {{ m.name }}
      </label>
    </div>
  </fieldset>
</template>
