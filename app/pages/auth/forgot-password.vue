<script setup lang="ts">
import { useForm } from 'vee-validate'
import { z } from 'zod'
import { authService } from '~/services/authService'

definePageMeta({ layout: 'auth', middleware: 'guest' })
useHead({ title: 'Forgot password | Qonics Inc.' })

const submitting = ref(false)
const sent = ref(false)
const formError = ref('')

const { errors, defineField, handleSubmit } = useForm({
  validationSchema: zodSchema(z.object({ email: z.string().trim().email('Enter a valid email address') })),
  initialValues: { email: '' }
})
const [email] = defineField('email')

const submit = handleSubmit(async (v) => {
  submitting.value = true
  formError.value = ''
  try {
    await authService.forgotPassword(v.email)
    sent.value = true
  } catch (e) {
    formError.value = (e as Error).message
  } finally {
    submitting.value = false
  }
})
</script>

<template>
  <div class="surface-card p-7">
    <h1 class="text-2xl font-bold text-navy">Forgot your password?</h1>
    <p class="mt-1 text-sm text-muted">Enter your email and we will send you a reset link.</p>

    <Message v-if="sent" severity="success" :closable="false" class="mt-5">If an account exists for that address, a reset link is on its way.</Message>
    <Message v-if="formError" severity="error" :closable="false" class="mt-5" role="alert">{{ formError }}</Message>

    <form v-if="!sent" class="mt-6 space-y-4" novalidate @submit.prevent="submit">
      <AppField id="email" label="Email" :error="errors.email" required>
        <InputText id="email" v-model="email" type="email" autocomplete="email" :invalid="!!errors.email" fluid />
      </AppField>
      <Button type="submit" label="Send reset link" :loading="submitting" fluid />
    </form>
    <p class="mt-6 text-center text-sm"><NuxtLink to="/auth/login" class="font-medium text-brand hover:underline">Back to sign in</NuxtLink></p>
  </div>
</template>
