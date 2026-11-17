import tailwindcss from '@tailwindcss/vite'
import { QonicsPreset } from './app/theme/preset'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  modules: ['@primevue/nuxt-module', '@pinia/nuxt', '@vueuse/nuxt'],

  components: [{ path: '~/components', pathPrefix: false }],

  css: ['primeicons/primeicons.css', '~/assets/css/main.css'],

  vite: { plugins: [tailwindcss()] },

  primevue: {
    options: {
      ripple: true,
      theme: {
        preset: QonicsPreset,
        options: {
          darkModeSelector: false,
          cssLayer: { name: 'primevue', order: 'theme, base, primevue' }
        }
      }
    }
  },

  // Public site is server-rendered; the signed-in areas are client-only (session lives in the browser).
  routeRules: {
    '/auth/**': { ssr: false },
    '/applicant/**': { ssr: false },
    '/admin/**': { ssr: false }
  },

  runtimeConfig: {
    public: {
      // Leave empty to run on clearly-labelled demo data. Set NUXT_PUBLIC_API_BASE to use a real backend.
      apiBase: '',
      // PrimeVue 5 (PrimeUI License) reads its key from here: set NUXT_PUBLIC_PRIMEUI_LICENSE.
      PRIMEUI_LICENSE: '',
      // Where the public contact form drafts its email. Replace with the real inbox via NUXT_PUBLIC_CONTACT_EMAIL.
      contactEmail: 'internships@qonics.example'
    }
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'Qonics Inc. Internships',
      meta: [
        { name: 'description', content: 'Apply for internships in Software Development and Internet of Things at Qonics Inc.' }
      ],
      link: [{ rel: 'icon', href: '/favicon.ico' }]
    }
  },

  devtools: { enabled: false }
})
