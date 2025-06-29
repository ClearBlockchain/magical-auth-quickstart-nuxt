import { GlideClient, AuthV2PrepDto } from 'glide-sdk'

interface EligibilityErrorResponse {
  error: string
  message: string
  details: {
    eligible: boolean
    carrier_name?: string
    reason?: string
  }
}

interface AuthPrepareResponse {
  protocol: string
  data: any
  session?: string
}

// Initialize Glide client only if credentials are available
let glide: GlideClient | null = null
try {
  if (process.env.GLIDE_CLIENT_ID && process.env.GLIDE_CLIENT_SECRET) {
    glide = new GlideClient({
      clientId: process.env.GLIDE_CLIENT_ID,
      clientSecret: process.env.GLIDE_CLIENT_SECRET,
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
    const body = await readBody<AuthV2PrepDto>(event)
    console.log('/api/phone-auth/prepare', body)
    
    const { use_case, phone_number, plmn, consent_data } = body

    // Pre-process the request parameters
    const prepareParams: any = {
      use_case
    }

    // Always include phone_number if provided
    if (phone_number) {
      console.log('Including phone number:', phone_number)
      prepareParams.phone_number = phone_number
    }

    // Include PLMN if provided with both mcc and mnc
    if (plmn && plmn.mcc && plmn.mnc) {
      console.log('Including PLMN:', plmn)
      prepareParams.plmn = plmn
    }

    // If neither phone_number nor PLMN was provided, use default T-Mobile PLMN
    if (!phone_number && (!plmn || !plmn.mcc || !plmn.mnc)) {
      console.log('No phone_number or PLMN provided, using default T-Mobile PLMN')
      prepareParams.plmn = {
        mcc: '310',
        mnc: '160'  // T-Mobile USA
      }
    }

    // Add consent data if provided
    if (consent_data) {
      prepareParams.consent_data = {
        consent_text: consent_data.consent_text,
        policy_link: consent_data.policy_link,
        policy_text: consent_data.policy_text
      }
    }

    console.log('Calling glide.magicAuth.prepare with:', prepareParams)
    const response = await glide.magicAuth.prepare(prepareParams)
    console.log('Response:', response)
    
    // Check if this is an eligibility response (carrier not supported)
    if (response?.eligible === false) {
      const eligibilityResponse: EligibilityErrorResponse = {
        error: 'CARRIER_NOT_SUPPORTED',
        message: response.reason || 'This carrier is not supported',
        details: {
          eligible: false,
          carrier_name: response.carrier_name,
          reason: response.reason
        }
      }
      
      setResponseStatus(event, 400)
      return eligibilityResponse
    }
    
    // Check if response already has the expected format
    if (response.protocol && response.data) {
      // New format - response is already properly formatted
      console.log('Using direct format from Glide SDK')
      return response as AuthPrepareResponse
    } else {
      throw new Error('Unexpected response format from Glide SDK')
    }
  } catch (error) {
    console.error('Phone auth request error:', (error as Error).message)
    
    setResponseStatus(event, 500)
    return {
      error: (error as Error).message,
      details: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
    }
  }
}) 