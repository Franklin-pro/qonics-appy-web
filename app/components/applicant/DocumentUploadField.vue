<script setup lang="ts">
/**
 * One document slot built on PrimeVue FileUpload (advanced mode, custom upload).
 * Files are validated and read locally (the progress bar is real FileReader progress);
 * the actual network upload happens when the application is submitted.
 */
const props = defineProps<{ id: string; label: string; hint?: string; required?: boolean; modelValue: File | null }>()
const emit = defineEmits<{ 'update:modelValue': [file: File | null] }>()

const MAX_BYTES = 5 * 1024 * 1024
const progress = ref(0)
const previewUrl = ref<string | null>(null)
const readError = ref('')

function release() {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = null
  progress.value = 0
  readError.value = ''
}

function onSelect(event: { files: File[] }) {
  const file = event.files[0]
  if (!file) return
  release()
  const reader = new FileReader()
  reader.onprogress = e => { if (e.lengthComputable) progress.value = Math.round((e.loaded / e.total) * 100) }
  reader.onerror = () => { readError.value = 'This file could not be read. Try another file.'; emit('update:modelValue', null) }
  reader.onload = () => {
    progress.value = 100
    previewUrl.value = URL.createObjectURL(file)
    emit('update:modelValue', file)
  }
  reader.readAsArrayBuffer(file)
}

function remove(removeCallback: (i: number) => void) {
  removeCallback(0)
  release()
  emit('update:modelValue', null)
}

onBeforeUnmount(release)
// Parent cleared the value (e.g. form reset): drop the preview too.
watch(() => props.modelValue, v => { if (!v) release() })
</script>

<template>
  <div>
    <p :id="`${id}-label`" class="mb-1.5 text-sm font-medium text-ink">
      {{ label }}<span v-if="required" class="text-bad" aria-hidden="true"> *</span>
      <span v-else class="font-normal text-muted"> (optional)</span>
    </p>
    <FileUpload
      :id="id"
      name="file"
      custom-upload
      :multiple="false"
      :file-limit="1"
      accept=".pdf,.doc,.docx"
      :max-file-size="MAX_BYTES"
      invalid-file-size-message="{0}: file is too large. Maximum size is 5 MB."
      invalid-file-type-message="{0}: unsupported type. Use PDF, DOC or DOCX."
      invalid-file-limit-message="Remove the current file before choosing another."
      :aria-labelledby="`${id}-label`"
      @select="onSelect"
    >
      <template #header="{ chooseCallback, files }">
        <div class="flex w-full items-center justify-between gap-3">
          <span class="text-xs text-muted">{{ hint ?? 'PDF, DOC or DOCX · max 5 MB' }}</span>
          <Button label="Choose file" icon="pi pi-upload" size="small" severity="secondary" outlined :disabled="files.length > 0" @click="chooseCallback()" />
        </div>
      </template>
      <template #content="{ files, removeFileCallback }">
        <ul v-if="files.length" class="space-y-3">
          <li v-for="(file, i) in files" :key="file.name + file.size" class="flex items-center gap-3">
            <span class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-surface-100 text-brand"><i class="pi pi-file-pdf" aria-hidden="true" /></span>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium text-ink">{{ file.name }}</p>
              <p class="text-xs text-muted">{{ formatBytes(file.size) }} · {{ progress < 100 ? `Preparing ${progress}%` : 'Ready to submit' }}</p>
              <ProgressBar :value="progress" :show-value="false" style="height: 4px" class="mt-1.5" :aria-label="`${label} progress`" />
            </div>
            <Button v-if="previewUrl" as="a" :href="previewUrl" target="_blank" rel="noopener" icon="pi pi-eye" severity="secondary" text rounded size="small" :aria-label="`Preview ${file.name}`" />
            <Button icon="pi pi-times" severity="danger" text rounded size="small" :aria-label="`Remove ${file.name}`" @click="remove(removeFileCallback)" />
          </li>
        </ul>
      </template>
      <template #empty>
        <div v-if="!modelValue" class="flex items-center justify-center gap-2 py-3 text-sm text-muted">
          <i class="pi pi-cloud-upload" aria-hidden="true" /> Drag and drop a file here
        </div>
      </template>
    </FileUpload>
    <small v-if="readError" class="text-bad" role="alert">{{ readError }}</small>
  </div>
</template>
