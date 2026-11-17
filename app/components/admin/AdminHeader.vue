<script setup lang="ts">
defineEmits<{ menu: [] }>()
</script>

<template>
  <PortalHeader title="Administrator dashboard" settings-to="/admin/settings" @menu="$emit('menu')" />
</template>
