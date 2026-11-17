<script setup lang="ts">
defineProps<{ eyebrow: string; title: string; lead?: string }>()
</script>

<template>
  <section class="border-b border-line bg-white">
    <div class="container-x py-14 sm:py-20">
      <p class="eyebrow">{{ eyebrow }}</p>
      <h1 class="h-display mt-3 !text-3xl sm:!text-4xl">{{ title }}</h1>
      <p v-if="lead" class="lead mt-4">{{ lead }}</p>
    </div>
  </section>
</template>
