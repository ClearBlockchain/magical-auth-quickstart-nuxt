import { GlideClient } from 'glide-sdk'

interface PhoneAuthProcessRequest {
  response: any // The credential response object from the client
  session: string
  phoneNumber?: string
}

interface AuthProcessResponse {
  phone_number?: string
  phoneNumber?: string
  verified?: boolean
  [key: string]: any
}

// Initialize Glide client only if credentials are available
let glide: GlideClient | null = null
try {
  if (process.env.GLIDE_CLIENT_ID && process.env.GLIDE_CLIENT_SECRET) {
    glide = new GlideClient({
      clientId: process.env.GLIDE_CLIENT_ID,
      clientSecret: process.env.GLIDE_CLIENT_SECRET,
      // @ts-ignore - environment is a valid option but not in the type definition
      environment: 'sandbox' // Change to 'production' when ready
    })
  }
} catch (error) {
  console.warn('Failed to initialize GlideClient:', error)
}

export default defineEventHandler(async (event) => {
  // Check if local server is configured
  if (!glide) {
    setResponseStatus(event, 503)
    return {
      error: 'LOCAL_SERVER_NOT_CONFIGURED',
      message: 'Local server is not configured. Please set GLIDE_CLIENT_ID and GLIDE_CLIENT_SECRET environment variables or use the external server option.',
      details: {
        hasClientId: !!process.env.GLIDE_CLIENT_ID,
        hasClientSecret: !!process.env.GLIDE_CLIENT_SECRET
      }
    }
  }

  try {
    const body = await readBody<PhoneAuthProcessRequest>(event)
    console.log('/api/phone-auth/process', body)
    
    const { response, session, phoneNumber } = body
    
    const processParams: any = {
      credentialResponse: response,
      session: session,
      phoneNumber: phoneNumber,
    }
    
    console.log('Calling glide.magicAuth.processCredential with:', processParams)    
    const result = await glide.magicAuth.processCredential(processParams) as AuthProcessResponse

    console.log('Response:', result)
    
    // Return the result directly if it already has the expected format
    if (result.phone_number || result.phoneNumber) {
      return result
    } else {
      // Fallback for unexpected format
      return {
        phone_number: result.phoneNumber || result.phone_number,
        verified: result.verified !== undefined ? result.verified : true,
        ...result
      }
    }
  } catch (error) {
    console.error('Phone auth process error:', (error as Error).message)
    
    setResponseStatus(event, 500)
    return {
      error: (error as Error).message,
      details: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
    }
  }
}) 