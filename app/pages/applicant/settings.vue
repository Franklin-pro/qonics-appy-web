<script setup lang="ts">
import { useForm } from 'vee-validate'
import { z } from 'zod'
import { authService } from '~/services/authService'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'applicant', middleware: ['auth', 'applicant'] })
useHead({ title: 'Settings | Qonics Inc.' })

const auth = useAuthStore()
const toast = useToast()
const saving = ref(false)
const formError = ref('')

const { errors, defineField, handleSubmit, resetForm } = useForm({
  validationSchema: zodSchema(z.object({
    currentPassword: z.string().min(1, 'Enter your current password'),
    newPassword: z.string().min(8, 'Use at least 8 characters').refine(p => passwordScore(p) >= 3, 'Add upper and lower case letters, a number or a symbol'),
    confirmPassword: z.string().min(1, 'Confirm the new password')
  }).refine(v => v.newPassword === v.confirmPassword, { path: ['confirmPassword'], message: 'Passwords do not match' })),
  initialValues: { currentPassword: '', newPassword: '', confirmPassword: '' }
})
const [currentPassword] = defineField('currentPassword')
const [newPassword] = defineField('newPassword')
const [confirmPassword] = defineField('confirmPassword')

const submit = handleSubmit(async (v) => {
  if (!auth.user) return
  saving.value = true
  formError.value = ''
  try {
    await authService.changePassword(auth.user.email, v.currentPassword, v.newPassword)
    toast.add({ severity: 'success', summary: 'Password updated', life: 3000 })
    resetForm()
  } catch (e) {
    formError.value = (e as Error).message
  } finally {
    saving.value = false
  }
})
</script>

<template>
  <div class="mx-auto max-w-2xl space-y-6">
    <PageHeader title="Settings" subtitle="Manage your account." />
    <Card>
      <template #title><span class="text-base">Account</span></template>
      <template #content>
        <dl class="grid gap-4 sm:grid-cols-2">
          <div><dt class="text-xs font-medium uppercase tracking-wide text-muted">Name</dt><dd class="mt-0.5 text-sm text-ink">{{ auth.user?.fullName }}</dd></div>
          <div><dt class="text-xs font-medium uppercase tracking-wide text-muted">Email</dt><dd class="mt-0.5 text-sm text-ink">{{ auth.user?.email }}</dd></div>
        </dl>
        <p class="mt-3 text-sm text-muted">Update your name and contact details from <NuxtLink to="/applicant/profile" class="text-brand hover:underline">My Profile</NuxtLink>.</p>
      </template>
    </Card>
    <Card>
      <template #title><span class="text-base">Change password</span></template>
      <template #content>
        <Message v-if="formError" severity="error" :closable="false" class="mb-4" role="alert">{{ formError }}</Message>
        <form class="space-y-4" novalidate @submit.prevent="submit">
          <AppField id="currentPassword" label="Current password" :error="errors.currentPassword" required>
            <Password v-model="currentPassword" input-id="currentPassword" :feedback="false" toggle-mask autocomplete="current-password" :invalid="!!errors.currentPassword" fluid />
          </AppField>
          <AppField id="newPassword" label="New password" :error="errors.newPassword" required>
            <Password v-model="newPassword" input-id="newPassword" :feedback="false" toggle-mask autocomplete="new-password" :invalid="!!errors.newPassword" fluid />
            <PasswordStrength :password="newPassword ?? ''" />
          </AppField>
          <AppField id="confirmPassword" label="Confirm new password" :error="errors.confirmPassword" required>
            <Password v-model="confirmPassword" input-id="confirmPassword" :feedback="false" toggle-mask autocomplete="new-password" :invalid="!!errors.confirmPassword" fluid />
          </AppField>
          <Button type="submit" label="Update password" :loading="saving" />
        </form>
      </template>
    </Card>
  </div>
</template>
