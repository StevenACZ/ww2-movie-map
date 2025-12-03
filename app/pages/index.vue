<template>
  <main class="map-page" role="main" aria-label="Interactive WW2 Film Map">
    <WW2Map />
  </main>
</template>

<script setup lang="ts">
import WW2Map from "~/components/WW2Map.vue";

// SEO Configuration for Index Page
useSeoMeta({
  title: 'Interactive WW2 Film Map',
  ogTitle: 'WW2 Film Map - Explore World War II Films on an Interactive Map',
  description: 'Discover World War II films plotted on an interactive map. Explore filming locations, battle sites, and historical events from 1939-1945 through cinema.',
  ogDescription: 'Discover World War II films plotted on an interactive map. Explore filming locations, battle sites, and historical events through cinema.',
  ogUrl: 'https://ww2.stevenacz.com',
  ogImage: 'https://ww2.stevenacz.com/og-image.png',
  twitterCard: 'summary_large_image',
  twitterTitle: 'WW2 Film Map - Interactive World War II Cinema Map',
  twitterDescription: 'Explore WW2 films on an interactive map. Discover filming locations and historical events.',
  twitterImage: 'https://ww2.stevenacz.com/og-image.png',
});

// Canonical URL
useHead({
  link: [
    { rel: 'canonical', href: 'https://ww2.stevenacz.com' }
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        'name': 'WW2 Film Map - Interactive Map',
        'description': 'Interactive map showing World War II films and their filming locations across the globe.',
        'url': 'https://ww2.stevenacz.com',
        'isPartOf': {
          '@type': 'WebSite',
          'name': 'WW2 Film Map',
          'url': 'https://ww2.stevenacz.com'
        },
        'about': {
          '@type': 'Thing',
          'name': 'World War II Films',
          'description': 'Films depicting events from World War II (1939-1945)'
        },
        'mainEntity': {
          '@type': 'Map',
          'name': 'World War II Film Locations Map',
          'description': 'Interactive map displaying filming locations and historical sites from WW2 movies'
        }
      })
    }
  ]
});
</script>

<style scoped>
.map-page {
  height: 100vh;
  overflow: hidden;
}
</style>
