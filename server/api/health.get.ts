import { GlideClient } from 'glide-sdk'

interface HealthCheckResponse {
  status: string
  glideInitialized: boolean
  glideProperties: string[]
  env: {
    hasClientId: boolean
    hasClientSecret: boolean
  }
  mode: 'local' | 'external'
}

// Initialize Glide client only if credentials are available
let glide: GlideClient | null = null
try {
  if (process.env.GLIDE_CLIENT_ID && process.env.GLIDE_CLIENT_SECRET) {
    glide = new GlideClient({
      clientId: process.env.GLIDE_CLIENT_ID,
      clientSecret: process.env.GLIDE_CLIENT_SECRET
    })
  }
} catch (error) {
  console.warn('Failed to initialize GlideClient:', error)
}

export default defineEventHandler(async (event): Promise<HealthCheckResponse> => {
  const hasCredentials = !!(process.env.GLIDE_CLIENT_ID && process.env.GLIDE_CLIENT_SECRET)
  
  return {
    status: 'ok',
    glideInitialized: !!glide,
    glideProperties: glide ? Object.keys(glide) : [],
    env: {
      hasClientId: !!process.env.GLIDE_CLIENT_ID,
      hasClientSecret: !!process.env.GLIDE_CLIENT_SECRET
    },
    mode: hasCredentials ? 'local' : 'external'
  }
}) 