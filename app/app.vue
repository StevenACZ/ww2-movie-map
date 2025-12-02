<template>
  <div>
    <NuxtRouteAnnouncer />
    <AppHeader />
    <WW2Map />
    <WelcomeModal v-if="showWelcome" @close="handleWelcomeClose" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import WelcomeModal from "~/components/WelcomeModal.vue";

const showWelcome = ref(false);

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
  overflow: hidden;
}
</style>
