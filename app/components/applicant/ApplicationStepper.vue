<script setup lang="ts">
import { useForm } from 'vee-validate'
import { z } from 'zod'
import type { DocumentType, WorkMode, Application, ApplicationDocument, SessionId } from '~/types/application'
import type { DepartmentId } from '~/types/department'
import { useApplicationsStore } from '~/stores/applications'
import { useAuthStore } from '~/stores/auth'

const emit = defineEmits<{ submitted: [application: Application] }>()

const auth = useAuthStore()
const applications = useApplicationsStore()
const toast = useToast()

const STEPS = ['Department', 'Specialization', 'Details', 'Documents', 'Review']
const step = ref(1)
const submitting = ref(false)
const submitError = ref('')

// Steps 1-2
const department = ref<DepartmentId | null>(null)
const specialization = ref<string | null>(null)
const specializations = computed(() => getDepartment(department.value)?.specializations ?? [])
watch(department, () => { specialization.value = null })

// Step 3 (VeeValidate + Zod)
const today = new Date(new Date().setHours(0, 0, 0, 0))
const { errors, defineField, meta, validate, values } = useForm({
  validationSchema: zodSchema(z.object({
    motivation: z.string().trim().min(50, 'Tell us a bit more (at least 50 characters)').max(1500, 'Keep it under 1500 characters'),
    experience: z.string().trim().min(20, 'Describe your experience (at least 20 characters)').max(1500, 'Keep it under 1500 characters'),
    educationLevel: z.enum(['university', 'high_school'], { error: 'Select your education level' }),
    startDate: z.date({ error: 'Choose a session date' }).min(today, 'The date cannot be in the past')
      .refine(d => d.getDay() !== 0 && d.getDay() !== 6, 'Sessions run Monday to Friday'),
    session: z.enum(['morning', 'afternoon'], { error: 'Choose a session' }),
    durationMonths: z.number({ error: 'Choose a duration' }),
    workMode: z.enum(['onsite', 'remote', 'hybrid'], { error: 'Choose a work mode' })
  })),
  initialValues: { motivation: '', experience: '' }
})
const [motivation] = defineField('motivation')
const [experience] = defineField('experience')
const [educationLevel] = defineField('educationLevel')
const [startDate] = defineField('startDate')
const [session] = defineField('session')
const [durationMonths] = defineField('durationMonths')
const [workMode] = defineField('workMode')
// Session capacity: at most SESSION_CAPACITY students per session per date.
const availabilityError = ref('')
const needsSeat = computed(() => usesSeat(workMode.value))
const monthsForCheck = computed(() => durationMonths.value ?? 3)
const seatsLeft = (s: SessionId) => (startDate.value && needsSeat.value ? seatsFor(applications.availability, s, startDate.value, monthsForCheck.value) : SESSION_CAPACITY)
const slotFull = computed(() => needsSeat.value && !!startDate.value && !!session.value && seatsLeft(session.value) <= 0)
const suggestions = computed(() => (slotFull.value && startDate.value && session.value
  ? suggestSlots(applications.availability, startDate.value, session.value, monthsForCheck.value)
  : []))
const loadAvailability = async () => {
  try { availabilityError.value = ''; await applications.fetchAvailability() } catch (e) { availabilityError.value = (e as Error).message }
}
onMounted(loadAvailability)
function pickSuggestion(s: { date: Date; session: SessionId }) { startDate.value = s.date; session.value = s.session }
const weekendDays = [0, 6]

const durationOptions = [3, 4, 6].map(m => ({ label: `${m} months`, value: m }))
const modeOptions: Array<{ label: string; value: WorkMode }> = [
  { label: 'On-site', value: 'onsite' }, { label: 'Remote', value: 'remote' }, { label: 'Hybrid', value: 'hybrid' }
]

