<template>
  <div class="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
    <aside class="relative hidden overflow-hidden bg-navy p-12 text-white lg:flex lg:flex-col lg:justify-between">
      <div class="relative z-10"><AppLogo light :size="30" /></div>
      <div class="relative z-10 max-w-md">
        <p class="eyebrow !text-accent">Internship program</p>
        <h2 class="mt-3 text-3xl font-bold leading-tight">Real projects. Real mentors. Real experience.</h2>
        <p class="mt-4 text-white/70">Apply in Software Development or Internet of Things and track every step of your application in one place.</p>
      </div>
      <p class="relative z-10 text-xs text-white/40">© {{ new Date().getFullYear() }} Qonics Inc.</p>
      <svg class="pointer-events-none absolute -right-24 -top-24 size-[28rem] opacity-20" viewBox="0 0 200 200" fill="none" aria-hidden="true">
        <circle cx="100" cy="100" r="90" stroke="#19a657" stroke-width="1" />
        <circle cx="100" cy="100" r="60" stroke="#118254" stroke-width="1" />
        <circle cx="100" cy="100" r="30" stroke="#19a657" stroke-width="1" />
      </svg>
    </aside>
    <div class="flex min-w-0 flex-col bg-canvas">
      <div class="flex items-center justify-between p-5 lg:hidden"><AppLogo /></div>
      <main id="main" class="flex flex-1 items-center justify-center px-5 py-8 sm:px-10">
        <div class="w-full max-w-md"><slot /></div>
      </main>
    </div>
  </div>
</template>
