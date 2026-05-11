# Google Sign-In Implementation Reference

## Frontend Implementation

### 1. Main App Wrapper (src/main.tsx)
```typescript
import { GoogleOAuthProvider } from "@react-oauth/google";
import { frontendEnv } from "./config/env";

const clientId = frontendEnv.googleClientId;

root.render(
  clientId ? (
    <GoogleOAuthProvider clientId={clientId}>
      <App />
    </GoogleOAuthProvider>
  ) : (
    <App />
  )
);
```

### 2. Google Button Component (src/components/auth/GoogleAuthSection.tsx)
Provides the Google Sign-In button UI with two modes:

**Sign-In Mode:**
```typescript
<GoogleLogin
  onSuccess={(credentialResponse) => {
    if (credentialResponse.credential) {
      void onSuccess(credentialResponse.credential);
    } else {
      onError();
    }
  }}
  onError={onError}
  theme="outline"
  size="large"
  text="signin_with"        // "Sign in with"
  shape="pill"
  width="100%"
  useOneTap={true}          // Enable One-Tap in signin
/>
```

**Sign-Up Mode:**
```typescript
<GoogleLogin
  onSuccess={(credentialResponse) => {
    if (credentialResponse.credential) {
      void onSuccess(credentialResponse.credential);
    } else {
      onError();
    }
  }}
  onError={onError}
  theme="outline"
  size="large"
  text="signup_with"         // "Sign up with"
  shape="pill"
  width="100%"
  useOneTap={false}
/>
```

### 3. Login Page (src/pages/Login.tsx)
```typescript
const handleGoogleSignIn = async (credential: string) => {
  setLoading(true);
  setError('');
  try {
    // Send credential to backend
    const result = await loginWithGoogle(credential);
    
    if (result?.needsRegistration) {
      // New user - go to signup with prefilled data
      navigate('/signup', {
        state: {
          isGoogleSignup: true,
          googleData: {
            ...result.googleData,
            credential,
          },
        },
      });
      return;
    }
    
    // Existing user - login successful
    navigate('/dashboard');
  } catch (err) {
    setError(handleApiError(err, 'Google sign in'));
  } finally {
    setLoading(false);
  }
};

// In JSX:
<GoogleAuthSection
  mode="signin"
  disabled={loading}
  isAvailable={googleAuthAvailable}
  onSuccess={handleGoogleSignIn}
  onError={() => setError('Google sign in failed. Please try again.')}
/>
```

### 4. Signup Page (src/pages/Signup.tsx)
```typescript
const handleGoogleSignupStart = async (credential: string) => {
  setLoading(true);
  setError('');
  try {
    // Check if user exists
    const result = await loginWithGoogle(credential);
    
    if (result?.needsRegistration) {
      // New user - prefill form data
      setIsGoogleSignup(true);
      setGoogleCredential(credential);
      setName(`${result.googleData.first_name} ${result.googleData.last_name}`);
      setEmail(result.googleData.email);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    // User already exists - just login
    navigate('/dashboard');
  } catch (err) {
    setError(handleApiError(err, 'Google sign up'));
  } finally {
    setLoading(false);
  }
};

// On form submit:
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    if (isGoogleSignup) {
      // Google signup flow
      await registerWithGoogle(
        googleCredential,           // JWT from Google
        selectedRole,               // patient, doctor, etc.
        licenseNumber,              // optional, for professionals
        licenseState,               // optional
        specialty,                  // optional
        phone,
        address,
        city,
        state,
        zipCode
      );
    } else {
      // Traditional email/password signup
      await signup(
        name,
        email,
        password,
        selectedRole,
        // ... other fields
      );
    }
    navigate('/dashboard');
  } catch (error) {
    setError(handleApiError(error));
  }
};
```

### 5. Auth Context (src/contexts/AuthContext.tsx)
```typescript
const loginWithGoogle = useCallback(async (credential: string) => {
  // Send to backend
  const response = await authApi.loginWithGoogle(credential);
  
  if (response.needs_registration) {
    // User doesn't exist - return data for signup
    return {
      needsRegistration: true,
      googleData: response.google_data,
    };
  }
  
  // User exists - set session
  if (!isApiUser(response.user)) {
    throw new Error('Login response did not include a valid user');
  }
  setUser(mapBackendUser(response.user));
  void loadAccessibleUsers();
  return {};
}, [loadAccessibleUsers]);

const registerWithGoogle = useCallback(async (
  credential: string,
  role: SignupRole,
  licenseNumber?: string,
  licenseState?: string,
  specialty?: string,
  phone?: string,
  address?: string,
  city?: string,
  state?: string,
  zipCode?: string,
) => {
  // Map frontend role to backend role
  const roleMap: Record<SignupRole, AuthRegisterRole> = {
    patient: 'patient',
    doctor: 'provider',
    hospital: 'hospital',
    laboratory: 'laboratory',
    imaging: 'imaging',
    pharmacy: 'pharmacist',
    ambulance: 'ambulance',
    physiotherapist: 'physiotherapist',
  };
  
  const response = await authApi.registerWithGoogle({
    credential,
    role: roleMap[role] || 'patient',
    phone: phone || undefined,
    address: address || undefined,
    city: city || undefined,
    state: state || undefined,
    zip_code: zipCode || undefined,
    license_number: role === 'patient' ? undefined : licenseNumber,
    license_state: role === 'patient' ? undefined : licenseState,
    specialty: role === 'patient' ? undefined : specialty,
  });
  
  if (isApiUser(response.user)) {
    setUser(mapBackendUser(response.user));
    void loadAccessibleUsers();
  }
}, [loadAccessibleUsers]);
```

