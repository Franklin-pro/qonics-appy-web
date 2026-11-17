import type { Department, DepartmentId } from '~/types/department'

// Qonics offers exactly two services; no other departments exist anywhere in the app.
export const DEPARTMENTS: Department[] = [
  {
    id: 'software',
    name: 'Software Development',
    tagline: 'Ship products people use',
    description: 'Design, build and ship web, mobile and backend software with experienced engineers.',
    icon: 'pi pi-code',
    specializations: [
      { id: 'frontend', name: 'Frontend Development', description: 'Interfaces, design systems and web performance.', icon: 'pi pi-desktop' },
      { id: 'backend', name: 'Backend Development', description: 'APIs, services, authentication and integrations.', icon: 'pi pi-server' },
      { id: 'fullstack', name: 'Full-Stack Development', description: 'End-to-end features from database to browser.', icon: 'pi pi-clone' },
      { id: 'mobile', name: 'Mobile Development', description: 'Native and cross-platform mobile applications.', icon: 'pi pi-mobile' },
      { id: 'database', name: 'Database Development', description: 'Schema design, queries, migrations and data pipelines.', icon: 'pi pi-database' }
    ]
  },
  {
    id: 'iot',
    name: 'Internet of Things',
    tagline: 'Connect the physical world',
    description: 'Build connected devices, firmware and smart systems that bridge hardware and software.',
    icon: 'pi pi-wifi',
    specializations: [
      { id: 'embedded', name: 'Embedded Systems', description: 'Firmware and low-level programming for devices.', icon: 'pi pi-microchip' },
      { id: 'arduino-esp32', name: 'Arduino and ESP32', description: 'Prototyping on popular microcontroller platforms.', icon: 'pi pi-bolt' },
      { id: 'sensors', name: 'Sensors and Electronics', description: 'Circuit design, sensing and signal handling.', icon: 'pi pi-sliders-h' },
      { id: 'iot-apps', name: 'IoT Application Development', description: 'Cloud dashboards and apps for connected devices.', icon: 'pi pi-cloud' },
      { id: 'smart-systems', name: 'Smart Systems', description: 'Automation and monitoring for homes, farms and industry.', icon: 'pi pi-sitemap' }
    ]
  }
]

export const departmentOptions = DEPARTMENTS.map(d => ({ label: d.name, value: d.id }))

export function getDepartment(id: DepartmentId | null | undefined) {
  return DEPARTMENTS.find(d => d.id === id)
}

export function departmentName(id: DepartmentId | null | undefined) {
  return getDepartment(id)?.name ?? '—'
}

export function specializationName(dept: DepartmentId | null | undefined, specId: string | null | undefined) {
  return getDepartment(dept)?.specializations.find(s => s.id === specId)?.name ?? '—'
}
