<script setup lang="ts">
import { useForm } from 'vee-validate'
import { z } from 'zod'

definePageMeta({ layout: 'auth', middleware: 'guest' })
useHead({ title: 'Create account | Qonics Inc.' })

const { store } = useAuth()
const toast = useToast()
const submitting = ref(false)
const formError = ref('')

const schema = z.object({
  fullName: z.string().trim().min(2, 'Enter your full name'),
  email: z.string().trim().email('Enter a valid email address'),
  phone: z.string().trim().regex(/^\+?[\d\s()-]{7,20}$/, 'Enter a valid phone number'),
  password: z.string().min(8, 'Use at least 8 characters').refine(p => passwordScore(p) >= 3, 'Add upper and lower case letters, a number or a symbol'),
  confirmPassword: z.string().min(1, 'Confirm your password'),
  terms: z.boolean().refine(v => v, 'You must accept the terms to continue')
}).refine(v => v.password === v.confirmPassword, { path: ['confirmPassword'], message: 'Passwords do not match' })

const { errors, defineField, handleSubmit } = useForm({ validationSchema: zodSchema(schema), initialValues: { fullName: '', email: '', phone: '', password: '', confirmPassword: '', terms: false } })
const [fullName] = defineField('fullName')
const [email] = defineField('email')
const [phone] = defineField('phone')
const [password] = defineField('password')
const [confirmPassword] = defineField('confirmPassword')
const [terms] = defineField('terms')

const submit = handleSubmit(async (v) => {
  submitting.value = true
  formError.value = ''
  try {
    const user = await store.register({ fullName: v.fullName, email: v.email, phone: v.phone, password: v.password })
    toast.add({ severity: 'success', summary: 'Account created', detail: `Welcome, ${user.fullName}.`, life: 4000 })
    await navigateTo('/applicant/profile')
  } catch (e) {
    formError.value = (e as Error).message
  } finally {
    submitting.value = false
  }
})
</script>

<template>
  <div class="surface-card p-7">
    <h1 class="text-2xl font-bold text-navy">Create your account</h1>
    <p class="mt-1 text-sm text-muted">It takes a minute. Then complete your profile and apply.</p>
    <Message v-if="formError" severity="error" :closable="false" class="mt-5" role="alert">{{ formError }}</Message>

    <form class="mt-6 space-y-4" novalidate @submit.prevent="submit">
      <AppField id="fullName" label="Full name" :error="errors.fullName" required>
        <InputText id="fullName" v-model="fullName" autocomplete="name" :invalid="!!errors.fullName" fluid />
      </AppField>
      <div class="grid gap-4 sm:grid-cols-2">
        <AppField id="email" label="Email" :error="errors.email" required>
          <InputText id="email" v-model="email" type="email" autocomplete="email" :invalid="!!errors.email" fluid />
        </AppField>
        <AppField id="phone" label="Phone" :error="errors.phone" required>
          <InputText id="phone" v-model="phone" type="tel" autocomplete="tel" :invalid="!!errors.phone" fluid />
        </AppField>
      </div>
      <AppField id="password" label="Password" :error="errors.password" required>
        <Password v-model="password" input-id="password" :feedback="false" toggle-mask autocomplete="new-password" :invalid="!!errors.password" fluid />
        <PasswordStrength :password="password ?? ''" />
      </AppField>
      <AppField id="confirmPassword" label="Confirm password" :error="errors.confirmPassword" required>
        <Password v-model="confirmPassword" input-id="confirmPassword" :feedback="false" toggle-mask autocomplete="new-password" :invalid="!!errors.confirmPassword" fluid />
      </AppField>
      <div>
        <label class="flex items-start gap-2 text-sm text-ink">
          <Checkbox v-model="terms" binary input-id="terms" :invalid="!!errors.terms" class="mt-0.5" />
          <span>I agree to the Terms and Conditions and the Privacy Policy.</span>
        </label>
        <small v-if="errors.terms" class="text-bad" role="alert">{{ errors.terms }}</small>
      </div>
      <Button type="submit" label="Create account" :loading="submitting" fluid severity="success" />
    </form>
    <p class="mt-6 text-center text-sm text-muted">Already registered? <NuxtLink to="/auth/login" class="font-medium text-brand hover:underline">Sign in</NuxtLink></p>
  </div>
</template>
