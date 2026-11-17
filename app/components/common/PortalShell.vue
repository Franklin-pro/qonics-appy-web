<script setup lang="ts">
/** Shared frame for applicant and admin areas: fixed sidebar on desktop, PrimeVue Drawer on mobile. */
const open = ref(false)
const route = useRoute()
watch(() => route.fullPath, () => { open.value = false })
</script>

<template>
  <div class="min-h-screen bg-canvas">
    <aside class="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">
      <slot name="sidebar" />
    </aside>
    <Drawer
      v-model:visible="open"
      position="left"
      :show-close-icon="false"
      :pt="{ root: { class: '!w-72 !border-0 !bg-navy' }, header: { class: '!hidden' }, content: { class: '!p-0' } }"
    >
      <slot name="sidebar" />
    </Drawer>

    <div class="min-w-0 lg:pl-64">
      <DemoBanner />
      <header class="sticky top-0 z-20 border-b border-line bg-white/90 backdrop-blur">
        <slot name="header" :open-menu="() => (open = true)" />
      </header>
      <main id="main" class="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
        <slot />
      </main>
    </div>
  </div>
</template>
