<script setup lang="ts">
import type { Application } from '~/types/application'

const props = defineProps<{ applications: Application[]; bySpecialization?: boolean }>()

const INK = '#64748b'
const GRID = '#e2e8f0'
const base = { responsive: true, maintainAspectRatio: false }
const legend = { position: 'bottom' as const, labels: { usePointStyle: true, boxWidth: 8, color: INK, font: { family: 'Inter Variable, sans-serif' } } }
const axes = {
  x: { grid: { display: false }, ticks: { color: INK } },
  y: { beginAtZero: true, grid: { color: GRID }, ticks: { color: INK, precision: 0 } }
}

const byStatus = computed(() => countByStatus(props.applications))
const byDepartment = computed(() => countByDepartment(props.applications))
const trend = computed(() => monthlyTrend(props.applications))

const statusData = computed(() => ({
  labels: STATUS_KEYS.map(k => STATUS_META[k].label),
  datasets: [{ data: STATUS_KEYS.map(k => byStatus.value[k]), backgroundColor: STATUS_KEYS.map(k => STATUS_META[k].color), borderWidth: 2, borderColor: '#fff' }]
}))
const deptData = computed(() => ({
  labels: byDepartment.value.map(d => d.name),
  datasets: [{ label: 'Applications', data: byDepartment.value.map(d => d.count), backgroundColor: ['#118254', '#19a657'], borderRadius: 6, maxBarThickness: 56 }]
}))
const trendData = computed(() => ({
  labels: trend.value.map(t => t.label),
  datasets: [{ label: 'Applications', data: trend.value.map(t => t.count), borderColor: '#118254', backgroundColor: 'rgba(17,130,84,0.1)', fill: true, tension: 0.35, pointRadius: 3 }]
}))
const specData = computed(() => {
  const rows = DEPARTMENTS.flatMap(d => d.specializations.map(s => ({
    label: s.name, dept: d.id, count: props.applications.filter(a => a.department === d.id && a.specialization === s.id).length
  })))
  return {
    labels: rows.map(r => r.label),
    datasets: [{ label: 'Applications', data: rows.map(r => r.count), backgroundColor: rows.map(r => (r.dept === 'software' ? '#118254' : '#19a657')), borderRadius: 4 }]
  }
})

const barOptions = { ...base, plugins: { legend: { display: false } }, scales: axes }
const lineOptions = { ...base, plugins: { legend: { display: false } }, scales: axes }
const doughnutOptions = { ...base, cutout: '62%', plugins: { legend } }
const hBarOptions = { ...base, indexAxis: 'y' as const, plugins: { legend: { display: false } }, scales: { x: axes.y, y: { grid: { display: false }, ticks: { color: INK } } } }
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-3">
    <section class="surface-card p-4" aria-label="Applications by department">
      <h3 class="mb-3 text-sm font-semibold text-navy">Applications by department</h3>
      <ClientOnly><Chart type="bar" :data="deptData" :options="barOptions" class="h-64" /></ClientOnly>
    </section>
    <section class="surface-card p-4" aria-label="Applications by status">
      <h3 class="mb-3 text-sm font-semibold text-navy">Applications by status</h3>
      <ClientOnly><Chart type="doughnut" :data="statusData" :options="doughnutOptions" class="h-64" /></ClientOnly>
    </section>
    <section class="surface-card p-4" aria-label="Application trends">
      <h3 class="mb-3 text-sm font-semibold text-navy">Application trends (6 months)</h3>
      <ClientOnly><Chart type="line" :data="trendData" :options="lineOptions" class="h-64" /></ClientOnly>
    </section>
    <section v-if="bySpecialization" class="surface-card p-4 lg:col-span-3" aria-label="Applications by specialization">
      <h3 class="mb-3 text-sm font-semibold text-navy">Applications by specialization</h3>
      <ClientOnly><Chart type="bar" :data="specData" :options="hBarOptions" class="h-80" /></ClientOnly>
    </section>
  </div>
</template>
