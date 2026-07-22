# Google Sign-In Integration - Complete Verification Guide

## Current Status
✅ **FULLY INTEGRATED AND READY TO USE**

All Google Sign-In functionality is complete on both frontend and backend. You only need to add your Google OAuth Client ID.

---

## Architecture Overview

### Frontend Flow (React)
```
main.tsx
├─ GoogleOAuthProvider (wraps app with client ID)
└─ App.tsx
   ├─ Login.tsx (uses GoogleAuthSection)
   ├─ Signup.tsx (uses GoogleAuthSection)
   └─ GoogleAuthSection Component
      ├─ GoogleLogin button
      └─ onSuccess → loginWithGoogle() or registerWithGoogle()
```

### Backend Flow (FastAPI)
```
POST /auth/oauth/google
├─ Verify Google token with google-auth library
├─ Check if email exists
├─ If exists: Login (set cookies) → Return user
└─ If not exists: Redirect to signup (return needs_registration)

POST /auth/oauth/google/register
├─ Verify Google token
├─ Create new user with provided role + details
├─ Set cookies + CSRF token
└─ Return user + tokens
```

---

## Setup Checklist

### 1. Get Google OAuth Credentials
- [ ] Go to https://console.cloud.google.com/
- [ ] Create new project or select existing
- [ ] Enable "Google+ API" from APIs & Services > Library
- [ ] Go to APIs & Services > Credentials
- [ ] Create OAuth 2.0 Client ID (Web application)
- [ ] Configure Consent Screen if needed (External user type)
- [ ] Add Authorized Redirect URIs:
  - [ ] http://localhost:5173 (frontend dev)
  - [ ] http://localhost:5174 (alt frontend dev)
  - [ ] http://localhost:3000 (fallback dev)
  - [ ] http://localhost:8000 (backend dev)
  - [ ] https://your-production-domain.com (production)
- [ ] Copy Client ID

### 2. Configure Frontend
- [ ] Open `.env.local` in project root
- [ ] Add your Client ID: `VITE_GOOGLE_CLIENT_ID=your-client-id`
- [ ] Save file

### 3. Configure Backend  
- [ ] Open `backend/.env`
- [ ] Add same Client ID: `GOOGLE_CLIENT_ID=your-client-id`
- [ ] Verify `FRONTEND_URL=http://localhost:5173` (for dev)
- [ ] Save file

### 4. Verify Installation
- [ ] Frontend: `npm install` (already has @react-oauth/google)
- [ ] Backend: `pip install -r requirements.txt` (has google-auth)
- [ ] Restart dev servers

---

## Component Files

### Frontend Components
- [src/main.tsx](../../src/main.tsx) - GoogleOAuthProvider wrapper
- [src/components/auth/GoogleAuthSection.tsx](../../src/components/auth/GoogleAuthSection.tsx) - Google button UI
- [src/pages/Login.tsx](../../src/pages/Login.tsx) - Login with Google
- [src/pages/Signup.tsx](../../src/pages/Signup.tsx) - Signup with Google
- [src/contexts/AuthContext.tsx](../../src/contexts/AuthContext.tsx) - loginWithGoogle/registerWithGoogle
- [src/lib/apiService.ts](../../src/lib/apiService.ts) - API endpoints
- [src/config/env.ts](../../src/config/env.ts) - Environment config

### Backend Components
- [backend/app/routes/auth.py](../../backend/app/routes/auth.py) - OAuth endpoints (lines 312-500)
- [backend/config.py](../../backend/config.py) - GOOGLE_CLIENT_ID config

---

## Features Implemented

### Login Flow
1. User clicks "Continue with Google"
2. Google login popup appears
3. User authenticates with Google
4. Frontend sends JWT credential to `/auth/oauth/google`
5. Backend verifies token
6. If user exists → Login successful, redirect to dashboard
7. If user doesn't exist → Return needs_registration, redirect to signup with prefilled data

### Signup Flow
1. User clicks "Create your account with Google"
2. Same as login until step 5
3. If user doesn't exist:
   - Redirect to signup page with prefilled Google data
   - User selects role and enters professional details (if applicable)
   - Submit form to `/auth/oauth/google/register`
   - Backend creates new user with role
   - Redirect to dashboard

