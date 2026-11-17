<script setup lang="ts">
defineProps<{ message: string }>()
defineEmits<{ retry: [] }>()
</script>

<template>
  <Message severity="error" :closable="false">
    <div class="flex flex-wrap items-center gap-3">
      <span>{{ message }}</span>
      <Button label="Try again" size="small" severity="secondary" outlined icon="pi pi-refresh" @click="$emit('retry')" />
    </div>
  </Message>
</template>
