<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const auth = useAuthStore()
const route = useRoute()
const open = ref(false)
watch(() => route.fullPath, () => { open.value = false })

const links = [
  { label: 'Home', to: '/' },
  { label: 'About Us', to: '/about' },
  { label: 'Internship Opportunities', to: '/opportunities' },
  { label: 'Departments', to: '/#departments' },
  { label: 'FAQ', to: '/faq' },
  { label: 'Contact', to: '/contact' }
]
const isActive = (to: string) => !to.includes('#') && route.path === to
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur">
    <div class="container-x flex h-16 items-center gap-6">
      <AppLogo />
      <nav class="ml-4 hidden items-center gap-1 lg:flex" aria-label="Main navigation">
        <NuxtLink
          v-for="l in links"
          :key="l.to"
          :to="l.to"
          class="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-brand"
          :class="isActive(l.to) ? 'text-brand' : 'text-ink'"
          :aria-current="isActive(l.to) ? 'page' : undefined"
        >{{ l.label }}</NuxtLink>
      </nav>
      <div class="ml-auto hidden items-center gap-2 lg:flex">
        <template v-if="auth.isAuthenticated">
          <LinkButton :to="auth.homePath" label="My portal" icon="pi pi-th-large" severity="secondary" outlined size="small" />
        </template>
        <template v-else>
          <LinkButton to="/auth/login" label="Login" severity="secondary" text size="small" />
          <LinkButton to="/applicant/apply" label="Apply Now" size="small" />
        </template>
      </div>
      <Button class="ml-auto lg:hidden!" icon="pi pi-bars" severity="secondary" text rounded aria-label="Open menu" @click="open = true" />
    </div>

    <Drawer v-model:visible="open" position="right" header="Menu" class="w-80!">
      <nav class="flex flex-col gap-1" aria-label="Mobile navigation">
        <NuxtLink
          v-for="l in links"
          :key="l.to"
          :to="l.to"
          class="rounded-lg px-3 py-2.5 text-sm font-medium"
          :class="isActive(l.to) ? 'bg-primary-50 text-brand' : 'text-ink hover:bg-surface-100'"
        >{{ l.label }}</NuxtLink>
      </nav>
      <div class="mt-6 flex flex-col gap-2">
        <LinkButton v-if="auth.isAuthenticated" :to="auth.homePath" label="My portal" icon="pi pi-th-large" />
        <template v-else>
          <LinkButton to="/auth/login" label="Login"  outlined />
          <LinkButton to="/applicant/apply" label="Apply Now" />
        </template>
      </div>
    </Drawer>
  </header>
</template>
