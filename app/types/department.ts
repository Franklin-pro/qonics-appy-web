export type DepartmentId = 'software' | 'iot'

export interface Specialization {
  id: string
  name: string
  description: string
  icon: string
}

export interface Department {
  id: DepartmentId
  name: string
  tagline: string
  description: string
  icon: string
  specializations: Specialization[]
}
