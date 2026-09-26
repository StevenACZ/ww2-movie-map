<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { Locale } from "~~/types/data";

const { locale, t } = useI18n();
const config = useRuntimeConfig();
const sound = useSound();

useHead(() => ({
  htmlAttrs: { lang: locale.value === "es" ? "es" : "en" },
  script: [
    jsonLdScript(
      siteGraph(
        locale.value as Locale,
        t("site.description", { count: config.public.titleCount })
      )
    ),
  ],
}));

onMounted(() => sound.hydrate());
</script>
