# Google Sign-In UI Reference

## Sign In Page (`/login`)

```
┌─────────────────────────────────────────────────────────────────┐
│  ALERA - Unified healthcare operations                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Welcome back                                                   │
│  Sign in                                                        │
│  Enter your credentials to continue to your dashboard.          │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ 🌐 Faster access                                        │  │
│  │    Continue with Google                                 │  │
│  │    Use your Google account to sign in securely          │  │
│  │                                                         │  │
│  │    ┌──────────────────────────────────────────────┐   │  │
│  │    │ ⊙ Sign in with                              │   │  │
│  │    └──────────────────────────────────────────────┘   │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ────────── Or continue with email ──────────                 │
│                                                                 │
│  Email *                                                        │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ you@example.com                                         │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Password *                                      Forgot?       │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ ••••••••••                              👁                │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Sign In →                                               │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Sign Up Page (`/signup`)

```
┌─────────────────────────────────────────────────────────────────┐
│  ALERA - Unified healthcare operations                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Create your account                                            │
│  Choose your role and join ALERA                               │
│                                                                 │
│  [Role Selection Grid]                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ 👤 Patient   │  │ ❤️ Doctor    │  │ 🏥 Hospital │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ 🧪 Lab      │  │ 🩻 Imaging   │  │ 💊 Pharmacy │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│  ┌──────────────┐  ┌──────────────┐                           │
│  │ 🚑 Ambulance │  │ 🤸 Physio    │                           │
│  └──────────────┘  └──────────────┘                           │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ 🌐 Social sign-up                                       │  │
│  │    Create your account with Google                       │  │
│  │    Start with Google, then complete role details         │  │
│  │                                                         │  │
│  │    ┌──────────────────────────────────────────────┐   │  │
│  │    │ ⊙ Sign up with                              │   │  │
│  │    └──────────────────────────────────────────────┘   │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ────────── Or create your account with email ──────────      │
│                                                                 │
│  Full Name *                                                    │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Enter your full name                                    │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Email *                                                        │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ your@example.com                                        │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Password *                                                     │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Must be 8+ chars with uppercase, lowercase, number      │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  [Additional fields based on role...]                          │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Create Account →                                        │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Google Sign-In Flow

### Flow 1: Existing User (Login)
```
User clicks "Continue with Google"
         ↓
Google login popup
         ↓
User authenticates
         ↓
Frontend: credential sent to /auth/oauth/google
         ↓
Backend: Verify token + find user
         ↓
✅ User exists
         ↓
Create session cookies
         ↓
Redirect to /dashboard
```

### Flow 2: New User (Signup)
```
User clicks "Sign up with Google"
         ↓
Google login popup
         ↓
User authenticates
         ↓
Frontend: credential sent to /auth/oauth/google
         ↓
Backend: Verify token + check if user exists
         ↓
❌ User doesn't exist
         ↓
Return: { needs_registration: true, google_data: {...} }
         ↓
Frontend: Redirect to /signup with prefilled data
         ↓
User selects role + professional details (if applicable)
         ↓
Submit form to /auth/oauth/google/register
         ↓
Backend: Create new user account
         ↓
Create session cookies
         ↓
Redirect to /dashboard
```

### Flow 3: Professional Role Signup
```
New professional account (Doctor, Hospital, Lab, etc.)
         ↓
Fill license number + state + specialty
         ↓
Submit registration
         ↓
Account created with is_verified = false
         ↓
Status: "Pending Admin Review"
         ↓
Admin sees in Staff → KYC dashboard
         ↓
Admin verifies license details
         ↓
Account activated
```

## Component Hierarchy

```
App.tsx
└── GoogleOAuthProvider (clientId)
    ├── Login.tsx
    │   └── GoogleAuthSection
    │       └── GoogleLogin button
    │           └── onSuccess: handleGoogleSignIn()
    │               └── loginWithGoogle()
    │
    ├── Signup.tsx
    │   └── GoogleAuthSection
    │       └── GoogleLogin button
    │           └── onSuccess: handleGoogleSignupStart()
    │               └── loginWithGoogle()
    │
    └── Other pages...
```

## Key States

### Loading States
- Button disabled while processing Google auth
- "Signing in..." or "Signing up..." message shown
- Rate limiting: 10 logins/min, 5 signups/min per IP

### Error Handling
- Invalid token → "Invalid Google token"
- Email already registered → "User already exists"
- Account disabled → "User account is disabled"
- Server misconfigured → "Google Auth is not configured"

### Success States
- Existing user → Session created, redirect to dashboard
- New user → Redirect to role/details form
- Professional → Account pending admin review

## Security Features
✅ Token verified on backend (not frontend)
✅ CSRF protection
✅ Secure HTTP-only cookies
✅ Rate limiting on endpoints
✅ Audit logging for all OAuth events
✅ Email automatically verified (from Google)
