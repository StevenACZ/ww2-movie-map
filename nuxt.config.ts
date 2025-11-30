// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/i18n'
  ],

  i18n: {
    locales: ['en', 'es'],
    defaultLocale: 'en',
    vueI18n: './i18n.config.ts'
  },

  app: {
    head: {
      title: 'WW2 Map Films',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Interactive World War II Film Map - Explore WW2 cinema through an immersive geographical experience' }
      ]
    }
  }
})
