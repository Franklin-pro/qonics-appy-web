<template>
  <PortalShell>
    <template #sidebar><AdminSidebar /></template>
    <template #header="{ openMenu }"><AdminHeader @menu="openMenu" /></template>
    <slot />
    <ReviewDialogs />
  </PortalShell>
</template>
