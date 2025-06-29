<template>
  <div>
    <!-- Header -->
    <header class="header">
      <div class="header-brand">
        <img src="/Glide-Logomark.svg" alt="Glide Identity" class="header-logo" />
        <span class="header-company">Glide Identity</span>
      </div>
      <h1>Magical Auth Quick Start</h1>
      <p>Test carrier-grade phone verification in minutes. No SMS, no delays, no fraud.</p>
    </header>

    <div class="container">
      <!-- Flow Type Section -->
      <section class="section">
        <div class="section-header">
          <div class="section-icon">📱</div>
          <div class="section-title">
            <h2>Flow Type</h2>
            <p>Choose what you want to do with the phone verification</p>
          </div>
        </div>

        <div class="card-grid two-columns">
          <div 
            :class="`card ${selectedFlow === 'verify' ? 'selected' : ''}`"
            @click="selectFlow('verify')"
          >
            <div class="card-icon">✓</div>
            <h3>Verify Phone Number</h3>
            <p>Verify if phone matches SIM card through carrier network</p>
          </div>

          <div 
            :class="`card ${selectedFlow === 'get' ? 'selected' : ''}`"
            @click="selectFlow('get')"
          >
            <div class="card-icon">📲</div>
            <h3>Get Phone Number</h3>
            <p>Retrieve phone number from SIM card with carrier verification</p>
          </div>
        </div>
      </section>

      <!-- Action Section -->
      <section class="section">
        <div class="section-header">
          <div class="section-icon">⚡</div>
          <div class="section-title">
            <h2>{{ selectedFlow === 'get' ? 'Get Your Number' : 'Verify Number' }}</h2>
            <p>{{ selectedFlow === 'get' ? 
              'Click below to retrieve your phone number securely' : 
              'Enter a phone number in E.164 format to verify ownership' }}</p>
          </div>
        </div>

        <div v-if="selectedFlow === 'verify'" class="form-group">
          <div class="input-wrapper">
            <input
              type="tel"
              placeholder="Enter phone number in E.164 format (e.g., +16287892016)"
              v-model="phoneInput"
              @input="handlePhoneChange"
              :disabled="isLoading"
              :class="phoneError ? 'input-error' : ''"
            />
            <div v-if="phoneError" class="phone-error">
              {{ phoneError }}
            </div>
            <div class="format-hint">
              E.164 format: +[country code][phone number] (no spaces or dashes)
            </div>
          </div>
        </div>

        <div class="button-group">
          <button 
            v-if="selectedFlow === 'get'"
            class="button-primary" 
            @click="handleGetNumber" 
            :disabled="isLoading"
          >
            <span v-if="isLoading" class="loading-spinner"></span>
            {{ isLoading ? getLoadingText() : 'Get My Phone Number' }}
          </button>
          <button 
            v-else
            class="button-primary" 
            @click="handleVerifyNumber" 
            :disabled="isLoading || !phoneInput || phoneError"
          >
            <span v-if="isLoading" class="loading-spinner"></span>
            {{ isLoading ? getLoadingText() : 'Verify Phone Number' }}
          </button>
        </div>

        <!-- Progress Bar -->
        <div v-if="isLoading" class="progress-container">
          <div class="progress-bar">
            <div class="progress-line">
              <div 
                :class="`progress-line-fill ${error ? 'error' : ''}`"
                :style="{ 
                  width: currentStep === 'requesting' ? '33%' : 
                         currentStep === 'authenticating' ? '66%' : 
                         currentStep === 'processing' ? '100%' : '0%'
                }"
              />
            </div>
            
            <div class="progress-step">
              <div :class="`progress-dot ${
                currentStep === 'requesting' ? 'active' : 
                (currentStep === 'authenticating' || currentStep === 'processing') ? 'completed' : ''
              } ${error && currentStep === 'requesting' ? 'error' : ''}`">
                {{ (currentStep === 'authenticating' || currentStep === 'processing') && !error ? '✓' : '1' }}
              </div>
              <span :class="`progress-label ${
                currentStep === 'requesting' ? 'active' : 
                (currentStep === 'authenticating' || currentStep === 'processing') ? 'completed' : ''
              } ${error && currentStep === 'requesting' ? 'error' : ''}`">
                Preparing Request
              </span>
            </div>

            <div class="progress-step">
              <div :class="`progress-dot ${
                currentStep === 'authenticating' ? 'active' : 
                currentStep === 'processing' ? 'completed' : ''
              } ${error && currentStep === 'authenticating' ? 'error' : ''}`">
                {{ currentStep === 'processing' && !error ? '✓' : '2' }}
              </div>
              <span :class="`progress-label ${
                currentStep === 'authenticating' ? 'active' : 
                currentStep === 'processing' ? 'completed' : ''
              } ${error && currentStep === 'authenticating' ? 'error' : ''}`">
                Carrier Approval
              </span>
            </div>

            <div class="progress-step">
              <div :class="`progress-dot ${
                currentStep === 'processing' ? 'active' : ''
              } ${error && currentStep === 'processing' ? 'error' : ''}`">
                {{ error && currentStep === 'processing' ? '✕' : '3' }}
              </div>
              <span :class="`progress-label ${
                currentStep === 'processing' ? 'active' : ''
              } ${error && currentStep === 'processing' ? 'error' : ''}`">
                Processing
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- Results Section -->
      <div v-if="error && resultFlow === selectedFlow" :class="`message ${error.error === 'CARRIER_NOT_SUPPORTED' ? 'message-warning' : 'message-error'}`">
        <span class="message-icon">{{ error.error === 'CARRIER_NOT_SUPPORTED' ? '⚠️' : '✕' }}</span>
        <div class="message-content">
          <h4>{{ error.error === 'CARRIER_NOT_SUPPORTED' ? 'Carrier Not Supported' : 'Error' }}</h4>
          <p>{{ error.message || 'An error occurred' }}</p>
          <div v-if="error.details?.carrier_name" class="carrier-info">
            <strong>Carrier:</strong> {{ error.details.carrier_name }}<br />
            <strong>Reason:</strong> {{ error.details.reason }}
          </div>
          <p v-if="error.code && error.error !== 'CARRIER_NOT_SUPPORTED'"><code>{{ error.code }}</code></p>
        </div>
      </div>

      <div v-if="result && resultFlow === selectedFlow" class="message message-success">
        <span class="message-icon">✓</span>
        <div class="message-content">
          <h4>Success</h4>
          <p><strong>Phone Number:</strong> {{ result.phoneNumber || result.phone_number }}</p>
          <p><strong>Verified:</strong> {{ selectedFlow === 'verify' ? (result.verified ? 'Yes' : 'No') : 'Yes' }}</p>
          <div v-if="result.session" class="session-info">
            <p><strong>Session Details:</strong></p>
            <pre class="session-data">{{ 
              typeof result.session === 'object' 
                ? JSON.stringify(result.session, null, 2) 
                : result.session
            }}</pre>
          </div>
        </div>
      </div>

      <!-- Info Section -->
      <section class="section">
        <div class="section-header">
          <div class="section-icon">ℹ️</div>
          <div class="section-title">
            <h2>How It Works</h2>
            <p>Secure authentication powered by carrier networks</p>
          </div>
        </div>

        <div class="card-grid">
          <div class="card">
            <div class="card-icon">🔐</div>
            <h3>No SMS Required</h3>
            <p>Direct carrier verification without sending any text messages</p>
          </div>

          <div class="card">
            <div class="card-icon">⚡</div>
            <h3>Instant Verification</h3>
            <p>Get results in seconds, not minutes</p>
          </div>

          <div class="card">
            <div class="card-icon">🛡️</div>
            <h3>Fraud Resistant</h3>
            <p>Can't be intercepted or spoofed like SMS codes</p>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <div class="powered-by">
        <span>Powered by</span>
        <img src="/Glide-Logomark.svg" alt="Glide" class="powered-by-logo" />
        <span>Glide Identity</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useClient } from 'glide-web-client-sdk/vue'

// Reactive state
const phoneInput = ref('')
const selectedFlow = ref('verify')
const phoneError = ref('')
const resultFlow = ref(null)

// URL Configuration:
// Option 1: Local server routes (requires running the local Nuxt server with your own Glide credentials)
// const prepareRequest = '/api/phone-auth/prepare'
// const processResponse = '/api/phone-auth/process'

// Option 2: Pre-made external server (for quick testing with hosted credentials)
const prepareRequest = 'https://checkout-demo-server.glideidentity.dev/generate-get-request'
const processResponse = 'https://checkout-demo-server.glideidentity.dev/processCredential'

// Initialize the client
const { usePhoneAuth } = useClient({
  phoneAuthEndpoints: {
    prepareRequest,
    processResponse
  },
  debug: true,
})

const {
  getPhoneNumber,
  verifyPhoneNumber,
  isLoading,
  error,
  result,
  currentStep,
  isSupported
} = usePhoneAuth()

// Phone validation
const validatePhoneNumber = (phone) => {
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '')
  
  // E.164 format: + followed by up to 15 digits total
  const e164Regex = /^\+[1-9]\d{1,14}$/
  
  if (!phone.trim()) {
    return 'Phone number is required'
  }
  
  if (!cleaned.startsWith('+')) {
    return 'Phone number must be in E.164 format (start with +)'
  }
  
  if (cleaned.length < 8) {
    return 'Phone number too short for E.164 format'
  }
  
  if (cleaned.length > 16) {
    return 'Phone number too long for E.164 format (max 15 digits)'
  }
  
  if (!e164Regex.test(cleaned)) {
    return 'Please enter a valid E.164 format phone number'
  }
  
  return ''
}

// Computed properties
const getLoadingText = computed(() => {
  if (currentStep.value === 'requesting') return 'Preparing request...'
  if (currentStep.value === 'authenticating') return 'Waiting for carrier approval...'
  if (currentStep.value === 'processing') return 'Processing response...'
  return 'Loading...'
})

// Methods
const handlePhoneChange = () => {
  // Clear error when user starts typing
  if (phoneError.value) {
    phoneError.value = ''
  }
}

const selectFlow = (flow) => {
  selectedFlow.value = flow
  phoneError.value = ''
}

const handleGetNumber = async () => {
  try {
    const response = await getPhoneNumber({
      consentData: {
        consent_text: 'I consent to the terms and conditions',
        policy_link: 'https://www.example.com/privacy',
        policy_text: 'Privacy policy'
      }
    })
    console.log('Phone number retrieved:', response)
    resultFlow.value = 'get'
  } catch (err) {
    console.error('Failed to get phone number:', err)
    resultFlow.value = 'get'
  }
}

const handleVerifyNumber = async () => {
  const validationError = validatePhoneNumber(phoneInput.value)
  
  if (validationError) {
    phoneError.value = validationError
    return
  }
  
  try {
    const response = await verifyPhoneNumber(phoneInput.value)
    console.log('Verification result:', response)
    resultFlow.value = 'verify'
  } catch (err) {
    console.error('Failed to verify phone number:', err)
    resultFlow.value = 'verify'
  }
}

// Check browser support on mount
onMounted(() => {
  if (!isSupported.value) {
    console.warn('Browser does not support Digital Credentials API')
  }
})
</script>
