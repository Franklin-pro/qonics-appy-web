<template>
  <section class="relative overflow-hidden bg-white">
    <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(60rem_30rem_at_90%_-10%,rgb(25_166_87/0.12),transparent),radial-gradient(40rem_25rem_at_0%_100%,rgb(16_36_58/0.06),transparent)]" aria-hidden="true" />
    <div class="bg-grid pointer-events-none absolute inset-0" aria-hidden="true" />
    <div class="container-x relative grid items-center gap-14 py-16 sm:py-20 lg:grid-cols-2 lg:py-28">
      <div>
        <p class="eyebrow anim-fade-up mb-5 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-primary-50 px-3 py-1.5">
          <span class="anim-pulse-ring size-2 rounded-full bg-accent" aria-hidden="true" /> Applications open year-round
        </p>
        <h1 class="h-display anim-fade-up lg:text-6xl" style="animation-delay: 80ms">
          Build Your Future With <span class="text-gradient">Qonics Inc.</span>
        </h1>
        <p class="lead anim-fade-up mt-6" style="animation-delay: 160ms">
          Turn your knowledge into real-world experience. Join our internship program and work alongside passionate technology professionals in Software Development and Internet of Things.
        </p>
        <div class="anim-fade-up mt-9 flex flex-wrap gap-3" style="animation-delay: 240ms">
          <LinkButton to="/opportunities" label="Explore Opportunities" icon="pi pi-arrow-right" icon-pos="right" size="large" severity="secondary" outlined class="!border-navy/20 !text-navy transition-transform hover:-translate-y-0.5" />
          <LinkButton to="/applicant/apply" label="Apply Now" size="large" class="shadow-lg shadow-accent/25 transition-transform hover:-translate-y-0.5" />
        </div>
        <dl class="anim-fade-up mt-12 flex flex-wrap gap-x-10 gap-y-4 border-t border-line pt-6" style="animation-delay: 320ms">
          <div v-for="s in stats" :key="s.label">
            <dt class="text-xs uppercase tracking-wider text-muted">{{ s.label }}</dt>
            <dd class="mt-0.5 text-lg font-bold text-navy">{{ s.value }}</dd>
          </div>
        </dl>
      </div>

      <div class="anim-fade-up relative mx-auto w-full max-w-md lg:max-w-none" style="animation-delay: 200ms" aria-hidden="true">
        <div class="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-accent/20 via-transparent to-navy/10 blur-2xl" />
        <div class="rounded-2xl border border-white/10 bg-navy p-5 shadow-2xl shadow-navy/30 ring-1 ring-navy/10">
          <div class="mb-4 flex items-center gap-1.5">
            <span class="size-2.5 rounded-full bg-bad/80" /><span class="size-2.5 rounded-full bg-warn/80" /><span class="size-2.5 rounded-full bg-ok/80" />
            <span class="ml-3 font-mono text-xs text-white/40">intern.ts</span>
          </div>
          <pre class="overflow-hidden font-mono text-[13px] leading-6 text-white/80"><span class="text-accent">const</span> intern = {
  <span class="text-sky-300">track</span>: <span class="text-emerald-300">'Software | IoT'</span>,
  <span class="text-sky-300">mentor</span>: <span class="text-emerald-300">'senior engineer'</span>,
  <span class="text-sky-300">ships</span>: <span class="text-emerald-300">'real products'</span>
}
<span class="text-accent">await</span> qonics.<span class="text-sky-300">apply</span>(intern)<span class="anim-blink ml-0.5 inline-block h-4 w-1.5 translate-y-0.5 bg-accent" /></pre>
        </div>
        <div class="surface-card anim-float-slow absolute -bottom-12 -left-4 flex items-center gap-3 p-3 pr-5 shadow-xl sm:-left-8">
          <span class="flex size-10 items-center justify-center rounded-lg bg-accent/15 text-accent"><i class="pi pi-wifi" /></span>
          <div><p class="text-xs text-muted">ESP32 node</p><p class="text-sm font-semibold text-navy">Online · 24.6 °C</p></div>
        </div>
        <div class="surface-card anim-float absolute -right-2 -top-5 flex items-center gap-3 p-3 pr-5 shadow-xl sm:-right-6">
          <span class="flex size-10 items-center justify-center rounded-lg bg-ok/15 text-ok"><i class="pi pi-check-circle" /></span>
          <div><p class="text-xs text-muted">Pull request</p><p class="text-sm font-semibold text-navy">Merged</p></div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const stats = [
  { label: 'Departments', value: '2' },
  { label: 'Intake', value: 'Year-round' },
  { label: 'Mentorship', value: '1-on-1' }
]
</script>
