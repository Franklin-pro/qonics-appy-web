<script setup lang="ts">
export interface NavItem { label: string; icon: string; to: string; exact?: boolean; badge?: number }

defineProps<{ items: NavItem[]; area: string }>()
const route = useRoute()
const { signOut } = useAuth()

const isActive = (item: NavItem) => (item.exact ? route.path === item.to : route.path === item.to || route.path.startsWith(item.to + '/'))
</script>

<template>
  <div class="flex h-full flex-col bg-navy text-white">
    <div class="px-5 pb-4 pt-5">
      <AppLogo light :to="area === 'Admin' ? '/admin' : '/applicant'" />
      <p class="mt-3 text-[11px] font-semibold uppercase tracking-widest text-white/50">{{ area }}</p>
    </div>
    <nav class="flex-1 space-y-1 overflow-y-auto px-3" :aria-label="`${area} navigation`">
      <NuxtLink
        v-for="item in items"
        :key="item.to"
        v-ripple
        :to="item.to"
        class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
        :class="isActive(item) ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'"
        :aria-current="isActive(item) ? 'page' : undefined"
      >
        <i :class="item.icon" class="w-4 text-center" aria-hidden="true" />
        <span class="flex-1">{{ item.label }}</span>
        <Badge v-if="item.badge" :value="item.badge" severity="info" size="small" />
      </NuxtLink>
    </nav>
    <div class="border-t border-white/10 p-3">
      <button
        v-ripple
        type="button"
        class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
        @click="signOut"
      >
        <i class="pi pi-sign-out w-4 text-center" aria-hidden="true" /> Logout
      </button>
    </div>
  </div>
</template>
