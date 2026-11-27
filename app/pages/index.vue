<script setup lang="ts">
useHead({ title: 'Qonics Inc. Internships | Software Development & IoT' })

const reasons = [
  { icon: 'pi pi-briefcase', title: 'Real project work', text: 'Contribute to production software and connected devices, not busywork.' },
  { icon: 'pi pi-users', title: 'Dedicated mentors', text: 'Pair with experienced engineers who review your work and guide your growth.' },
  { icon: 'pi pi-chart-line', title: 'Grow fast', text: 'Structured goals and regular feedback help you build a portfolio employers notice.' },
  { icon: 'pi pi-calendar', title: 'Apply any time', text: 'Our program is open all year. Apply when you are ready, not when a deadline says so.' }
]
const steps = [
  { icon: 'pi pi-user-plus', title: 'Create an account', text: 'Register with your email and complete your profile.' },
  { icon: 'pi pi-sitemap', title: 'Choose your track', text: 'Pick Software Development or IoT and a specialization.' },
  { icon: 'pi pi-upload', title: 'Upload documents', text: 'Add your CV and academic transcript, plus optional extras.' },
  { icon: 'pi pi-bell', title: 'Track your status', text: 'Follow your application and get notified at each stage.' }
]
</script>

<template>
  <div>
    <HeroSection />

    <section class="container-x py-20" aria-labelledby="why">
      <p class="eyebrow">Why join Qonics?</p>
      <h2 id="why" class="h-section mt-2 max-w-xl">An internship designed around learning by building</h2>
      <div class="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div v-for="r in reasons" :key="r.title" class="surface-card p-5">
          <span class="flex size-10 items-center justify-center rounded-lg bg-primary-50 text-brand"><i :class="r.icon" aria-hidden="true" /></span>
          <h3 class="mt-4 font-semibold text-navy">{{ r.title }}</h3>
          <p class="mt-1.5 text-sm leading-relaxed text-muted">{{ r.text }}</p>
        </div>
      </div>
    </section>

    <section id="departments" class="scroll-mt-20 border-y border-line bg-white py-20" aria-labelledby="depts">
      <div class="container-x">
        <p class="eyebrow">Departments</p>
        <h2 id="depts" class="h-section mt-2">Two departments. Endless things to build.</h2>
        <div class="mt-10 grid gap-6 md:grid-cols-2">
          <DepartmentCard v-for="d in DEPARTMENTS" :key="d.id" :department="d" />
        </div>
      </div>
    </section>

    <!-- <TrainingPackages /> -->

    <section class="container-x py-20" aria-labelledby="how">
      <p class="eyebrow">How to apply</p>
      <h2 id="how" class="h-section mt-2">Four simple steps</h2>
      <ol class="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <li v-for="(s, i) in steps" :key="s.title" class="surface-card relative p-5">
          <span class="absolute right-4 top-3 text-3xl font-bold text-surface-200">{{ i + 1 }}</span>
          <span class="flex size-10 items-center justify-center rounded-lg bg-navy text-accent"><i :class="s.icon" aria-hidden="true" /></span>
          <h3 class="mt-4 font-semibold text-navy">{{ s.title }}</h3>
          <p class="mt-1.5 text-sm leading-relaxed text-muted">{{ s.text }}</p>
        </li>
      </ol>
    </section>

    <ApplyCta />
  </div>
</template>
