# Environment Variables for Stytch Authentication

This document outlines the environment variables required for the Stytch authentication system to work properly.

## Required Environment Variables

```env
# Stytch Configuration
STYTCH_PROJECT_ID=project-test-61a53187-a905-42a5-be25-3ce309964866
STYTCH_SECRET=secret-test-eEkLXO3kO0nXZAwLaZoWxDhIq4ZmNQrGXT4=
STYTCH_PUBLIC_TOKEN=your_stytch_public_token
STYTCH_REDIRECT_URL=http://localhost:3000/api/auth/callback

# Google OAuth Configuration (optional, for Google login)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```   

## How to Obtain These Values

1. **STYTCH_PROJECT_ID** and **STYTCH_SECRET**:
   - Go to the [Stytch Dashboard](https://stytch.com/dashboard)
   - Select your project
   - Navigate to "API Keys"
   - Copy the "Project ID" and "Secret"

2. **STYTCH_PUBLIC_TOKEN**:
   - In the same "API Keys" section
   - Copy the "Public Token"

3. **STYTCH_REDIRECT_URL**:
   - This should be set to your callback URL
   - For local development: `http://localhost:3000/api/auth/callback`
   - For production: `https://yourdomain.com/api/auth/callback`

4. **GOOGLE_CLIENT_ID** and **GOOGLE_CLIENT_SECRET**:
   - Go to the [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the Google+ API
   - Go to "Credentials" and create an OAuth 2.0 Client ID
   - Set the authorized redirect URIs to include:
     - `http://localhost:3000/api/auth/callback` (for development)
     - `https://yourdomain.com/api/auth/callback` (for production)
   - Copy the Client ID and Client Secret

## Important Notes

- Never commit these values to version control
- Use a `.env.local` file for local development
- Set these as environment variables in your production environment
- Ensure the redirect URLs in your Stytch dashboard match your application URLs