// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: false },
  css: [
    'vuetify/lib/styles/main.sass',
    '@mdi/font/css/materialdesignicons.min.css',
    '~/assets/css/main.css'
  ],
  build: {
    transpile: ['vuetify']
  },
  modules: [
    '@pinia/nuxt'
  ],
  app: {
    head: {
      title: 'Food Inventory Management',
      meta: [
        { name: 'description', content: 'Food Inventory Management System' }
      ]
    }
  }
})