<script setup lang="ts">
/** Label + control + hint/error with correct ARIA wiring. Give the control `:id="id"` and `:invalid`. */
defineProps<{ id: string; label: string; error?: string; hint?: string; required?: boolean }>()
</script>

<template>
  <div class="flex min-w-0 flex-col gap-1.5">
    <label :for="id" class="text-sm font-medium text-ink">
      {{ label }}<span v-if="required" class="text-bad" aria-hidden="true"> *</span>
    </label>
    <slot />
    <small v-if="error" :id="`${id}-error`" class="text-bad" role="alert">{{ error }}</small>
    <small v-else-if="hint" :id="`${id}-hint`" class="text-muted">{{ hint }}</small>
  </div>
</template>
