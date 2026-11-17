<template>
  <footer class="bg-navy text-white">
    <div class="container-x grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
      <div class="lg:col-span-2">
        <AppLogo light />
        <p class="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
          Qonics Inc. builds software and Internet of Things solutions, and trains the next generation of engineers through its internship program.
        </p>
      </div>
      <div>
        <p class="text-sm font-semibold">Company</p>
        <ul class="mt-3 space-y-2 text-sm text-white/70">
          <li><NuxtLink to="/about" class="hover:text-white">About Us</NuxtLink></li>
          <li><NuxtLink to="/opportunities" class="hover:text-white">Opportunities</NuxtLink></li>
          <li><NuxtLink to="/faq" class="hover:text-white">FAQ</NuxtLink></li>
          <li><NuxtLink to="/contact" class="hover:text-white">Contact</NuxtLink></li>
        </ul>
      </div>
      <div>
        <p class="text-sm font-semibold">Departments</p>
        <ul class="mt-3 space-y-2 text-sm text-white/70">
          <li v-for="d in DEPARTMENTS" :key="d.id"><NuxtLink to="/opportunities" class="hover:text-white">{{ d.name }}</NuxtLink></li>
          <li><NuxtLink to="/auth/login" class="hover:text-white">Applicant login</NuxtLink></li>
        </ul>
      </div>
    </div>
    <div class="border-t border-white/10">
      <div class="container-x py-5 text-xs text-white/50">© {{ new Date().getFullYear() }} Qonics Inc. All rights reserved.</div>
    </div>
  </footer>
</template>
