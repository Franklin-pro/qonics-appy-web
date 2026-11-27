<script setup lang="ts">
import type { TrainingPackage } from '~/types/training'

defineProps<{ pkg: TrainingPackage; busy?: boolean }>()
defineEmits<{ view: []; edit: []; toggle: []; remove: [] }>()
</script>

<template>
  <div class="flex items-center gap-0.5">
    <Button icon="pi pi-eye" severity="secondary" text rounded size="small" :aria-label="`View ${pkg.name}`" @click="$emit('view')" />
    <Button icon="pi pi-pencil" severity="secondary" text rounded size="small" :aria-label="`Edit ${pkg.name}`" @click="$emit('edit')" />
    <Button
      :icon="pkg.active ? 'pi pi-ban' : 'pi pi-check-circle'" severity="secondary" text rounded size="small" :disabled="busy"
      :aria-label="`${pkg.active ? 'Deactivate' : 'Activate'} ${pkg.name}`" @click="$emit('toggle')"
    />
    <Button icon="pi pi-trash" severity="danger" text rounded size="small" :disabled="busy" :aria-label="`Delete ${pkg.name}`" @click="$emit('remove')" />
  </div>
</template>
