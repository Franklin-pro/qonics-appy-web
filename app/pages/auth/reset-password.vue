<script setup lang="ts">
import { useForm } from 'vee-validate'
import { z } from 'zod'
import { authService } from '~/services/authService'

definePageMeta({ layout: 'auth', middleware: 'guest' })
useHead({ title: 'Reset password | Qonics Inc.' })

const route = useRoute()
const toast = useToast()
const token = computed(() => (typeof route.query.token === 'string' ? route.query.token : ''))
const submitting = ref(false)
const formError = ref('')

const { errors, defineField, handleSubmit } = useForm({
  validationSchema: zodSchema(z.object({
    password: z.string().min(8, 'Use at least 8 characters').refine(p => passwordScore(p) >= 3, 'Add upper and lower case letters, a number or a symbol'),
    confirmPassword: z.string().min(1, 'Confirm your password')
  }).refine(v => v.password === v.confirmPassword, { path: ['confirmPassword'], message: 'Passwords do not match' })),
  initialValues: { password: '', confirmPassword: '' }
})
const [password] = defineField('password')
const [confirmPassword] = defineField('confirmPassword')

const submit = handleSubmit(async (v) => {
  submitting.value = true
  formError.value = ''
  try {
    await authService.resetPassword(token.value, v.password)
    toast.add({
      severity: 'success',
      summary: 'Password updated',
      detail: 'Sign in with your new password.', life: 5000
    })
    await navigateTo('/auth/login')
  } catch (e) {
    formError.value = (e as Error).message
  } finally {
    submitting.value = false
  }
})
</script>

<template>
  <div class="surface-card p-7">
    <h1 class="text-2xl font-bold text-navy">Set a new password</h1>
    <p class="mt-1 text-sm text-muted">Choose a strong password you have not used before.</p>
    <Message v-if="!token" severity="error" :closable="false" class="mt-5">This reset link is missing its token. Request a new link.</Message>
    <Message v-if="formError" severity="error" :closable="false" class="mt-5" role="alert">{{ formError }}</Message>

    <form class="mt-6 space-y-4" novalidate @submit.prevent="submit">
      <AppField id="password" label="New password" :error="errors.password" required>
        <Password v-model="password" input-id="password" :feedback="false" toggle-mask autocomplete="new-password" :invalid="!!errors.password" fluid />
        <PasswordStrength :password="password ?? ''" />
      </AppField>
      <AppField id="confirmPassword" label="Confirm password" :error="errors.confirmPassword" required>
        <Password v-model="confirmPassword" input-id="confirmPassword" :feedback="false" toggle-mask autocomplete="new-password" :invalid="!!errors.confirmPassword" fluid />
      </AppField>
      <Button type="submit" label="Update password" :loading="submitting" :disabled="!token" fluid />
    </form>
    <p class="mt-6 text-center text-sm"><NuxtLink to="/auth/login" class="font-medium text-brand hover:underline">Back to sign in</NuxtLink></p>
  </div>
</template>
