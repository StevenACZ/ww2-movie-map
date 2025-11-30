// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  css: ['maplibre-gl/dist/maplibre-gl.css'],

  app: {
    head: {
      title: 'WW2 Map Films',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Interactive World War II Film Map - Explore WW2 cinema through an immersive geographical experience' }
      ]
    }
  },

  vite: {
    optimizeDeps: {
      include: ['maplibre-gl']
    },
    ssr: {
      noExternal: ['@indoorequal/vue-maplibre-gl']
    }
  }
})