// Step 4
const files = reactive<Record<DocumentType, File | null>>({ cv: null, transcript: null, diploma: null, certificates: null, cover_letter: null })
const isUniversity = computed(() => educationLevel.value === 'university')
interface UploadSlot { type: DocumentType; label: string; required?: boolean; universityOnly?: boolean }
const allUploads: UploadSlot[] = [
  { type: 'cv', label: 'CV / Resume' },
  { type: 'transcript', label: 'Academic transcript', required: true, universityOnly: true },
  { type: 'diploma', label: 'Diploma certificate', universityOnly: true },
  { type: 'certificates', label: 'Supporting certificates' },
  { type: 'cover_letter', label: 'Cover letter' }
]
// High school applicants are not asked for a transcript or diploma.
const uploads = computed(() => allUploads.filter(u => !u.universityOnly || isUniversity.value))
watch(isUniversity, (uni) => {
  if (!uni) { files.transcript = null; files.diploma = null }
})

const valid = computed(() => [
  !!department.value,
  !!specialization.value,
  meta.value.valid && !slotFull.value,
  !isUniversity.value || !!files.transcript
])
/** A step can be opened once every step before it is valid. */
const canOpen = (n: number) => valid.value.slice(0, n - 1).every(Boolean)

async function next() {
  if (step.value === 3) {
    const result = await validate()
    if (!result.valid || slotFull.value) return
  }
  if (valid.value[step.value - 1]) step.value++
}

const attached = computed(() => uploads.value.filter(u => files[u.type]))

