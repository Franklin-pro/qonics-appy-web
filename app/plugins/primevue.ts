import Tooltip from 'primevue/tooltip'

// Theme, ripple, ToastService and ConfirmationService are registered by the PrimeVue Nuxt module
// (see nuxt.config.ts). Registering them again only logs "plugin already applied" warnings,
// so this plugin adds just the directive that the module does not auto-register.
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('tooltip', Tooltip)
})
