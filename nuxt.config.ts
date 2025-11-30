// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/i18n'
  ],

  i18n: {
    restructureDir: false,
    locales: [
      {
        code: 'en',
        name: 'English',
        file: 'en.json'
      },
      {
        code: 'es',
        name: 'Español',
        file: 'es.json'
      }
    ],
    lazy: true,
    langDir: 'locales',
    defaultLocale: 'en',
    strategy: 'no_prefix'
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
