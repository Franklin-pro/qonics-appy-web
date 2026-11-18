<script setup lang="ts">
import { useForm } from 'vee-validate'
import { z } from 'zod'
import { useApplicantStore } from '~/stores/applicant'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'applicant', middleware: ['auth', 'applicant'] })
useHead({ title: 'My Profile | Qonics Inc.' })

const auth = useAuthStore()
const store = useApplicantStore()
const toast = useToast()
const saving = computed(() => store.saving)
const editing = ref(false)
const profile = computed(() => store.profile)
const show = (v: string | number | null | undefined) => (v === null || v === undefined || v === '' ? '—' : String(v))
const links = computed(() => [
  { label: 'GitHub', url: profile.value?.githubUrl },
  { label: 'LinkedIn', url: profile.value?.linkedinUrl },
  { label: 'Portfolio', url: profile.value?.portfolioUrl }
])

const statusOptions = ['Undergraduate', 'Final-year student', 'Recent graduate', 'Postgraduate']
const qualificationOptions = ['Certificate', 'Diploma', 'BSc', 'BEng', 'BTech', 'MSc', 'Other']
const yearOptions = Array.from({ length: 8 }, (_, i) => new Date().getFullYear() - 2 + i)

const schema = z.object({
  fullName: z.string().trim().min(2, 'Enter your full name'),
  email: z.string(),
  phone: z.string().trim().regex(/^\+?[\d\s()-]{7,20}$/, 'Enter a valid phone number'),
  country: z.string().trim().min(2, 'Enter your country'),
  city: z.string().trim().min(2, 'Enter your city'),
  institution: z.string().trim().min(2, 'Enter your institution'),
  fieldOfStudy: z.string().trim().min(2, 'Enter your field of study'),
  qualification: z.string().min(1, 'Select a qualification'),
  academicStatus: z.string().min(1, 'Select your academic status'),
  graduationYear: z.number({ error: 'Select a graduation year' }),
  skills: z.array(z.string()).min(1, 'Add at least one skill'),
  bio: z.string().trim().max(600, 'Keep your biography under 600 characters'),
  githubUrl: optionalUrl('GitHub URL'),
  linkedinUrl: optionalUrl('LinkedIn URL'),
  portfolioUrl: optionalUrl('Portfolio URL')
})

const { errors, defineField, handleSubmit, resetForm, meta: formMeta } = useForm({ validationSchema: zodSchema(schema) })
const [fullName] = defineField('fullName')
const [email] = defineField('email')
const [phone] = defineField('phone')
const [country] = defineField('country')
const [city] = defineField('city')
const [institution] = defineField('institution')
const [fieldOfStudy] = defineField('fieldOfStudy')
const [qualification] = defineField('qualification')
const [academicStatus] = defineField('academicStatus')
const [graduationYear] = defineField('graduationYear')
const [skills] = defineField('skills')
const [bio] = defineField('bio')
const [githubUrl] = defineField('githubUrl')
const [linkedinUrl] = defineField('linkedinUrl')
const [portfolioUrl] = defineField('portfolioUrl')

function fill() {
  if (store.profile) {
    const { id: _id, ...values } = store.profile
    resetForm({ values })
  }
}
onMounted(async () => {
  if (auth.user && !store.profile) await store.fetchProfile()
  fill()
})

const save = handleSubmit(async (v) => {
  if (!auth.user || !store.profile) return
  try {
    await store.saveProfile({ ...store.profile, ...v })
    auth.updateUser({ fullName: v.fullName, phone: v.phone })
    toast.add({ severity: 'success', summary: 'Profile saved', life: 3500 })
    editing.value = false
    fill()
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Could not save profile', detail: (e as Error).message, life: 5000 })
  }
})

function openEdit() {
  fill()
  editing.value = true
}

function cancelEdit() {
  editing.value = false
  fill()
}
</script>

