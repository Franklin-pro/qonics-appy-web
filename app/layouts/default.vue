<template>
  <div class="flex min-h-screen flex-col">
    <a href="#main" class="sr-only z-50 rounded bg-white px-3 py-2 focus:not-sr-only focus:fixed focus:left-3 focus:top-3">Skip to content</a>
    <DemoBanner />
    <PublicNavbar />
    <main id="main" class="flex-1"><slot /></main>
    <PublicFooter />
  </div>
</template>
