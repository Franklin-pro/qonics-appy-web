<script setup lang="ts">
import type { Application } from '~/types/application'
import { useApplicationsStore } from '~/stores/applications'
import { useAuthStore } from '~/stores/auth'

const props = defineProps<{ application: Application }>()
const store = useApplicationsStore()
const auth = useAuthStore()
const toast = useToast()
const { request, actions, state } = useReviewActions()

const app = computed(() => props.application)
const p = computed(() => app.value.applicant)
const tab = ref('overview')
const note = ref('')
const addingNote = ref(false)

async function addNote() {
  if (!note.value.trim()) return
  addingNote.value = true
  try {
    await store.addNote(app.value.id, note.value.trim())
    note.value = ''
    toast.add({ severity: 'success', summary: 'Note added', life: 2500 })
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Could not add note', detail: (e as Error).message, life: 5000 })
  } finally {
    addingNote.value = false
  }
}

const field = (label: string, value?: string | number | null) => ({ label, value: value || '—' })
const profileFields = computed(() => [
  field('Full name', p.value.fullName), field('Email', p.value.email), field('Phone', p.value.phone),
  field('Location', [p.value.city, p.value.country].filter(Boolean).join(', '))
])
const academicFields = computed(() => [
  field('Institution', p.value.institution), field('Field of study', p.value.fieldOfStudy), field('Qualification', p.value.qualification),
  field('Academic status', p.value.academicStatus), field('Graduation year', p.value.graduationYear)
])
const links = computed(() => [
  { label: 'GitHub', url: p.value.githubUrl, icon: 'pi pi-github' },
  { label: 'LinkedIn', url: p.value.linkedinUrl, icon: 'pi pi-linkedin' },
  { label: 'Portfolio', url: p.value.portfolioUrl, icon: 'pi pi-globe' }
].filter(l => l.url))
</script>

<template>
  <div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
    <div class="surface-card min-w-0 p-1">
      <Tabs v-model:value="tab" scrollable>
        <TabList>
          <Tab value="overview">Overview</Tab>
          <Tab value="applicant">Applicant</Tab>
          <Tab value="documents">Documents ({{ app.documents.length }})</Tab>
          <Tab value="notes">Notes ({{ app.notes.length }})</Tab>
        </TabList>
        <TabPanels>
          <TabPanel value="overview">
            <ApplicationSummary
              :department="app.department" :specialization="app.specialization" :start-date="app.startDate" :education-level="app.educationLevel" :session="app.session"
              :duration-months="app.durationMonths" :work-mode="app.workMode" :motivation="app.motivation" :experience="app.experience"
            />
            <p v-if="app.interviewAt" class="mt-4 rounded-lg bg-primary-50 p-3 text-sm text-primary-700">
              <i class="pi pi-calendar mr-1.5" aria-hidden="true" /> Interview: <strong>{{ formatDate(app.interviewAt, true) }}</strong>
            </p>
          </TabPanel>

          <TabPanel value="applicant">
            <h3 class="mb-3 text-sm font-semibold text-navy">Profile</h3>
            <dl class="grid gap-4 sm:grid-cols-2">
              <div v-for="f in profileFields" :key="f.label"><dt class="text-xs font-medium uppercase tracking-wide text-muted">{{ f.label }}</dt><dd class="mt-0.5 break-words text-sm text-ink">{{ f.value }}</dd></div>
            </dl>
            <h3 class="mb-3 mt-6 text-sm font-semibold text-navy">Academic information</h3>
            <dl class="grid gap-4 sm:grid-cols-2">
              <div v-for="f in academicFields" :key="f.label"><dt class="text-xs font-medium uppercase tracking-wide text-muted">{{ f.label }}</dt><dd class="mt-0.5 text-sm text-ink">{{ f.value }}</dd></div>
            </dl>
            <h3 class="mb-3 mt-6 text-sm font-semibold text-navy">Technical skills</h3>
            <div v-if="p.skills.length" class="flex flex-wrap gap-2"><Tag v-for="s in p.skills" :key="s" :value="s" severity="secondary" rounded /></div>
            <p v-else class="text-sm text-muted">No skills listed.</p>
            <p v-if="p.bio" class="mt-4 text-sm leading-relaxed text-ink">{{ p.bio }}</p>
            <div v-if="links.length" class="mt-4 flex flex-wrap gap-2">
              <Button v-for="l in links" :key="l.label" as="a" :href="l.url" target="_blank" rel="noopener noreferrer" :label="l.label" :icon="l.icon" size="small" severity="secondary" outlined />
            </div>
          </TabPanel>

          <TabPanel value="documents"><DocumentList :documents="app.documents" /></TabPanel>

          <TabPanel value="notes">
            <p class="mb-2 text-xs text-muted">Internal notes are only visible to administrators.</p>
            <Textarea v-model="note" rows="3" auto-resize fluid placeholder="Add an internal review note" aria-label="Internal review note" />
            <Button label="Add note" icon="pi pi-plus" size="small" class="mt-2" :disabled="!note.trim()" :loading="addingNote" @click="addNote" />
            <ul v-if="app.notes.length" class="mt-5 divide-y divide-line">
              <li v-for="n in app.notes" :key="n.id" class="py-3">
                <p class="text-sm text-ink">{{ n.text }}</p>
                <p class="mt-1 text-xs text-muted">{{ n.author }} · {{ formatDate(n.at, true) }}</p>
              </li>
            </ul>
            <EmptyState v-else title="No notes yet" icon="pi pi-comment" />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>

    <aside class="min-w-0 space-y-6">
      <div class="surface-card p-4">
        <div class="mb-3 flex items-center justify-between"><h3 class="text-sm font-semibold text-navy">Decision</h3><StatusTag :status="app.status" /></div>
        <div class="flex flex-col gap-2">
          <Button
            v-for="a in actions" :key="a.status" :label="a.label" :icon="a.icon" :severity="a.severity" :outlined="a.status !== 'accepted'"
            :disabled="a.status === app.status || state.busy" size="small" class="!justify-start" @click="request(app, a.status)"
          />
        </div>
      </div>
      <div class="surface-card p-4">
        <h3 class="mb-3 text-sm font-semibold text-navy">Timeline</h3>
        <ApplicationTimeline :events="app.history" />
      </div>
    </aside>
  </div>
</template>
