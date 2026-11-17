<script setup lang="ts">
import { useForm } from 'vee-validate'
import { z } from 'zod'

useHead({ title: 'Contact | Qonics Inc.' })
const toast = useToast()
const email = useRuntimeConfig().public.contactEmail

const { errors, defineField, handleSubmit, resetForm } = useForm({
  validationSchema: zodSchema(z.object({
    name: z.string().trim().min(2, 'Please enter your name'),
    email: z.string().trim().email('Enter a valid email address'),
    message: z.string().trim().min(10, 'Message must be at least 10 characters')
  })),
  initialValues: { name: '', email: '', message: '' }
})
const [name] = defineField('name')
const [from] = defineField('email')
const [message] = defineField('message')

// There is no backend mail endpoint, so the message is handed to the visitor's email app.
const submit = handleSubmit((v) => {
  const body = encodeURIComponent(`${v.message}\n\n— ${v.name} (${v.email})`)
  window.location.href = `mailto:${email}?subject=${encodeURIComponent('Internship enquiry')}&body=${body}`
  toast.add({ severity: 'info', summary: 'Opening your email app', detail: 'Send the drafted message from there. Nothing has been sent yet.', life: 6000 })
  resetForm()
})
</script>

<template>
  <div>
    <PageBanner eyebrow="Contact" title="Talk to the internship team" lead="Questions about the program or your application? Send us a message." />
    <section class="container-x grid gap-8 py-12 lg:grid-cols-[1fr_1.4fr]">
      <div class="space-y-4">
        <div class="surface-card flex gap-3 p-5">
          <i class="pi pi-envelope mt-0.5 text-brand" aria-hidden="true" />
          <div><p class="font-semibold text-navy">Email</p><a :href="`mailto:${email}`" class="text-sm text-brand hover:underline">{{ email }}</a></div>
        </div>
        <div class="surface-card flex gap-3 p-5">
          <i class="pi pi-clock mt-0.5 text-brand" aria-hidden="true" />
          <div><p class="font-semibold text-navy">Response time</p><p class="text-sm text-muted">We aim to reply within a few working days.</p></div>
        </div>
      </div>
      <form class="surface-card space-y-4 p-6" novalidate @submit.prevent="submit">
        <AppField id="c-name" label="Full name" :error="errors.name" required>
          <InputText id="c-name" v-model="name" autocomplete="name" :invalid="!!errors.name" fluid />
        </AppField>
        <AppField id="c-email" label="Email" :error="errors.email" required>
          <InputText id="c-email" v-model="from" type="email" autocomplete="email" :invalid="!!errors.email" fluid />
        </AppField>
        <AppField id="c-message" label="Message" :error="errors.message" required>
          <Textarea id="c-message" v-model="message" rows="5" auto-resize :invalid="!!errors.message" fluid />
        </AppField>
        <Button type="submit" label="Compose email" icon="pi pi-send" severity="success"/>
      </form>
    </section>
  </div>
</template>
