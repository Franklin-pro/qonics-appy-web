<template>
  <section class="container-x py-16">
    <div class="relative overflow-hidden rounded-2xl bg-navy px-6 py-12 text-center text-white sm:px-12">
      <h2 class="text-2xl font-bold sm:text-3xl">Ready to start your career with Qonics?</h2>
      <p class="mx-auto mt-3 max-w-xl text-white/70">Applications are open throughout the year. Create an account, complete your profile and apply in minutes.</p>
      <div class="mt-7 flex flex-wrap justify-center gap-3">
        <LinkButton to="/applicant/apply" label="Apply Now" size="large" />
        <LinkButton to="/auth/register" label="Create an account" size="large" severity="secondary" outlined class="!border-white/30 !bg-transparent !text-white hover:!bg-white/10" />
      </div>
    </div>
  </section>
</template>
