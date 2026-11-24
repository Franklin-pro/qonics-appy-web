<script setup lang="ts">
import type { DepartmentId } from '~/types/department'
import type { EducationLevel, SessionId, WorkMode } from '~/types/application'

/** Read-only summary of an application's details (review step and details pages). */
defineProps<{
  department: DepartmentId | null
  specialization: string | null
  startDate: string | Date | null
  educationLevel: EducationLevel | null
  session: SessionId | null
  durationMonths: number | null
  amount?: number | null
  workMode: WorkMode | null
  motivation: string
  experience: string
}>()

const MODE_LABEL: Record<WorkMode, string> = { onsite: 'On-site', remote: 'Remote', hybrid: 'Hybrid' }
</script>

<template>
  <div class="space-y-5">
    <dl class="grid gap-x-6 gap-y-4 sm:grid-cols-2">
      <div><dt class="text-xs font-medium uppercase tracking-wide text-muted">Department</dt><dd class="mt-0.5 text-sm font-medium text-ink">{{ departmentName(department) }}</dd></div>
      <div><dt class="text-xs font-medium uppercase tracking-wide text-muted">Specialization</dt><dd class="mt-0.5 text-sm font-medium text-ink">{{ specializationName(department, specialization) }}</dd></div>
      <div><dt class="text-xs font-medium uppercase tracking-wide text-muted">Starting date</dt><dd class="mt-0.5 text-sm text-ink">{{ formatDate(startDate) }}</dd></div>
      <div><dt class="text-xs font-medium uppercase tracking-wide text-muted">Daily session</dt><dd class="mt-0.5 text-sm text-ink">{{ sessionLabel(session) }}</dd></div>
      <div><dt class="text-xs font-medium uppercase tracking-wide text-muted">Education level</dt><dd class="mt-0.5 text-sm text-ink">{{ educationLabel(educationLevel) }}</dd></div>
      <div><dt class="text-xs font-medium uppercase tracking-wide text-muted">Duration</dt><dd class="mt-0.5 text-sm text-ink">{{ durationMonths ? `${durationMonths} months` : '—' }}</dd></div>
      <div><dt class="text-xs font-medium uppercase tracking-wide text-muted">Amount</dt><dd class="mt-0.5 text-sm font-semibold text-ink">{{ amount == null ? '—' : amount.toLocaleString() }}</dd></div>
      <div><dt class="text-xs font-medium uppercase tracking-wide text-muted">Work mode</dt><dd class="mt-0.5 text-sm text-ink">{{ workMode ? MODE_LABEL[workMode] : '—' }}</dd></div>
    </dl>
    <div><p class="text-xs font-medium uppercase tracking-wide text-muted">Motivation</p><p class="mt-1 whitespace-pre-line text-sm leading-relaxed text-ink">{{ motivation }}</p></div>
    <div><p class="text-xs font-medium uppercase tracking-wide text-muted">Relevant experience</p><p class="mt-1 whitespace-pre-line text-sm leading-relaxed text-ink">{{ experience }}</p></div>
  </div>
</template>
