<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const props = defineProps<{ title: string; settingsTo: string }>()
defineEmits<{ menu: [] }>()

const auth = useAuthStore()
const { signOut } = useAuth()
const menu = ref()
const menuItems = computed(() => [
  { label: 'Settings', icon: 'pi pi-cog', command: () => navigateTo(props.settingsTo) },
  { separator: true },
  { label: 'Logout', icon: 'pi pi-sign-out', command: () => signOut() }
])
</script>

<template>
  <div class="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
    <Button icon="pi pi-bars" severity="secondary" text rounded class="lg:!hidden" aria-label="Open navigation" @click="$emit('menu')" />
    <p class="text-sm font-medium text-muted">{{ title }}</p>
    <div class="ml-auto flex items-center gap-2">
      <slot />
      <button
        type="button"
        class="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-surface-100"
        aria-haspopup="true"
        aria-label="Account menu"
        @click="menu.toggle($event)"
      >
        <Avatar :label="initials(auth.user?.fullName ?? '?')" shape="circle" class="!bg-brand/10 !text-xs !font-semibold !text-brand" />
        <span class="hidden text-left sm:block">
          <span class="block text-sm font-medium leading-tight text-ink">{{ auth.user?.fullName }}</span>
          <span class="block text-xs leading-tight text-muted">{{ auth.user?.email }}</span>
        </span>
        <i class="pi pi-angle-down text-xs text-muted" aria-hidden="true" />
      </button>
      <Menu ref="menu" :model="menuItems" popup />
    </div>
  </div>
</template>