### 6. API Service (src/lib/apiService.ts)
```typescript
export const authApi = {
  loginWithGoogle: async (credential: string) => {
    const response = await apiClient.post<ApiAuthResponse>(
      '/auth/oauth/google',
      { credential }
    );
    return response.data;
  },

  registerWithGoogle: async (userData: {
    credential: string;
    role: 'patient' | 'provider' | 'pharmacist' | 'hospital' | 'laboratory' | 'imaging' | 'ambulance' | 'physiotherapist';
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    license_number?: string;
    license_state?: string;
    specialty?: string;
  }) => {
    const response = await apiClient.post<ApiAuthResponse>(
      '/auth/oauth/google/register',
      userData
    );
    return response.data;
  },
};
```

---

## Backend Implementation

### 1. OAuth Endpoint - Login (backend/app/routes/auth.py:312)
```python
@router.post("/oauth/google")
async def oauth_google(
    payload: OAuthRequest,
    db: Session = Depends(get_db),
    response: Response = None,
    request: Request = None,
):
    """Authenticate or register user via Google OAuth"""
    enforce_rate_limit(request=request, scope="auth:oauth", limit=10, window_seconds=60)
    
    if not HAS_GOOGLE_AUTH:
        raise HTTPException(status_code=500, detail="google-auth library is not installed")
        
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=500, detail="Google Auth is not configured on the server")
    
    try:
        # Verify the JWT token from Google
        idinfo = google_id_token.verify_oauth2_token(
            payload.credential,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID
        )
        
        email = idinfo.get("email")
        if not email:
            raise HTTPException(status_code=400, detail="No email provided by Google")
        
        # Check if user exists
        user = db.query(User).filter(User.email == email).first()
        
        if not user:
            # User doesn't exist - return registration data
            first_name = idinfo.get("given_name", "")
            last_name = idinfo.get("family_name", "")
            
            return {
                "message": "User not found. Please complete registration.",
                "needs_registration": True,
                "google_data": {
                    "email": email,
                    "first_name": first_name,
                    "last_name": last_name,
                    "credential": payload.credential,
                }
            }
        
        if not user.is_active:
            raise HTTPException(status_code=403, detail="User account is disabled")
        
        # Update last login
        user.last_login = utcnow()
        _commit_or_rollback(db)
        
        # Create session tokens
        access_token, refresh_token = _build_token_pair(user)
        csrf_token = generate_csrf_token()
        
        # Set cookies
        if response is not None:
            set_auth_cookies(response, access_token, refresh_token)
            set_csrf_token(response, csrf_token)
        
        # Audit log
        await log_action(
            db=db,
            user_id=user.id,
            role=user.role.value,
            action="auth.oauth_login",
            description="Successful Google OAuth login",
            status="success",
            ip_address=client_ip_from_request(request),
            user_agent=request.headers.get("user-agent") if request else None,
            metadata={"provider": "google"},
        )
        
        return {
            "message": "Login successful",
            "user": _serialize_user(user),
            "csrf_token": csrf_token,
        }
        
    except ValueError:
        # Invalid token
        raise HTTPException(status_code=401, detail="Invalid Google token")
```

