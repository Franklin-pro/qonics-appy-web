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
  if (auth.user && !store.profile) await store.fetchProfile(auth.user.id)
  fill()
})

const save = handleSubmit(async (v) => {
  if (!auth.user || !store.profile) return
  try {
    await store.saveProfile(auth.user.id, { ...store.profile, ...v })
    auth.updateUser({ fullName: v.fullName, phone: v.phone })
    toast.add({
      severity: auth.demoMode ? 'warn' : 'success',
      summary: auth.demoMode ? 'Saved to demo data' : 'Profile saved',
      detail: auth.demoMode ? 'Kept in this browser tab only.' : undefined, life: 3500
    })
    fill()
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Could not save profile', detail: (e as Error).message, life: 5000 })
  }
})
</script>

<template>
  <div class="mx-auto max-w-4xl">
    <PageHeader title="My profile" subtitle="Reviewers see this information with every application." />
    <LoadingState v-if="store.loading && !store.profile" :rows="5" />
    <ErrorState v-else-if="store.error" :message="store.error" @retry="auth.user && store.fetchProfile(auth.user.id).then(fill)" />

    <form v-else class="space-y-6" novalidate @submit.prevent="save">
      <Card>
        <template #title><span class="text-base">Personal information</span></template>
        <template #content>
          <div class="grid gap-4 sm:grid-cols-2">
            <AppField id="fullName" label="Full name" :error="errors.fullName" required><InputText id="fullName" v-model="fullName" :invalid="!!errors.fullName" fluid /></AppField>
            <AppField id="email" label="Email" hint="Contact support to change your email."><InputText id="email" v-model="email" disabled fluid /></AppField>
            <AppField id="phone" label="Phone" :error="errors.phone" required><InputText id="phone" v-model="phone" type="tel" :invalid="!!errors.phone" fluid /></AppField>
            <div class="grid grid-cols-2 gap-4">
              <AppField id="country" label="Country" :error="errors.country" required><InputText id="country" v-model="country" :invalid="!!errors.country" fluid /></AppField>
              <AppField id="city" label="City" :error="errors.city" required><InputText id="city" v-model="city" :invalid="!!errors.city" fluid /></AppField>
            </div>
          </div>
        </template>
      </Card>

      <Card>
        <template #title><span class="text-base">Academic information</span></template>
        <template #content>
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
        </template>
      </Card>

      <Card>
        <template #title><span class="text-base">Technical information</span></template>
        <template #content>
          <div class="space-y-4">
            <AppField id="skills" label="Technical skills" :error="errors.skills" hint="Type a skill and press Enter." required>
              <InputTags v-model="skills" input-id="skills" :invalid="!!errors.skills" fluid />
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
        </template>
      </Card>

      <div class="flex justify-end gap-2">
        <Button label="Reset" severity="secondary" outlined type="button" @click="fill" />
        <Button type="submit" label="Save profile" icon="pi pi-check" :loading="saving" :disabled="!formMeta.dirty" />
      </div>
    </form>
  </div>
</template>
