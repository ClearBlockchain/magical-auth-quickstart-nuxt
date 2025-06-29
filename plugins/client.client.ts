export default defineNuxtPlugin(() => {
  // Check for Digital Credentials API support
  if (process.client) {
    if (!('credentials' in navigator)) {
      console.warn('Digital Credentials API not supported in this browser')
    }
  }
}) 