### 2. OAuth Endpoint - Register (backend/app/routes/auth.py:398)
```python
@router.post("/oauth/google/register")
async def oauth_google_register(
    payload: OAuthRegisterRequest,
    db: Session = Depends(get_db),
    response: Response = None,
    request: Request = None,
):
    """Register a new user via Google OAuth"""
    enforce_rate_limit(request=request, scope="auth:oauth_register", limit=5, window_seconds=60)
    
    if not HAS_GOOGLE_AUTH:
        raise HTTPException(status_code=500, detail="google-auth library is not installed")
        
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=500, detail="Google Auth is not configured on the server")
    
    try:
        # Verify JWT token
        idinfo = google_id_token.verify_oauth2_token(
            payload.credential,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID
        )
        
        email = idinfo.get("email")
        if not email:
            raise HTTPException(status_code=400, detail="No email provided by Google")
        
        # Check if user already exists
        user = db.query(User).filter(User.email == email).first()
        
        if user:
            raise HTTPException(status_code=400, detail="User already exists with this email")
        
        # Extract user info from Google token
        first_name = idinfo.get("given_name", "")
        last_name = idinfo.get("family_name", "")
        
        # Generate strong random password (won't be used for login, but required)
        hashed_password = hash_password(generate_secure_token() + "Aa1!")
        
        # Only patients are automatically verified, professionals pending admin review
        is_verified = payload.role == UserRole.PATIENT
        
        # Create new user
        user = User(
            email=email,
            username=email.split("@")[0],
            hashed_password=hashed_password,
            first_name=first_name,
            last_name=last_name,
            phone=payload.phone,
            address=payload.address,
            city=payload.city,
            state=payload.state,
            zip_code=payload.zip_code,
            license_number=payload.license_number,
            license_state=payload.license_state,
            specialty=payload.specialty,
            role=payload.role,
            is_verified=is_verified,
            email_verified=True,              # Google provides verified email
            email_verified_at=utcnow(),
            is_active=True,
            session_version=0,
            notification_email=True,
            notification_sms=False,
            privacy_public_profile=False,
        )
        db.add(user)
        _commit_or_rollback(db)
        db.refresh(user)
        
        # Audit log
        await log_action(
            db=db,
            user_id=user.id,
            action="auth.oauth_register",
            description=f"Registered account via Google with role {user.role.value}",
            status="created",
        )
        
        # Update last login
        user.last_login = utcnow()
        _commit_or_rollback(db)
        
        # Create session tokens
        access_token, refresh_token = _build_token_pair(user)
        csrf_token = generate_csrf_token()
        
        # Set cookies
        if response is not None:
            set_auth_cookies(response, access_token, refresh_token)
            set_csrf_token(response, csrf_token)
        
        return {
            "message": "Registration and login successful",
            "user": _serialize_user(user),
            "csrf_token": csrf_token,
        }
        
    except ValueError:
        # Invalid token
        raise HTTPException(status_code=401, detail="Invalid Google token")
```

### 3. Configuration (backend/config.py)
```python
class Settings(BaseSettings):
    # ... other config ...
    
    # OAuth
    GOOGLE_CLIENT_ID: str = ""
    
    # ... other config ...
```

---

## Data Flow

### 1. Frontend → Backend (Login)
```json
POST /auth/oauth/google
{
  "credential": "<JWT_from_Google>"
}

Response 1 (existing user):
{
  "message": "Login successful",
  "user": { "id": 1, "email": "user@example.com", "role": "patient", ... },
  "csrf_token": "..."
}

Response 2 (new user):
{
  "message": "User not found. Please complete registration.",
  "needs_registration": true,
  "google_data": {
    "email": "newuser@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "credential": "<JWT_from_Google>"
  }
}
```

### 2. Frontend → Backend (Register)
```json
POST /auth/oauth/google/register
{
  "credential": "<JWT_from_Google>",
  "role": "patient",
  "phone": "+1234567890",
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zip_code": "10001",
  "license_number": null,
  "license_state": null,
  "specialty": null
}

Response:
{
  "message": "Registration and login successful",
  "user": { "id": 2, "email": "newuser@example.com", "role": "patient", "is_verified": true, ... },
  "csrf_token": "..."
}
```

---

## Environment Variables

### Frontend (.env.local)
```
VITE_GOOGLE_CLIENT_ID=<client-id-from-google-cloud>
VITE_API_URL=http://localhost:8000/api
```

### Backend (backend/.env)
```
GOOGLE_CLIENT_ID=<same-client-id>
ENVIRONMENT=development
FRONTEND_URL=http://localhost:5173
```

---

## Dependencies

### Frontend
- `@react-oauth/google`: ^0.13.5 (Google Sign-In button)
- `google-auth-library-nodejs`: Included in @react-oauth/google

### Backend
- `google-auth`: 2.28.1 (Token verification)
- `google-auth-httplib2`: Optional, installed as dependency

---

## Error Handling

### Frontend
```typescript
try {
  const result = await loginWithGoogle(credential);
  // Handle result
} catch (err) {
  // handleApiError() formats the error message
  const friendlyMessage = handleApiError(err, 'Google sign in');
  // Display to user
}
```

### Backend
```python
try:
    idinfo = google_id_token.verify_oauth2_token(...)
except ValueError:
    # Token invalid or expired
    raise HTTPException(status_code=401, detail="Invalid Google token")
```

---

## Security

### Token Verification
- All tokens verified on backend, never trusted frontend
- Google's public key used to verify JWT signature
- Token expiration checked automatically

### Rate Limiting
- Login: 10 requests per 60 seconds per IP
- Registration: 5 requests per 60 seconds per IP

### Cookies
- HTTP-only (can't be accessed by JavaScript)
- Secure flag (HTTPS only in production)
- SameSite attribute set

### CSRF Protection
- CSRF token generated after successful auth
- Sent in response and stored in frontend
- Validated on subsequent requests

### Audit Logging
- All OAuth events logged (auth.oauth_login, auth.oauth_register)
- IP address recorded
- User agent recorded
- Action status recorded (success/failure)

