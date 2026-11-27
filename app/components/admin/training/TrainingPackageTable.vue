<script setup lang="ts">
import type { TrainingPackage } from '~/types/training'

defineProps<{ packages: TrainingPackage[]; loading?: boolean; busyId?: string | number | null }>()
defineEmits<{ view: [pkg: TrainingPackage]; edit: [pkg: TrainingPackage]; toggle: [pkg: TrainingPackage]; remove: [pkg: TrainingPackage] }>()
</script>

<template>
  <DataTable :value="packages" data-key="id" class="q-table" size="small" scrollable :table-style="{ minWidth: '52rem' }" row-hover :loading="loading">
    <template #empty><EmptyState icon="pi pi-book" title="No training packages yet" message="Create the first package to show it on the public site." /></template>
    <Column header="Package">
      <template #body="{ data }">
        <p class="font-medium text-navy">{{ data.name }}</p>
        <p class="text-xs text-muted">{{ data.slug }}</p>
      </template>
    </Column>
    <Column header="Price">
      <template #body="{ data }"><span class="whitespace-nowrap">{{ formatPrice(data.price, data.currency) }}</span></template>
    </Column>
    <Column header="Modules">
      <template #body="{ data }">
        <div class="flex max-w-xs flex-wrap gap-1">
          <Tag v-for="m in data.modules" :key="m.id" :value="m.name" severity="secondary" class="!text-xs !font-normal" />
          <span v-if="!data.modules.length" class="text-muted">—</span>
        </div>
      </template>
    </Column>
    <Column header="Status"><template #body="{ data }"><TrainingPackageStatusBadge :active="data.active" /></template></Column>
    <Column header="Recommended">
      <template #body="{ data }">
        <span v-if="data.recommended" class="inline-flex items-center gap-1 text-sm text-brand"><i class="pi pi-star-fill text-xs" aria-hidden="true" />Yes</span>
        <span v-else class="text-muted">No</span>
      </template>
    </Column>
    <Column header="Actions" header-class="w-0">
      <template #body="{ data }">
        <TrainingPackageActions
          :pkg="data" :busy="busyId === data.id"
          @view="$emit('view', data)" @edit="$emit('edit', data)" @toggle="$emit('toggle', data)" @remove="$emit('remove', data)"
        />
      </template>
    </Column>
  </DataTable>
</template>
