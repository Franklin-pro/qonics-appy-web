<script setup lang="ts">
import { useForm } from 'vee-validate'
import { z } from 'zod'
import { DEMO_ACCOUNTS } from '~/services/mock/db'

definePageMeta({ layout: 'auth', middleware: 'guest' })
useHead({ title: 'Login | Qonics Inc.' })

const { signIn, store } = useAuth()
const submitting = ref(false)
const formError = ref('')

const { errors, defineField, handleSubmit, setValues } = useForm({
  validationSchema: zodSchema(z.object({
    email: z.string().trim().email('Enter a valid email address'),
    password: z.string().min(1, 'Enter your password'),
    remember: z.boolean().optional()
  })),
  initialValues: { email: '', password: '', remember: true }
})
const [email] = defineField('email')
const [password] = defineField('password')
const [remember] = defineField('remember')

const submit = handleSubmit(async (v) => {
  submitting.value = true
  formError.value = ''
  try {
    await signIn(v.email, v.password)
  } catch (e) {
    formError.value = (e as Error).message
  } finally {
    submitting.value = false
  }
})

const useDemo = (role: 'applicant' | 'admin') => setValues({ email: DEMO_ACCOUNTS[role].email, password: DEMO_ACCOUNTS[role].password })
</script>

<template>
  <div class="surface-card p-7">
    <h1 class="text-2xl font-bold text-navy">Welcome back</h1>
    <p class="mt-1 text-sm text-muted">Sign in to manage your internship applications.</p>

    <Message v-if="store.demoMode" severity="warn" size="small" :closable="false" class="mt-5">
      <p class="text-xs">No backend is connected. Use a demo account:</p>
      <div class="mt-2 flex gap-2">
        <Button label="Applicant" size="small" severity="secondary" outlined @click="useDemo('applicant')" />
        <Button label="Admin" size="small" severity="secondary" outlined @click="useDemo('admin')" />
      </div>
    </Message>

    <Message v-if="formError" severity="error" :closable="false" class="mt-5" role="alert">{{ formError }}</Message>

    <form class="mt-6 space-y-4" novalidate @submit.prevent="submit">
      <AppField id="email" label="Email" :error="errors.email" required>
        <InputText id="email" v-model="email" type="email" autocomplete="email" :invalid="!!errors.email" fluid />
      </AppField>
      <AppField id="password" label="Password" :error="errors.password" required>
        <Password v-model="password" input-id="password" :feedback="false" toggle-mask autocomplete="current-password" :invalid="!!errors.password" fluid />
      </AppField>
      <div class="flex items-center justify-between">
        <label class="flex items-center gap-2 text-sm text-ink"><Checkbox v-model="remember" binary input-id="remember" /> Remember me</label>
        <NuxtLink to="/auth/forgot-password" class="text-sm font-medium text-brand hover:underline">Forgot password?</NuxtLink>
      </div>
      <Button type="submit" label="Sign in" :loading="submitting" fluid severity="success" />
    </form>
    <p class="mt-6 text-center text-sm text-muted">New here? <NuxtLink to="/auth/register" class="font-medium text-brand hover:underline">Create an account</NuxtLink></p>
  </div>
</template>
