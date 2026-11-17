<template>
  <section class="relative overflow-hidden bg-white">
    <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(60rem_30rem_at_90%_-10%,rgb(37_99_235/0.08),transparent),radial-gradient(40rem_25rem_at_0%_100%,rgb(6_182_212/0.07),transparent)]" aria-hidden="true" />
    <div class="container-x relative grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-2 lg:py-28">
      <div>
        <p class="eyebrow mb-4 inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1">
          <span class="size-1.5 rounded-full bg-ok" aria-hidden="true" /> Applications open year-round
        </p>
        <h1 class="h-display">Build Your Future With Qonics Inc.</h1>
        <p class="lead mt-5">
          Turn your knowledge into real-world experience. Join our internship program and work alongside passionate technology professionals in Software Development and Internet of Things.
        </p>
        <div class="mt-8 flex flex-wrap gap-3">
          <LinkButton to="/opportunities" label="Explore Opportunities" icon="pi pi-arrow-right" icon-pos="right" size="large" severity="secondary" outlined class="!border-navy/25 !text-navy" />
          <LinkButton to="/applicant/apply" label="Apply Now" size="large" />
        </div>
      </div>

      <div class="relative mx-auto w-full max-w-md lg:max-w-none" aria-hidden="true">
        <div class="rounded-2xl border border-line bg-navy p-5 shadow-xl">
          <div class="mb-4 flex gap-1.5"><span class="size-2.5 rounded-full bg-bad/80" /><span class="size-2.5 rounded-full bg-warn/80" /><span class="size-2.5 rounded-full bg-ok/80" /></div>
          <pre class="overflow-hidden font-mono text-[13px] leading-6 text-white/80"><span class="text-accent">const</span> intern = {
  <span class="text-sky-300">track</span>: <span class="text-emerald-300">'Software | IoT'</span>,
  <span class="text-sky-300">mentor</span>: <span class="text-emerald-300">'senior engineer'</span>,
  <span class="text-sky-300">ships</span>: <span class="text-emerald-300">'real products'</span>
}
<span class="text-accent">await</span> qonics.<span class="text-sky-300">apply</span>(intern)</pre>
        </div>
        <div class="surface-card absolute -bottom-12 -left-4 flex items-center gap-3 p-3 pr-5 sm:-left-8">
          <span class="flex size-10 items-center justify-center rounded-lg bg-accent/15 text-accent"><i class="pi pi-wifi" /></span>
          <div><p class="text-xs text-muted">ESP32 node</p><p class="text-sm font-semibold text-navy">Online · 24.6 °C</p></div>
        </div>
        <div class="surface-card absolute -right-2 -top-5 flex items-center gap-3 p-3 pr-5 sm:-right-6">
          <span class="flex size-10 items-center justify-center rounded-lg bg-ok/15 text-ok"><i class="pi pi-check-circle" /></span>
          <div><p class="text-xs text-muted">Pull request</p><p class="text-sm font-semibold text-navy">Merged</p></div>
        </div>
      </div>
    </div>
  </section>
</template>
