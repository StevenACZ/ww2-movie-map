<template>
  <div class="shell">
    <a class="skip-link" href="#main">{{ t("nav.skip") }}</a>
    <AppHeader />
    <main id="main" class="shell__main" tabindex="-1">
      <slot />
    </main>
    <AppFooter />
    <NuxtRouteAnnouncer />
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n();
useLenis();
</script>

<style lang="scss" scoped>
.shell {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
}

.shell__main {
  flex: 1;
  outline: none;
}
</style>
