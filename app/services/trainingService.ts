import type { TrainingEnrollmentInput, TrainingModule, TrainingPackage, TrainingPackageInput } from '~/types/training'
import { api } from './api'
import { rows, toTrainingModule, toTrainingPackage } from './mappers'

const sortPackages = (list: TrainingPackage[]) => [...list].sort((a, b) => a.displayOrder - b.displayOrder)

const fromPackage = (p: TrainingPackageInput) => ({
  name: p.name, slug: p.slug, description: p.description, price: p.price, currency: p.currency,
  duration: p.duration || null, module_ids: p.moduleIds, recommended: p.recommended, active: p.active, display_order: p.displayOrder
})

export const trainingService = {
  /** Public: active packages. */
  async getTrainingPackages(): Promise<TrainingPackage[]> {
    return sortPackages(rows(await api('/packages'), 'packages').map(toTrainingPackage).filter(p => p.active))
  },

  async getTrainingPackage(id: string | number): Promise<TrainingPackage> {
    return toTrainingPackage(await api(`/packages/${id}`))
  },

  async getTrainingModules(): Promise<TrainingModule[]> {
    return rows(await api('/training-modules'), 'modules').map(toTrainingModule)
  },

  async submitTrainingEnrollment(d: TrainingEnrollmentInput): Promise<void> {
    await api('/training-enrollments', {
      method: 'POST',
      body: {
        package_id: d.packageId, full_name: d.fullName, email: d.email, phone: d.phone,
        preferred_schedule: d.preferredSchedule, message: d.message
      }
    })
  },

  /** Admin: every package, including inactive ones. */
  async listAllPackages(): Promise<TrainingPackage[]> {
    return sortPackages(rows(await api('/packages', { query: { include_inactive: 'true' } }), 'packages').map(toTrainingPackage))
  },

  async createPackage(input: TrainingPackageInput): Promise<TrainingPackage> {
    return toTrainingPackage(await api('/packages', { method: 'POST', body: fromPackage(input) }))
  },

  async updatePackage(id: string | number, input: TrainingPackageInput): Promise<TrainingPackage> {
    return toTrainingPackage(await api(`/packages/${id}`, { method: 'PUT', body: fromPackage(input) }))
  },

  async deletePackage(id: string | number): Promise<void> {
    await api(`/packages/${id}`, { method: 'DELETE' })
  }
}
