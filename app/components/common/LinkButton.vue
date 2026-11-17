<script setup lang="ts">
import { NuxtLink } from '#components'

// PrimeVue's `as="NuxtLink"` (a string) renders a literal <nuxtlink> element that never navigates.
// Passing the component itself gives a real, client-routed anchor styled as a PrimeVue Button.
defineOptions({ inheritAttrs: false })
</script>

<template>
  <Button :as="NuxtLink" v-bind="$attrs" severity="success" />
</template>
