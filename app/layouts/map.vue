<template>
  <div class="map-shell">
    <a class="skip-link" href="#main">{{ t("nav.skip") }}</a>
    <AppHeader overlay />
    <main id="main" class="map-shell__main" tabindex="-1">
      <slot />
    </main>
    <NuxtRouteAnnouncer />
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n();
</script>

<style lang="scss" scoped>
.map-shell {
  position: relative;
  height: 100dvh;
  overflow: hidden;
}

.map-shell__main {
  position: absolute;
  inset: 0;
  outline: none;
}
</style>
