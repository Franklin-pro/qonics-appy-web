<script setup lang="ts">
import type { TrainingPackage } from '~/types/training'

const props = defineProps<{ packages: TrainingPackage[] }>()

/** Every module that appears in any package, in order of first appearance. */
const modules = computed(() => [...new Set(props.packages.flatMap(p => p.modules.map(m => m.name)))])
const has = (p: TrainingPackage, name: string) => p.modules.some(m => m.name === name)
</script>

<template>
  <!-- table-fixed + wrapped text keeps every column inside the viewport, even at 360px -->
  <div class="surface-card overflow-hidden">
    <table class="w-full table-fixed border-collapse text-left text-xs sm:text-sm">
      <caption class="sr-only">Training modules included in each package</caption>
      <thead class="bg-surface-50">
        <tr>
          <th scope="col" class="w-2/5 px-3 py-3 font-semibold text-ink sm:px-5">Module</th>
          <th v-for="p in packages" :key="p.id" scope="col" class="px-1 py-3 text-center font-semibold text-navy sm:px-3">
            <span class="block break-words">{{ p.name }}</span>
            <span v-if="p.recommended" class="mt-0.5 block text-[0.65rem] font-semibold uppercase text-brand">Recommended</span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="m in modules" :key="m" class="border-t border-line">
          <th scope="row" class="break-words px-3 py-3 font-medium text-ink sm:px-5">{{ m }}</th>
          <td v-for="p in packages" :key="p.id" class="px-1 py-3 text-center sm:px-3">
            <template v-if="has(p, m)">
              <i class="pi pi-check text-brand" aria-hidden="true" /><span class="sr-only">Included</span>
            </template>
            <template v-else>
              <span class="text-muted" aria-hidden="true">—</span><span class="sr-only">Not included</span>
            </template>
          </td>
        </tr>
      </tbody>
      <tfoot>
        <tr class="border-t border-line bg-surface-50">
          <th scope="row" class="px-3 py-3 font-semibold text-ink sm:px-5">Price</th>
          <td v-for="p in packages" :key="p.id" class="px-1 py-3 text-center font-semibold text-navy sm:px-3">
            <span class="block">{{ p.price.toLocaleString('en-US') }}</span><span class="block text-[0.65rem] font-normal text-muted">{{ p.currency }}</span>
          </td>
        </tr>
      </tfoot>
    </table>
  </div>
</template>
