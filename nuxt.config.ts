// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  ssr: false, // Disable SSR for Web Credentials API compatibility
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    // Private keys (only available on server-side)
    glideClientId: process.env.GLIDE_CLIENT_ID,
    glideClientSecret: process.env.GLIDE_CLIENT_SECRET,
    // Public keys (exposed to client-side)
    public: {
      // Any public config here
    }
  },
  nitro: {
    esbuild: {
      options: {
        target: 'ES2022'
      }
    }
  }
})
