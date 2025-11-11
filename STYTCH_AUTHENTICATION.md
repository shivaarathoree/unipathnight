# Stytch Authentication Implementation

This document explains how the Stytch authentication system is implemented in this Next.js application.

## Architecture Overview

The authentication system consists of the following components:

1. **Frontend Pages**: Custom login/signup pages using Stytch UI components
2. **Backend API Routes**: Server-side endpoints for handling authentication callbacks
3. **Session Management**: Cookie-based session handling with Stytch tokens
4. **User Management**: Integration with the existing Prisma database
5. **Middleware**: Route protection for authenticated pages

## Authentication Flow

### 1. Email Magic Link Authentication

1. User enters their email on the login/signup page
2. Stytch sends a magic link to the user's email
3. User clicks the magic link which redirects to `/api/auth/callback` with a token
4. The callback endpoint exchanges the token for a session
5. User information is upserted in the database
6. A session cookie is set
7. User is redirected to the dashboard or onboarding

### 2. Google OAuth Authentication

1. User clicks "Continue with Google" button
2. Stytch initiates the OAuth flow
3. User authenticates with Google
4. Google redirects back to `/api/auth/callback` with an OAuth token
5. The callback endpoint exchanges the token for a session
6. User information is upserted in the database
7. A session cookie is set
8. User is redirected to the dashboard or onboarding

## Key Components

### Frontend Components

- `app/(auth)/sign-in/[[...sign-in]]/page.jsx` - Login page with magic link and Google OAuth
- `app/(auth)/sign-up/[[...sign-up]]/page.jsx` - Signup page with magic link and Google OAuth
- `components/user-menu.jsx` - User dropdown menu with profile and logout
- `components/logout.jsx` - Simple logout button component

### Backend Routes

- `app/api/auth/callback/route.js` - Handles authentication callbacks from Stytch
- `app/api/auth/logout/route.js` - Handles user logout and session revocation

### Utility Functions

- `lib/stytch/client.js` - Stytch client initialization for frontend
- `lib/stytch/server.js` - Stytch client initialization for backend and utility functions
- `lib/stytch/session.js` - Session management utilities
- `lib/checkUser.js` - User authentication check utility

### Middleware

- `middleware.js` - Protects authenticated routes

## Database Integration

The system integrates with the existing Prisma database without modifying the schema:

- Uses the existing `User` model
- Stores Stytch user IDs in the `clerkUserId` field (for backward compatibility)
- Automatically creates or updates user records during authentication

## Session Management

Sessions are managed using HTTP-only cookies:

- Cookie name: `stytch_session`
- Contains the Stytch session token
- Secure in production, accessible only via HTTPS
- Automatically expires when the Stytch session expires

## Route Protection

The middleware protects the following routes:
- `/dashboard/*`
- `/resume/*`
- `/interview/*`
- `/ai-cover-letter/*`
- `/onboarding/*`

Unauthenticated users are redirected to the sign-in page.

## Customization

To customize the authentication flow:

1. Modify the login/signup pages in `app/(auth)/`
2. Update the callback handling in `app/api/auth/callback/route.js`
3. Adjust session management in `lib/stytch/session.js`
4. Modify protected routes in `middleware.js`

## Troubleshooting

Common issues and solutions:

1. **Authentication failing**: Check that environment variables are correctly set
2. **Redirect loops**: Ensure callback URLs are correctly configured in Stytch dashboard
3. **Session issues**: Verify cookie settings and HTTPS configuration in production
4. **User creation failures**: Check database connectivity and permissions