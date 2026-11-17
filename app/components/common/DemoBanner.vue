<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const auth = useAuthStore()
</script>

<template>
  <div v-if="auth.demoMode" class="border-b border-warn/30 bg-amber-50 px-4 py-1.5 text-center text-xs text-amber-900">
    <i class="pi pi-info-circle mr-1" aria-hidden="true" />
    <strong>Demo mode:</strong> no backend is connected. Data shown is sample data held in this browser tab and reset when you reload.
  </div>
</template>