### Security Features
- ✅ Google token verification (server-side)
- ✅ Rate limiting on OAuth endpoints (10 req/min login, 5 req/min register)
- ✅ CSRF token generation
- ✅ Secure HTTP-only cookies
- ✅ Email verification status
- ✅ Professional role requires license number (pending admin review)
- ✅ Audit logging for OAuth events

---

## Testing Guide

### Test 1: Login with Google (Existing Patient Account)
1. Create patient account manually first
2. On login page, click "Continue with Google"
3. Sign in with same email
4. Should login successfully

### Test 2: Signup with Google (New Account)
1. On signup page, click "Create account with Google"
2. Use new email not in system
3. Should redirect to role selection with prefilled name
4. Select role (e.g., Patient)
5. Submit → Should create account and login

### Test 3: Signup with Google (Professional Role)
1. On signup page, click "Create account with Google"
2. Use new email
3. Select professional role (Doctor, Hospital, etc.)
4. Enter license number and state
5. Submit → Account created but pending verification
6. Admin sees pending account in staff dashboard

### Test 4: Error Handling
- Revoke Google session → Try to login → Should show friendly error
- Use unverified email → Should still work (Google provides verified email)
- Rapid repeated clicks → Rate limiting kicks in

---

## Environment Variables

### Frontend (.env.local)
```
VITE_GOOGLE_CLIENT_ID=<your-google-client-id>
VITE_API_URL=http://localhost:8000/api
VITE_APP_ENV=development
```

### Backend (backend/.env)
```
GOOGLE_CLIENT_ID=<your-google-client-id>
FRONTEND_URL=http://localhost:5173
ENVIRONMENT=development
```

---

## Troubleshooting

### "Google sign-in is unavailable" message appears
→ `VITE_GOOGLE_CLIENT_ID` not set in `.env.local`
→ Restart dev server after setting env var

### "Invalid Google token" error
→ Client ID mismatch between frontend and backend
→ Ensure both .env files have same ID
→ Token may be expired (Google tokens expire quickly)

### User can't click Google button
→ Check that `@react-oauth/google` package is installed: `npm list @react-oauth/google`
→ Ensure `GoogleOAuthProvider` is wrapping app in main.tsx

### Backend returns "Google Auth not configured"
→ `GOOGLE_CLIENT_ID` not set in `backend/.env`
→ Backend needs restart after setting env var
→ Verify `google-auth` package installed: `pip show google-auth`

### Redirect URI mismatch error from Google
→ Add http://localhost:5173 to Authorized redirect URIs in Google Cloud Console
→ Must exactly match your dev URL
→ Can use regex patterns like `https://.*\.vercel\.app`

---

## Production Deployment

### Before deploying to production:
1. Create OAuth credentials for production domain
2. Add production URLs to Authorized Redirect URIs
3. Set environment variables:
   - Frontend: `VITE_GOOGLE_CLIENT_ID` in Vercel/environment
   - Backend: `GOOGLE_CLIENT_ID` in environment, `FRONTEND_URL` to production domain
4. Set `COOKIE_SECURE=True` in backend for HTTPS
5. Test complete flow in staging environment

---

## Files Modified for Google Auth Integration
- ✅ main.tsx - GoogleOAuthProvider added
- ✅ Login.tsx - GoogleAuthSection integrated
- ✅ Signup.tsx - GoogleAuthSection integrated  
- ✅ AuthContext.tsx - OAuth functions implemented
- ✅ apiService.ts - OAuth endpoints added
- ✅ auth.py - OAuth routes implemented
- ✅ config.py - GOOGLE_CLIENT_ID added
- ✅ requirements.txt - google-auth added

All modifications already complete! ✅

---

## Next Steps
1. Get Google OAuth credentials (see Setup Checklist)
2. Add Client ID to `.env.local` and `backend/.env`
3. Restart dev servers
4. Test login/signup flow
5. Deploy to production when ready

---

## Support
Refer to official docs:
- Google OAuth Setup: [docs/GOOGLE_OAUTH_SETUP.md](../../docs/GOOGLE_OAUTH_SETUP.md)
- ALERA Architecture: [docs/SYSTEM_ARCHITECTURE.md](../../docs/SYSTEM_ARCHITECTURE.md)
