<script setup lang="ts">
import type { TrainingPackage, TrainingPackageInput } from '~/types/training'
import { trainingService } from '~/services/trainingService'

definePageMeta({ layout: 'admin', middleware: ['auth', 'admin'] })
useHead({ title: 'Training Packages | Qonics Inc. Admin' })

const { items, loading, failed, reload } = useAdminTrainingPackages()
const { items: modules, loading: modulesLoading, failed: modulesFailed, reload: reloadModules } = useTrainingModules()
const toast = useToast()
const confirm = useConfirm()

const formOpen = ref(false)
const editing = ref<TrainingPackage | null>(null)
const viewing = ref<TrainingPackage | null>(null)
const saving = ref(false)
const busyId = ref<string | number | null>(null)

const errorToast = (summary: string, e: unknown) => toast.add({ severity: 'error', summary, detail: (e as Error).message, life: 5000 })
const toInput = (p: TrainingPackage, patch: Partial<TrainingPackageInput> = {}): TrainingPackageInput => ({
  name: p.name, slug: p.slug, description: p.description, price: p.price, currency: p.currency, duration: p.duration ?? '',
  moduleIds: p.modules.map(m => m.id), recommended: p.recommended, active: p.active, displayOrder: p.displayOrder, ...patch
})

function openForm(pkg: TrainingPackage | null) {
  editing.value = pkg
  formOpen.value = true
}

async function save(input: TrainingPackageInput) {
  saving.value = true
  try {
    if (editing.value) await trainingService.updatePackage(editing.value.id, input)
    else await trainingService.createPackage(input)
    toast.add({ severity: 'success', summary: editing.value ? 'Package updated' : 'Package created', life: 3000 })
    formOpen.value = false
    await reload()
  } catch (e) {
    errorToast('Could not save the package', e)
  } finally {
    saving.value = false
  }
}

async function toggle(pkg: TrainingPackage) {
  busyId.value = pkg.id
  try {
    await trainingService.updatePackage(pkg.id, toInput(pkg, { active: !pkg.active }))
    toast.add({ severity: 'success', summary: `${pkg.name} ${pkg.active ? 'deactivated' : 'activated'}`, life: 3000 })
    await reload()
  } catch (e) {
    errorToast('Could not change the status', e)
  } finally {
    busyId.value = null
  }
}

function remove(pkg: TrainingPackage) {
  confirm.require({
    header: 'Delete package',
    message: `Delete the ${pkg.name} package? It will disappear from the public site. This cannot be undone.`,
    icon: 'pi pi-exclamation-triangle',
    rejectProps: { label: 'Cancel', severity: 'secondary', outlined: true },
    acceptProps: { label: 'Delete', severity: 'danger' },
    accept: async () => {
      busyId.value = pkg.id
      try {
        await trainingService.deletePackage(pkg.id)
        toast.add({ severity: 'success', summary: `${pkg.name} deleted`, life: 3000 })
        await reload()
      } catch (e) {
        errorToast('Could not delete the package', e)
      } finally {
        busyId.value = null
      }
    }
  })
}
</script>

<template>
  <div>
    <PageHeader title="Training Packages" subtitle="Packages shown on the public training page.">
      <Button label="New package" icon="pi pi-plus" @click="openForm(null)" />
    </PageHeader>

    <ErrorState v-if="failed" message="Unable to load training packages." class="mb-4" @retry="reload" />
    <TrainingPackageTable
      v-else :packages="items" :loading="loading" :busy-id="busyId"
      @view="viewing = $event" @edit="openForm($event)" @toggle="toggle" @remove="remove"
    />

    <Dialog v-model:visible="formOpen" modal :header="editing ? `Edit ${editing.name}` : 'New training package'" :style="{ width: '40rem' }" :breakpoints="{ '700px': '95vw' }" :closable="!saving">
      <TrainingPackageForm
        :key="editing?.id ?? 'new'" :pkg="editing" :modules="modules" :modules-loading="modulesLoading" :modules-failed="modulesFailed" :saving="saving"
        @save="save" @cancel="formOpen = false" @reload-modules="reloadModules"
      />
    </Dialog>

    <Dialog :visible="!!viewing" modal :header="viewing?.name" :style="{ width: '30rem' }" :breakpoints="{ '600px': '95vw' }" @update:visible="viewing = null">
      <dl v-if="viewing" class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
        <dt class="text-muted">Price</dt><dd class="font-medium text-navy">{{ formatPrice(viewing.price, viewing.currency) }}</dd>
        <dt class="text-muted">Slug</dt><dd>{{ viewing.slug }}</dd>
        <dt class="text-muted">Duration</dt><dd>{{ viewing.duration ?? '—' }}</dd>
        <dt class="text-muted">Status</dt><dd><TrainingPackageStatusBadge :active="viewing.active" /></dd>
        <dt class="text-muted">Recommended</dt><dd>{{ viewing.recommended ? 'Yes' : 'No' }}</dd>
        <dt class="text-muted">Display order</dt><dd>{{ viewing.displayOrder }}</dd>
        <dt class="text-muted">Description</dt><dd>{{ viewing.description || '—' }}</dd>
        <dt class="text-muted">Modules</dt>
        <dd><ul class="space-y-1"><TrainingPackageFeature v-for="m in viewing.modules" :key="m.id" :name="m.name" /></ul></dd>
      </dl>
    </Dialog>
  </div>
</template>
