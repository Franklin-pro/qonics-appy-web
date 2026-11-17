<script setup lang="ts">
import type { ApplicationDocument, DocumentType } from '~/types/application'

defineProps<{ documents: ApplicationDocument[] }>()
const toast = useToast()

const LABELS: Record<DocumentType, string> = {
  cv: 'CV / Resume', transcript: 'Academic transcript', diploma: 'Diploma certificate', certificates: 'Supporting certificates', cover_letter: 'Cover letter'
}

function open(doc: ApplicationDocument) {
  if (doc.url) window.open(doc.url, '_blank', 'noopener')
  else toast.add({ severity: 'warn', summary: 'File not available', detail: 'No file storage is connected in demo mode.', life: 4000 })
}
</script>

<template>
  <ul v-if="documents.length" class="divide-y divide-line">
    <li v-for="doc in documents" :key="doc.id" class="flex items-center gap-3 py-3">
      <span class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-100 text-brand">
        <i class="pi pi-file-pdf" aria-hidden="true" />
      </span>
      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-medium text-ink">{{ doc.name }}</p>
        <p class="text-xs text-muted">{{ LABELS[doc.type] }} · {{ formatBytes(doc.size) }}</p>
      </div>
      <Button icon="pi pi-external-link" severity="secondary" text rounded :aria-label="`Open ${doc.name}`" @click="open(doc)" />
    </li>
  </ul>
  <p v-else class="text-sm text-muted">No documents were uploaded.</p>
</template>
