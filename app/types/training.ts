export interface TrainingModule { id: string | number; name: string }

export interface TrainingPackage {
  /** Whatever the API returns; sent back verbatim as `package_id`. */
  id: string | number
  name: string
  slug: string
  description: string
  /** Whole currency units (RWF has no minor unit). */
  price: number
  currency: string
  duration: string | null
  modules: TrainingModule[]
  recommended: boolean
  active: boolean
  displayOrder: number
}

export interface TrainingPackageInput {
  name: string
  slug: string
  description: string
  price: number
  currency: string
  duration: string
  moduleIds: Array<string | number>
  recommended: boolean
  active: boolean
  displayOrder: number
}

export interface TrainingEnrollmentInput {
  packageId: string | number
  fullName: string
  email: string
  phone: string
  preferredSchedule: string
  message: string
}
