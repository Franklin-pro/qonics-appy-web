<script setup lang="ts">
import { useForm } from 'vee-validate'
import { z } from 'zod'
import type { TrainingModule, TrainingPackage, TrainingPackageInput } from '~/types/training'

const props = defineProps<{
  /** Package being edited; `null` creates a new one. */
  pkg: TrainingPackage | null
  modules: TrainingModule[]
  modulesLoading?: boolean
  modulesFailed?: boolean
  saving?: boolean
}>()
const emit = defineEmits<{ save: [input: TrainingPackageInput]; cancel: []; reloadModules: [] }>()

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

const { errors, defineField, handleSubmit } = useForm({
  validationSchema: zodSchema(z.object({
    name: z.string().trim().min(2, 'Enter a package name'),
    slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and hyphens'),
    description: z.string().trim().max(500, 'Keep it under 500 characters'),
    price: z.number({ error: 'Enter a price' }).int('Use a whole number').min(0, 'Price cannot be negative'),
    currency: z.string().trim().length(3, 'Use a 3-letter code, e.g. RWF'),
    duration: z.string().trim().max(60, 'Keep it under 60 characters'),
    moduleIds: z.array(z.union([z.string(), z.number()])).min(1, 'Select at least one module'),
    recommended: z.boolean(),
    active: z.boolean(),
    displayOrder: z.number({ error: 'Enter a display order' }).int('Use a whole number').min(0, 'Cannot be negative')
  })),
  initialValues: {
    name: props.pkg?.name ?? '', slug: props.pkg?.slug ?? '', description: props.pkg?.description ?? '',
    price: props.pkg?.price ?? (undefined as unknown as number), currency: props.pkg?.currency ?? 'RWF', duration: props.pkg?.duration ?? '',
    moduleIds: props.pkg?.modules.map(m => m.id) ?? [], recommended: props.pkg?.recommended ?? false, active: props.pkg?.active ?? true,
    displayOrder: props.pkg?.displayOrder ?? 0
  }
})
const [name] = defineField('name')
const [slug] = defineField('slug')
const [description] = defineField('description')
const [price] = defineField('price')
const [currency] = defineField('currency')
const [duration] = defineField('duration')
const [moduleIds] = defineField('moduleIds')
const [recommended] = defineField('recommended')
const [active] = defineField('active')
const [displayOrder] = defineField('displayOrder')

// Suggest a slug from the name until the admin edits the slug themselves (or when editing an existing package).
const slugTouched = ref(!!props.pkg)
watch(name, n => { if (!slugTouched.value) slug.value = slugify(n ?? '') })

const onSubmit = handleSubmit(v => emit('save', { ...v, duration: v.duration }))
</script>

<template>
  <form novalidate @submit.prevent="onSubmit">
    <div class="grid gap-4 sm:grid-cols-2">
      <AppField id="tp-name" label="Package Name" :error="errors.name" required>
        <InputText id="tp-name" v-model="name" :invalid="!!errors.name" fluid />
      </AppField>
      <AppField id="tp-slug" label="Slug" :error="errors.slug" required>
        <InputText id="tp-slug" v-model="slug" :invalid="!!errors.slug" fluid @input="slugTouched = true" />
      </AppField>
      <AppField id="tp-desc" label="Description" :error="errors.description" class="sm:col-span-2">
        <Textarea id="tp-desc" v-model="description" rows="2" :invalid="!!errors.description" fluid />
      </AppField>
      <AppField id="tp-price" label="Price" :error="errors.price" hint="Whole amount, no decimals." required>
        <InputNumber v-model="price" input-id="tp-price" :min="0" :use-grouping="true" :invalid="!!errors.price" fluid />
      </AppField>
      <AppField id="tp-currency" label="Currency" :error="errors.currency" required>
        <InputText id="tp-currency" v-model="currency" maxlength="3" class="uppercase" :invalid="!!errors.currency" fluid @input="currency = (currency ?? '').toUpperCase()" />
      </AppField>
      <AppField id="tp-duration" label="Duration" :error="errors.duration" hint="e.g. 3 months">
        <InputText id="tp-duration" v-model="duration" :invalid="!!errors.duration" fluid />
      </AppField>
      <AppField id="tp-order" label="Display Order" :error="errors.displayOrder" hint="Lower numbers appear first.">
        <InputNumber v-model="displayOrder" input-id="tp-order" :min="0" :use-grouping="false" :invalid="!!errors.displayOrder" fluid />
      </AppField>
      <div class="sm:col-span-2">
        <TrainingModuleSelector v-model="moduleIds" :modules="modules" :loading="modulesLoading" :failed="modulesFailed" :invalid="!!errors.moduleIds" @retry="emit('reloadModules')" />
        <small v-if="errors.moduleIds" class="mt-1 block text-bad" role="alert">{{ errors.moduleIds }}</small>
      </div>
      <label class="flex items-center gap-3 text-sm font-medium text-ink"><ToggleSwitch v-model="recommended" input-id="tp-rec" /> Recommended</label>
      <label class="flex items-center gap-3 text-sm font-medium text-ink"><ToggleSwitch v-model="active" input-id="tp-active" /> Active</label>
    </div>
    <div class="mt-6 flex justify-end gap-2">
      <Button type="button" label="Cancel" severity="secondary" text :disabled="saving" @click="emit('cancel')" />
      <Button type="submit" :label="pkg ? 'Save changes' : 'Create package'" icon="pi pi-check" :loading="saving" :disabled="saving" />
    </div>
  </form>
</template>
