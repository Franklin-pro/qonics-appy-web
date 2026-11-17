<script setup lang="ts">
/**
 * Uses the supplied logo (public/qonics-logo.jpeg, a 1024px square with wide margins). The mark and the
 * wordmark are cropped out of that one file with CSS and set side by side so the logo fits a header.
 * `light` is for dark backgrounds: the artwork sits on a white chip.
 */
const props = withDefaults(defineProps<{ light?: boolean; to?: string; size?: number }>(), { size: 42 })

const SRC = '/qonics-logo.jpeg'
const SIDE = 1024
const scale = computed(() => props.size / 235) // 235px = height of the mark inside the source image

const crop = (x: number, y: number, w: number, h: number) => ({
  width: `${w * scale.value}px`,
  height: `${h * scale.value}px`,
  backgroundImage: `url(${SRC})`,
  backgroundRepeat: 'no-repeat',
  backgroundSize: `${SIDE * scale.value}px ${SIDE * scale.value}px`,
  backgroundPosition: `${-x * scale.value}px ${-y * scale.value}px`,
  mixBlendMode: 'multiply' as const // the JPEG's white background disappears on white surfaces
})
const mark = computed(() => crop(380, 262, 270, 235))
const wordmark = computed(() => crop(268, 500, 492, 97))
</script>

<template>
  <NuxtLink
    :to="to ?? '/'"
    class="inline-flex items-center gap-2"
    :class="light ? 'rounded-lg bg-white px-2.5 py-1.5' : ''"
    aria-label="Qonics Inc. home"
  >
    <span :style="mark" role="img" aria-label="Qonics logo mark" />
    <span :style="wordmark" role="img" aria-label="Qonics Inc" />
  </NuxtLink>
</template>
