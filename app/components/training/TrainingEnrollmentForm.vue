<script setup lang="ts">
import { useForm } from 'vee-validate'
import { z } from 'zod'
import type { TrainingPackage } from '~/types/training'

const props = defineProps<{ pkg: TrainingPackage | null }>()
const visible = defineModel<boolean>('visible', { required: true })

const SCHEDULES = ['Weekdays', 'Weekends', 'Evenings', 'Flexible']
const { submitting, error, submit } = useTrainingEnrollment()
const done = ref(false)

const { errors, defineField, handleSubmit, resetForm } = useForm({
  validationSchema: zodSchema(z.object({
    fullName: z.string().trim().min(2, 'Enter your full name'),
    email: z.email('Enter a valid email address'),
    phone: z.string().trim().regex(/^\+?[0-9 ()-]{8,20}$/, 'Enter a valid phone number, e.g. +250 7xx xxx xxx'),
    preferredSchedule: z.string().min(1, 'Choose a preferred schedule'),
    message: z.string().trim().max(1000, 'Keep it under 1000 characters')
  })),
  initialValues: { fullName: '', email: '', phone: '', preferredSchedule: '', message: '' }
})
const [fullName] = defineField('fullName')
const [email] = defineField('email')
const [phone] = defineField('phone')
const [preferredSchedule] = defineField('preferredSchedule')
const [message] = defineField('message')

// Start fresh every time the dialog opens (also clears a previous success view).
watch(visible, open => { if (open) { resetForm(); done.value = false; error.value = '' } })

const onSubmit = handleSubmit(async v => {
  if (!props.pkg) return
  done.value = await submit({ packageId: props.pkg.id, ...v })
})
</script>

<template>
  <Dialog v-model:visible="visible" modal header="Enroll in a training package" :style="{ width: '32rem' }" :breakpoints="{ '640px': '95vw' }" :closable="!submitting">
    <div v-if="done" class="py-4 text-center" role="status">
      <span class="mx-auto flex size-14 items-center justify-center rounded-full bg-primary-50 text-brand"><i class="pi pi-check text-2xl" aria-hidden="true" /></span>
      <p class="mt-4 text-lg font-semibold text-navy">Enrollment submitted successfully!</p>
      <p class="mt-1 text-sm text-muted">Our training team will contact you shortly.</p>
      <Button class="mt-6" label="Close" @click="visible = false" />
    </div>

    <form v-else-if="pkg" novalidate @submit.prevent="onSubmit">
      <div class="mb-5 rounded-lg border border-brand/30 bg-primary-50 p-4" aria-live="polite">
        <p class="text-xs font-medium uppercase tracking-wide text-muted">You selected</p>
        <p class="mt-0.5 text-lg font-semibold text-navy">{{ pkg.name }} Package</p>
        <p class="text-sm font-medium text-brand">{{ formatPrice(pkg.price, pkg.currency) }}</p>
      </div>
      <Message v-if="error" severity="error" :closable="false" class="mb-4">{{ error }}</Message>
      <div class="grid gap-4">
        <AppField id="te-name" label="Full Name" :error="errors.fullName" required>
          <InputText id="te-name" v-model="fullName" autocomplete="name" :invalid="!!errors.fullName" :aria-describedby="errors.fullName ? 'te-name-error' : undefined" fluid />
        </AppField>
        <AppField id="te-email" label="Email" :error="errors.email" required>
          <InputText id="te-email" v-model="email" type="email" autocomplete="email" :invalid="!!errors.email" :aria-describedby="errors.email ? 'te-email-error' : undefined" fluid />
        </AppField>
        <AppField id="te-phone" label="Phone Number" :error="errors.phone" required>
          <InputText id="te-phone" v-model="phone" type="tel" autocomplete="tel" placeholder="+250..." :invalid="!!errors.phone" :aria-describedby="errors.phone ? 'te-phone-error' : undefined" fluid />
        </AppField>
        <AppField id="te-schedule" label="Preferred Training Schedule" :error="errors.preferredSchedule" required>
          <Select v-model="preferredSchedule" :options="SCHEDULES" input-id="te-schedule" placeholder="Select a schedule" :invalid="!!errors.preferredSchedule" fluid />
        </AppField>
        <AppField id="te-message" label="Message" :error="errors.message" hint="Optional: anything we should know before we contact you.">
          <Textarea id="te-message" v-model="message" rows="3" :invalid="!!errors.message" fluid />
        </AppField>
      </div>
      <div class="mt-6 flex justify-end gap-2">
        <Button type="button" label="Cancel" severity="secondary" text :disabled="submitting" @click="visible = false" />
        <Button type="submit" label="Submit Enrollment" icon="pi pi-send" :loading="submitting" :disabled="submitting" />
      </div>
    </form>
  </Dialog>
</template>
