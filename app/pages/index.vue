<template>
  <main class="map-page" role="main" aria-label="Interactive WW2 Film Map">
    <section class="seo-intro" aria-labelledby="map-page-title">
      <h1 id="map-page-title">Interactive WW2 Film Map</h1>
      <p>
        Explore World War II films by location, historical period, and the
        events they portray across Europe, North Africa, the Pacific, and
        beyond.
      </p>
    </section>
    <WW2Map />
  </main>
</template>

<script setup lang="ts">
import { computed } from "vue";
import WW2Map from "~/components/WW2Map.vue";
import {
  buildPageSeo,
  canonicalUrl,
  jsonLdScript,
  robotsForQuery,
  SITE_URL,
} from "~/utils/seo";

const route = useRoute();
const queryAwareRobots = computed(() => robotsForQuery(route.query));

useSeoMeta({
  ...buildPageSeo({
    path: "/",
    title: "Interactive WW2 Film Map",
    ogTitle: "WW2 Film Map - Explore World War II Films by Location",
    description:
      "Discover World War II films plotted on an interactive map. Explore filming locations, battle sites, and historical context from 1936 to 1945 through cinema.",
    ogDescription:
      "Discover World War II films plotted on an interactive map, from Normandy and Stalingrad to the Pacific theater.",
  }),
});

useHead({
  meta: [
    { name: "robots", content: queryAwareRobots },
    { name: "googlebot", content: queryAwareRobots },
  ],
  link: [{ rel: "canonical", href: canonicalUrl("/") }],
  script: [
    jsonLdScript({
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${SITE_URL}/#map-page`,
      name: "Interactive WW2 Film Map",
      description:
        "Interactive map showing World War II films, primary locations, and historical context across global theaters of war.",
      url: canonicalUrl("/"),
      isPartOf: { "@id": `${SITE_URL}/#website` },
      about: {
        "@type": "Thing",
        name: "World War II films",
        sameAs: "https://en.wikipedia.org/wiki/World_War_II_in_film",
      },
      mainEntity: {
        "@type": "Map",
        name: "World War II Film Locations Map",
        description:
          "Interactive map displaying film locations and historical sites from World War II movies.",
      },
    }),
  ],
});
</script>

<style scoped>
.map-page {
  height: 100vh;
  overflow: hidden;
}

.seo-intro {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}
</style>
