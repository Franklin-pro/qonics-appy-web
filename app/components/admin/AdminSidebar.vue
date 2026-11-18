<script setup lang="ts">
const items = [
  { label: 'Dashboard', icon: 'pi pi-chart-bar', to: '/admin', exact: true },
  { label: 'Applications', icon: 'pi pi-file-pdf', to: '/admin/applications' },
  { label: 'Applicants', icon: 'pi pi-users', to: '/admin/applicants' },
  { label: 'Departments', icon: 'pi pi-sitemap', to: '/admin/departments' },
  { label: 'Reports', icon: 'pi pi-chart-line', to: '/admin/reports' },
  { label: 'Settings', icon: 'pi pi-cog', to: '/admin/settings' }
]
</script>

<template>
  <SidebarNav :items="items" area="Admin" />
</template>
