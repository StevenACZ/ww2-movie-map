<template>
  <div>
    <NuxtRouteAnnouncer />
    <AppHeader />
    <NuxtPage />
    <WelcomeModal v-if="showWelcome" @close="handleWelcomeClose" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import WelcomeModal from "~/components/WelcomeModal.vue";
import { jsonLdScript, siteGraph } from "~/utils/seo";

const showWelcome = ref(false);

useHead({
  script: [jsonLdScript(siteGraph())],
});

onMounted(() => {
  const seen = localStorage.getItem("welcome_seen");
  if (!seen) {
    showWelcome.value = true;
  }
});

const handleWelcomeClose = (dontShowAgain: boolean) => {
  if (dontShowAgain) {
    localStorage.setItem("welcome_seen", "true");
  }
  showWelcome.value = false;
};
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body,
#__nuxt {
  height: 100%;
}

body {
  font-family:
    "Inter",
    system-ui,
    -apple-system,
    "Segoe UI",
    Roboto,
    sans-serif;
  background-color: #14191e;
  color: #fff;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
}
</style>
