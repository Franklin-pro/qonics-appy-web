<template>
  <section v-reveal class="container-x py-16">
    <div class="relative overflow-hidden rounded-2xl bg-navy px-6 py-16 text-center text-white sm:px-12">
      <div class="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-accent/25 blur-3xl" aria-hidden="true" />
      <div class="pointer-events-none absolute -bottom-24 -left-16 size-64 rounded-full bg-brand/30 blur-3xl" aria-hidden="true" />
      <div class="bg-grid pointer-events-none absolute inset-0 opacity-20 invert" aria-hidden="true" />
      <h2 class="relative text-2xl font-bold sm:text-3xl">Ready to start your career with Qonics?</h2>
      <p class="relative mx-auto mt-3 max-w-xl text-white/70">Applications are open throughout the year. Apply for an internship directly, with or without an account.</p>
      <div class="relative mt-8 flex flex-wrap justify-center gap-3">
        <LinkButton to="/applicant/apply" label="Apply Now" size="large" class="shadow-lg shadow-accent/30 transition-transform hover:-translate-y-0.5" />
        <LinkButton to="/auth/register" label="Create an account" size="large" severity="secondary" outlined class="!border-white/30 !bg-transparent !text-white hover:!bg-white/10" />
      </div>
    </div>
  </section>
</template>