<template>
  <div class="mx-auto max-w-4xl">
    <PageHeader title="My profile" subtitle="Reviewers see this information with every application.">
      <Button v-if="profile" label="Update profile" icon="pi pi-pencil" @click="openEdit" />
    </PageHeader>
    <LoadingState v-if="store.loading && !store.profile" :rows="5" />
    <ErrorState v-else-if="store.error" :message="store.error" @retry="auth.user && store.fetchProfile().then(fill)" />

    <div v-else-if="profile" class="space-y-6">
      <Message v-if="!store.isComplete" severity="info" :closable="false">
        Your profile is incomplete. Click <strong>Update profile</strong> and add your institution, field of study, academic status and at least one skill before applying.
      </Message>

      <Card>
        <template #title><span class="text-base">Personal information</span></template>
        <template #content>
          <dl class="grid gap-x-6 gap-y-4 sm:grid-cols-2">
            <div><dt class="text-xs font-medium uppercase tracking-wide text-muted">Full name</dt><dd class="mt-0.5 text-sm text-ink">{{ show(profile.fullName) }}</dd></div>
            <div><dt class="text-xs font-medium uppercase tracking-wide text-muted">Email</dt><dd class="mt-0.5 break-all text-sm text-ink">{{ show(profile.email) }}</dd></div>
            <div><dt class="text-xs font-medium uppercase tracking-wide text-muted">Phone</dt><dd class="mt-0.5 text-sm text-ink">{{ show(profile.phone) }}</dd></div>
            <div><dt class="text-xs font-medium uppercase tracking-wide text-muted">Location</dt><dd class="mt-0.5 text-sm text-ink">{{ [profile.city, profile.country].filter(Boolean).join(', ') || '—' }}</dd></div>
          </dl>
        </template>
      </Card>

      <Card>
        <template #title><span class="text-base">Academic information</span></template>
        <template #content>
          <dl class="grid gap-x-6 gap-y-4 sm:grid-cols-2">
            <div><dt class="text-xs font-medium uppercase tracking-wide text-muted">Institution</dt><dd class="mt-0.5 text-sm text-ink">{{ show(profile.institution) }}</dd></div>
            <div><dt class="text-xs font-medium uppercase tracking-wide text-muted">Field of study</dt><dd class="mt-0.5 text-sm text-ink">{{ show(profile.fieldOfStudy) }}</dd></div>
            <div><dt class="text-xs font-medium uppercase tracking-wide text-muted">Qualification</dt><dd class="mt-0.5 text-sm text-ink">{{ show(profile.qualification) }}</dd></div>
            <div><dt class="text-xs font-medium uppercase tracking-wide text-muted">Academic status</dt><dd class="mt-0.5 text-sm text-ink">{{ show(profile.academicStatus) }}</dd></div>
            <div><dt class="text-xs font-medium uppercase tracking-wide text-muted">Expected graduation year</dt><dd class="mt-0.5 text-sm text-ink">{{ show(profile.graduationYear) }}</dd></div>
          </dl>
        </template>
      </Card>

      <Card>
        <template #title><span class="text-base">Technical information</span></template>
        <template #content>
          <dl class="space-y-4">
            <div>
              <dt class="text-xs font-medium uppercase tracking-wide text-muted">Technical skills</dt>
              <dd class="mt-1 flex flex-wrap gap-1.5">
                <Tag v-for="s in profile.skills" :key="s" :value="s" severity="secondary" />
                <span v-if="!profile.skills.length" class="text-sm text-ink">—</span>
              </dd>
            </div>
            <div><dt class="text-xs font-medium uppercase tracking-wide text-muted">Short biography</dt><dd class="mt-0.5 whitespace-pre-line text-sm text-ink">{{ show(profile.bio) }}</dd></div>
            <div class="grid gap-4 sm:grid-cols-3">
              <div v-for="l in links" :key="l.label" class="min-w-0">
                <dt class="text-xs font-medium uppercase tracking-wide text-muted">{{ l.label }}</dt>
                <dd class="mt-0.5 truncate text-sm text-ink">
                  <a v-if="l.url" :href="l.url" target="_blank" rel="noopener" class="text-brand hover:underline">{{ l.url }}</a>
                  <template v-else>—</template>
                </dd>
              </div>
            </div>
          </dl>
        </template>
      </Card>
    </div>

    <Dialog v-model:visible="editing" modal header="Update profile" :style="{ width: '56rem' }" :breakpoints="{ '1100px': '90vw' }" :draggable="false" @hide="fill">
      <form id="profile-form" class="space-y-6" novalidate @submit.prevent="save">
        <section>
          <h3 class="mb-3 text-base font-semibold text-navy">Personal information</h3>
          <div class="grid gap-4 sm:grid-cols-2">
            <AppField id="fullName" label="Full name" :error="errors.fullName" required><InputText id="fullName" v-model="fullName" :invalid="!!errors.fullName" fluid /></AppField>
            <AppField id="email" label="Email" hint="Contact support to change your email."><InputText id="email" v-model="email" disabled fluid /></AppField>
            <AppField id="phone" label="Phone" :error="errors.phone" required><InputText id="phone" v-model="phone" type="tel" :invalid="!!errors.phone" fluid /></AppField>
            <div class="grid grid-cols-2 gap-4">
              <AppField id="country" label="Country" :error="errors.country" required><InputText id="country" v-model="country" :invalid="!!errors.country" fluid /></AppField>
              <AppField id="city" label="City" :error="errors.city" required><InputText id="city" v-model="city" :invalid="!!errors.city" fluid /></AppField>
            </div>
          </div>
        </section>

        <section>
          <h3 class="mb-3 text-base font-semibold text-navy">Academic information</h3>
          <div class="grid gap-4 sm:grid-cols-2">
            <AppField id="institution" label="Institution" :error="errors.institution" required><InputText id="institution" v-model="institution" :invalid="!!errors.institution" fluid /></AppField>
            <AppField id="fieldOfStudy" label="Field of study" :error="errors.fieldOfStudy" required><InputText id="fieldOfStudy" v-model="fieldOfStudy" :invalid="!!errors.fieldOfStudy" fluid /></AppField>
            <AppField id="qualification" label="Qualification" :error="errors.qualification" required>
              <Select v-model="qualification" input-id="qualification" :options="qualificationOptions" placeholder="Select" :invalid="!!errors.qualification" fluid />
            </AppField>
            <AppField id="academicStatus" label="Academic status" :error="errors.academicStatus" required>
              <Select v-model="academicStatus" input-id="academicStatus" :options="statusOptions" placeholder="Select" :invalid="!!errors.academicStatus" fluid />
            </AppField>
            <AppField id="graduationYear" label="Expected graduation year" :error="errors.graduationYear" required>
              <Select v-model="graduationYear" input-id="graduationYear" :options="yearOptions" placeholder="Select" :invalid="!!errors.graduationYear" fluid />
            </AppField>
          </div>
        </section>

        <section>
          <h3 class="mb-3 text-base font-semibold text-navy">Technical information</h3>
          <div class="space-y-4">
            <AppField id="skills" label="Technical skills" :error="errors.skills" hint="Type a skill and press Enter." required>
              <AutoComplete v-model="skills" input-id="skills" multiple :typeahead="false" :suggestions="[]" separator="," :invalid="!!errors.skills" fluid />
            </AppField>
            <AppField id="bio" label="Short biography" :error="errors.bio" :hint="`${bio?.length ?? 0}/600`">
              <Textarea id="bio" v-model="bio" rows="4" auto-resize :invalid="!!errors.bio" fluid />
            </AppField>
            <div class="grid gap-4 sm:grid-cols-3">
              <AppField id="githubUrl" label="GitHub URL" :error="errors.githubUrl"><InputText id="githubUrl" v-model="githubUrl" type="url" placeholder="https://github.com/you" :invalid="!!errors.githubUrl" fluid /></AppField>
              <AppField id="linkedinUrl" label="LinkedIn URL" :error="errors.linkedinUrl"><InputText id="linkedinUrl" v-model="linkedinUrl" type="url" placeholder="https://linkedin.com/in/you" :invalid="!!errors.linkedinUrl" fluid /></AppField>
              <AppField id="portfolioUrl" label="Portfolio URL" :error="errors.portfolioUrl"><InputText id="portfolioUrl" v-model="portfolioUrl" type="url" placeholder="https://" :invalid="!!errors.portfolioUrl" fluid /></AppField>
            </div>
          </div>
        </section>
      </form>
      <template #footer>
        <Button label="Cancel" severity="secondary" outlined type="button" @click="cancelEdit" />
        <Button type="submit" form="profile-form" label="Save profile" icon="pi pi-check" :loading="saving" :disabled="!formMeta.dirty" />
      </template>
    </Dialog>
  </div>
</template>
