<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: ['auth', 'admin'] })
useHead({ title: 'Departments | Qonics Inc. Admin' })

const { store, items } = useApplications()
onMounted(() => store.fetchAll())

const countFor = (dept: string, spec?: string) =>
  items.value.filter(a => a.department === dept && (!spec || a.specialization === spec)).length
</script>

<template>
  <div>
    <PageHeader title="Departments" subtitle="Qonics offers two internship departments." />
    <ErrorState v-if="store.error" :message="store.error" class="mb-4" @retry="store.fetchAll()" />
    <div class="grid gap-6 lg:grid-cols-2">
      <Card v-for="d in DEPARTMENTS" :key="d.id">
        <template #title>
          <div class="flex items-center gap-3">
            <span class="flex size-10 items-center justify-center rounded-lg bg-navy text-accent"><i :class="d.icon" aria-hidden="true" /></span>
            <div><p class="text-base">{{ d.name }}</p><p class="text-xs font-normal text-muted">{{ countFor(d.id) }} applications</p></div>
          </div>
        </template>
        <template #content>
          <p class="mb-4 text-sm text-muted">{{ d.description }}</p>
          <ul class="space-y-3">
            <li v-for="s in d.specializations" :key="s.id">
              <div class="mb-1 flex justify-between text-sm"><span class="text-ink">{{ s.name }}</span><span class="font-medium text-navy">{{ countFor(d.id, s.id) }}</span></div>
              <ProgressBar :value="countFor(d.id) ? (countFor(d.id, s.id) / countFor(d.id)) * 100 : 0" :show-value="false" style="height: 6px" :aria-label="`${s.name} share`" />
            </li>
          </ul>
        </template>
      </Card>
    </div>
  </div>
</template>
