<script setup lang="ts">
useHead({ title: 'About Us | Qonics Inc.' })
const values = [
  { icon: 'pi pi-compass', title: 'Curiosity', text: 'We ask why, then build the thing that answers it.' },
  { icon: 'pi pi-shield', title: 'Craft', text: 'We care about quality in code, circuits and communication.' },
  { icon: 'pi pi-heart', title: 'Care', text: 'We invest in people. Interns are teammates from day one.' }
]
</script>

<template>
  <div>
    <PageBanner
      eyebrow="About Us"
      title="A technology company that grows engineers"
      lead="Qonics Inc. delivers two services: Software Development and Internet of Things. Our internship program exists to bring promising students and graduates into that work."
    />
    <section class="container-x grid gap-10 py-16 lg:grid-cols-2">
      <div>
        <h2 class="h-section">What we do</h2>
        <p class="lead mt-4">We build web, mobile and backend software, and we design connected devices, firmware and smart systems that link the physical and digital worlds.</p>
        <p class="lead mt-4">Interns join real teams in one of those two departments and work on tasks that matter, supported by a mentor.</p>
      </div>
      <div class="grid gap-4">
        <div v-for="d in DEPARTMENTS" :key="d.id" class="surface-card flex gap-4 p-5">
          <span class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-navy text-accent"><i :class="d.icon" aria-hidden="true" /></span>
          <div><h3 class="font-semibold text-navy">{{ d.name }}</h3><p class="mt-1 text-sm text-muted">{{ d.description }}</p></div>
        </div>
      </div>
    </section>
    <section class="border-y border-line bg-white py-16">
      <div class="container-x">
        <h2 class="h-section">Our values</h2>
        <div class="mt-8 grid gap-5 sm:grid-cols-3">
          <div v-for="v in values" :key="v.title" class="surface-card p-5">
            <i :class="v.icon" class="text-xl text-brand" aria-hidden="true" />
            <h3 class="mt-3 font-semibold text-navy">{{ v.title }}</h3>
            <p class="mt-1 text-sm text-muted">{{ v.text }}</p>
          </div>
        </div>
      </div>
    </section>
    <ApplyCta />
  </div>
</template>