async function submit() {
  if (!auth.user || !department.value || !specialization.value) return
  submitting.value = true
  submitError.value = ''
  try {
    const now = new Date().toISOString()
    const documents: ApplicationDocument[] = attached.value.map(u => ({
      id: `${u.type}-${Date.now()}`, type: u.type, name: files[u.type]!.name, size: files[u.type]!.size, uploadedAt: now
    }))
    const v = values
    const app = await applications.create(auth.user.id, {
      department: department.value,
      specialization: specialization.value,
      motivation: v.motivation!.trim(),
      experience: v.experience!.trim(),
      startDate: v.startDate ? new Date(v.startDate).toISOString() : null,
      educationLevel: v.educationLevel!,
      session: v.session!,
      durationMonths: v.durationMonths!,
      workMode: v.workMode!,
      documents
    }, Object.fromEntries(attached.value.map(u => [u.type, files[u.type]!])))
    toast.add({
      severity: auth.demoMode ? 'warn' : 'success',
      summary: auth.demoMode ? 'Saved to demo data' : 'Application submitted',
      detail: auth.demoMode ? 'No backend is connected, so nothing was sent and files were not uploaded.' : `Reference ${app.reference}`,
      life: 6000
    })
    emit('submitted', app)
  } catch (e) {
    submitError.value = (e as Error).message
    void loadAvailability() // someone else may have taken the last seat
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <Stepper v-model:value="step" linear>
    <StepList class="overflow-x-auto">
      <Step v-for="(label, i) in STEPS" :key="label" :value="i + 1" :disabled="!canOpen(i + 1)">{{ label }}</Step>
    </StepList>
    <StepPanels>
      <!-- 1 Department -->
      <StepPanel :value="1">
        <h2 class="text-lg font-semibold text-navy">Choose a department</h2>
        <p class="mb-4 text-sm text-muted">Qonics offers two departments.</p>
        <RadioButtonGroup v-model="department" name="department" class="grid gap-4 sm:grid-cols-2">
          <label
            v-for="d in DEPARTMENTS" :key="d.id" :for="`dept-${d.id}`"
            class="flex cursor-pointer gap-3 rounded-xl border p-4 transition-colors hover:border-brand/60"
            :class="department === d.id ? 'border-brand bg-primary-50' : 'border-line bg-white'"
          >
            <RadioButton :input-id="`dept-${d.id}`" :value="d.id" class="mt-1" />
            <span>
              <span class="flex items-center gap-2 font-semibold text-navy"><i :class="d.icon" aria-hidden="true" /> {{ d.name }}</span>
              <span class="mt-1 block text-sm text-muted">{{ d.description }}</span>
            </span>
          </label>
        </RadioButtonGroup>
      </StepPanel>

      <!-- 2 Specialization -->
      <StepPanel :value="2">
        <h2 class="text-lg font-semibold text-navy">Choose a specialization</h2>
        <p class="mb-4 text-sm text-muted">Within {{ departmentName(department) }}.</p>
        <RadioButtonGroup v-model="specialization" name="specialization" class="grid gap-3 sm:grid-cols-2">
          <label
            v-for="s in specializations" :key="s.id" :for="`spec-${s.id}`"
            class="flex cursor-pointer gap-3 rounded-xl border p-4 transition-colors hover:border-brand/60"
            :class="specialization === s.id ? 'border-brand bg-primary-50' : 'border-line bg-white'"
          >
            <RadioButton :input-id="`spec-${s.id}`" :value="s.id" class="mt-1" />
            <span>
              <span class="font-semibold text-navy">{{ s.name }}</span>
              <span class="mt-0.5 block text-sm text-muted">{{ s.description }}</span>
            </span>
          </label>
        </RadioButtonGroup>
      </StepPanel>

      <!-- 3 Details -->
      <StepPanel :value="3">
        <h2 class="mb-4 text-lg font-semibold text-navy">Application details</h2>
        <AppField id="education" label="Education level" :error="errors.educationLevel" required>
          <RadioButtonGroup v-model="educationLevel" name="education" class="grid gap-3 sm:grid-cols-2">
            <label
              v-for="l in EDUCATION_LEVELS" :key="l.value" :for="`edu-${l.value}`"
              class="flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors hover:border-brand/60"
              :class="educationLevel === l.value ? 'border-brand bg-primary-50' : 'border-line bg-white'"
            >
              <RadioButton :input-id="`edu-${l.value}`" :value="l.value" />
              <i :class="l.icon" aria-hidden="true" /> <span class="font-medium text-navy">{{ l.label }}</span>
            </label>
          </RadioButtonGroup>
        </AppField>

        <AppField id="mode" label="Work mode" :error="errors.workMode" hint="Remote: any session, no seat limit. On-site or hybrid: 6 seats per session." class="mt-4" required>
          <Select v-model="workMode" input-id="mode" :options="modeOptions" option-label="label" option-value="value" placeholder="Select" :invalid="!!errors.workMode" fluid />
        </AppField>

        <div class="mt-4 grid gap-4 sm:grid-cols-2">
          <AppField id="startDate" label="Starting date" :error="errors.startDate" hint="Pick a weekday. You then attend Monday to Friday for the whole internship." required>
            <DatePicker v-model="startDate" input-id="startDate" :min-date="today" :disabled-days="weekendDays" show-icon icon-display="input" date-format="dd M yy" :invalid="!!errors.startDate" fluid />
          </AppField>
          <AppField id="duration" label="Internship duration" :error="errors.durationMonths" required>
            <Select v-model="durationMonths" input-id="duration" :options="durationOptions" option-label="label" option-value="value" placeholder="Select" :invalid="!!errors.durationMonths" fluid />
          </AppField>
        </div>

        <AppField id="session" label="Daily session time" :error="errors.session" hint="You attend Monday to Friday at this time."  class="mt-4" required>
          <RadioButtonGroup v-model="session" name="session" class="grid gap-3 sm:grid-cols-2">
            <label
              v-for="s in SESSIONS" :key="s.id" :for="`ses-${s.id}`"
              class="flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors"
              :class="[
                session === s.id ? 'border-brand bg-primary-50' : 'border-line bg-white',
                startDate && seatsLeft(s.id) <= 0 ? 'border-bad/40' : 'hover:border-brand/60'
              ]"
            >
              <RadioButton :input-id="`ses-${s.id}`" :value="s.id" />
              <span class="flex-1">
                <span class="block font-medium text-navy">{{ s.label }}</span>
                <span class="block text-sm text-muted">{{ s.time }}</span>
              </span>
              <Tag v-if="startDate" :value="!needsSeat ? 'No seat limit' : seatsLeft(s.id) <= 0 ? 'Full' : `${seatsLeft(s.id)} of ${SESSION_CAPACITY} seats left`" :severity="seatsLeft(s.id) <= 0 ? 'danger' : seatsLeft(s.id) <= 2 ? 'warn' : 'success'" rounded class="whitespace-nowrap! text-xs!" />
            </label>
          </RadioButtonGroup>
        </AppField>
        <Message v-if="availabilityError" severity="warn" size="small" :closable="false" class="mt-3">
          Could not check seat availability ({{ availabilityError }}).
          <Button label="Retry" size="small" text @click="loadAvailability" />
        </Message>

        <Message v-if="slotFull" severity="error" :closable="false" class="mt-4" role="alert">
          <p class="font-semibold">That session has no free seats for an internship starting {{ formatDate(startDate) }}.</p>
          <p class="mt-1 text-sm">Interns attend every weekday at the same time, so only {{ SESSION_CAPACITY }} on-site or hybrid students can hold a session at once. Choose one of these starts, or switch to remote (no seat limit):</p>
          <div class="mt-3 flex flex-wrap gap-2">
            <Button
              v-for="s in suggestions" :key="`${dateKey(s.date)}|${s.session}`" size="small" severity="secondary" outlined
              :label="`Start ${formatDate(s.date)} · ${SESSIONS.find(x => x.id === s.session)!.label} (${s.left} left)`" @click="pickSuggestion(s)"
            />
            <span v-if="!suggestions.length" class="text-sm">No open sessions in the next two weeks. Please check back later.</span>
          </div>
        </Message>

        <div class="mt-4 space-y-4">
          <AppField id="motivation" label="Why do you want to intern at Qonics?" :error="errors.motivation" :hint="`${motivation?.length ?? 0}/1500`" required>
            <Textarea id="motivation" v-model="motivation" rows="5" auto-resize :invalid="!!errors.motivation" fluid />
          </AppField>
          <AppField id="experience" label="Relevant experience and projects" :error="errors.experience" :hint="`${experience?.length ?? 0}/1500`" required>
            <Textarea id="experience" v-model="experience" rows="4" auto-resize :invalid="!!errors.experience" fluid />
          </AppField>
        </div>
      </StepPanel>

      <!-- 4 Documents -->
      <StepPanel :value="4">
        <h2 class="text-lg font-semibold text-navy">Upload documents</h2>
        <p class="mb-4 text-sm text-muted">{{ isUniversity ? 'University applicants must upload an academic transcript; a diploma certificate and the rest are optional.' : 'No documents are required for high school applicants; all uploads below are optional.' }}</p>
        <div class="grid gap-5 md:grid-cols-2">
          <DocumentUploadField
            v-for="u in uploads" :key="u.type" :id="`file-${u.type}`" :label="u.label" :required="u.required"
            v-model="files[u.type]"
          />
        </div>
      </StepPanel>

      <!-- 5 Review -->
      <StepPanel :value="5">
        <h2 class="mb-4 text-lg font-semibold text-navy">Review and submit</h2>
        <ApplicationSummary
          :department="department" :specialization="specialization" :start-date="values.startDate ?? null"
          :education-level="values.educationLevel ?? null" :session="values.session ?? null"
          :duration-months="values.durationMonths ?? null" :work-mode="values.workMode ?? null"
          :motivation="values.motivation ?? ''" :experience="values.experience ?? ''"
        />
        <div class="mt-5">
          <p class="mb-1 text-xs font-medium uppercase tracking-wide text-muted">Documents</p>
          <p v-if="!attached.length" class="text-sm text-muted">No documents attached.</p>
          <ul class="space-y-1 text-sm text-ink">
            <li v-for="u in attached" :key="u.type"><i class="pi pi-check-circle mr-1.5 text-ok" aria-hidden="true" />{{ u.label }}: {{ files[u.type]!.name }}</li>
          </ul>
        </div>
        <Message v-if="auth.demoMode" severity="warn" size="small" :closable="false" class="mt-5">
          Demo mode: submitting saves this application to in-browser sample data only. Nothing is sent and files are not uploaded.
        </Message>
        <Message v-if="submitError" severity="error" :closable="false" class="mt-4" role="alert">{{ submitError }}</Message>
      </StepPanel>
    </StepPanels>

    <div class="mt-6 flex items-center justify-between border-t border-line pt-4">
      <Button label="Back" icon="pi pi-arrow-left" severity="secondary" text :disabled="step === 1 || submitting" @click="step--" />
      <Button v-if="step < 5" label="Next" icon="pi pi-arrow-right" severity="success" icon-pos="right" :disabled="step !== 3 && !valid[step - 1]" @click="next" />
      <Button v-else label="Submit application" icon="pi pi-send" severity="success" :loading="submitting" @click="submit" />
    </div>
  </Stepper>
</template>
