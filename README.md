# magical-auth-quickstart-nuxt
# Secure Phone Authentication - Nuxt Quick Start

This is a minimal example demonstrating secure phone authentication using:
- `glide-sdk` for the backend (Nuxt server API)
- `glide-web-client-sdk` for the frontend (Vue/Nuxt)

## Prerequisites

1. Node.js 16+ installed
2. Glide API credentials (get them from [Glide Documentation](https://docs.glideapi.com/))

## Setup

### Quick Start (External Server)

For immediate testing without backend setup:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the Nuxt app:**
   ```bash
   npm run dev
   ```

   This uses a pre-configured external server with hosted Glide credentials for quick testing.

### Full Setup (Local Server)

For production use with your own credentials:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   
   Create a `.env` file in the project root:
   ```env
   GLIDE_CLIENT_ID=your_client_id_here
   GLIDE_CLIENT_SECRET=your_client_secret_here
   ```

3. **Local server is ready:**
   
   The server API routes are already provided in `server/api/` with complete Glide SDK integration and TypeScript types.

4. **Update client configuration:**
   
   In `app.vue`, uncomment the local server URLs:
   ```javascript
   // Change from external server:
   // const prepareRequest = 'https://checkout-demo-server.glideidentity.dev/generate-get-request'
   // const processResponse = 'https://checkout-demo-server.glideidentity.dev/processCredential'
   
   // To local server:
   const prepareRequest = '/api/phone-auth/prepare'
   const processResponse = '/api/phone-auth/process'
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

   This will start the Nuxt app with both client and server on http://localhost:3000

## Usage

The app demonstrates two main features:

### 1. Verify Phone Number (Default)
Enter a phone number in E.164 format and click "Verify Phone Number" to verify ownership.

### 2. Get Phone Number
Click "Get My Phone Number" to retrieve the phone number associated with your device.

## Server Configuration

The app supports two server configurations:

### Option 1: External Server (Default)
```javascript
const prepareRequest = 'https://checkout-demo-server.glideidentity.dev/generate-get-request'
const processResponse = 'https://checkout-demo-server.glideidentity.dev/processCredential'
```
- **Pros**: No backend setup required, instant testing
- **Cons**: Uses shared demo credentials, not for production

### Option 2: Local Server
```javascript
const prepareRequest = '/api/phone-auth/prepare'
const processResponse = '/api/phone-auth/process'
```
- **Pros**: Your own credentials, full control, production-ready
- **Cons**: Requires backend setup and .env configuration

## How It Works

### With Local Server (Nuxt Server API):
1. **Backend** (already provided):
   - Complete TypeScript implementation using Nuxt server API routes
   - Uses `glide-sdk` to communicate with Glide's API
   - Exposes three endpoints:
      - `POST /api/phone-auth/prepare` - Creates a verification request
      - `POST /api/phone-auth/process` - Processes the verification response
      - `GET /api/health` - Health check with credentials validation
   - Automatically handles response format compatibility and eligibility checks

### With External Server:
1. **Backend**:
   - Pre-configured Glide SDK integration with demo credentials
   - Hosted endpoints handle all authentication logic
   - Same response format as local server

### Frontend (`app.vue`):
- Uses `glide-web-client-sdk/vue` for the `usePhoneAuth` composable
- Handles the Digital Credentials API browser flow
- Shows loading states, progress bars, and results
- Supports both "Get Phone Number" and "Verify Phone Number" flows
- E.164 phone number validation with real-time feedback

## Features

- ✅ **Apple-style Professional UI** with Glide Identity branding
- ✅ **3-step Progress Bar** showing real-time authentication status
- ✅ **E.164 Phone Validation** with comprehensive error handling
- ✅ **Carrier Eligibility Checks** with user-friendly error messages
- ✅ **Mobile Responsive Design** across all screen sizes
- ✅ **Dual Server Configuration** (external vs local)
- ✅ **Vue 3 Composition API** with TypeScript support
- ✅ **Nuxt 3 Server API** with proper error handling

## Browser Support

The Digital Credentials API is currently experimental and requires:
- Chrome/Edge 128+ on Android
- Experimental features may need to be enabled

## Nuxt-Specific Features

This implementation leverages Nuxt 3 best practices:

- **Server API Routes**: Backend logic in `server/api/` directory
- **Auto-imports**: Vue components and composables
- **TypeScript**: Full type safety throughout
- **SSR Disabled**: For Web Credentials API compatibility
- **File-based Routing**: Automatic route generation
- **Built-in Dev Tools**: Enhanced development experience

## Next Steps

- Add error handling for production use
- Implement proper authentication
- Add rate limiting
- Style the UI to match your brand
- Deploy to production

## Troubleshooting

- **"Browser not supported"**: Use a compatible browser with Digital Credentials API support
- **API errors**: Check your Glide credentials in the `.env` file
- **Server errors**: Check the Nuxt server logs in the terminal

## Deployment

To deploy to production:

```bash
# Build the application
npm run build

# Preview the production build
npm run preview

# Or generate static files
npm run generate
```

For more deployment options, see the [Nuxt deployment documentation](https://nuxt.com/docs/getting-started/deployment).
