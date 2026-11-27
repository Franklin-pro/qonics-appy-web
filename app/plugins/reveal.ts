import type { Directive } from 'vue'

/**
 * v-reveal: fades/slides an element in once it scrolls into view.
 * Usage: v-reveal or v-reveal="120" (delay in ms, useful for staggering).
 * Elements already in the viewport on mount are left alone to avoid a flash.
 */
export default defineNuxtPlugin((nuxtApp) => {
  let observer: IntersectionObserver | null = null
  const getObserver = () =>
    (observer ??= new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue
          e.target.classList.add('is-revealed')
          observer?.unobserve(e.target)
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    ))

  const reveal: Directive<HTMLElement, number | undefined> = {
    mounted(el, binding) {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return
      el.classList.add('reveal')
      if (binding.value) el.style.transitionDelay = `${binding.value}ms`
      getObserver().observe(el)
    },
    unmounted(el) {
      observer?.unobserve(el)
    },
    getSSRProps: () => ({})
  }
  nuxtApp.vueApp.directive('reveal', reveal)
})
