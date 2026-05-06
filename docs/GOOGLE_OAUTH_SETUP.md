# Google OAuth 2.0 Setup Guide for ALERA Healthcare

This guide walks you through setting up Google OAuth 2.0 for social sign-in features in ALERA.

## Overview

ALERA supports Google Sign-In for both authentication and registration. This requires:
1. A Google OAuth 2.0 Client ID from Google Cloud Console
2. Configuration in both frontend and backend environment files
3. Authorized redirect URIs configured in Google Cloud

## Prerequisites

- Google account (personal or workspace)
- Access to [Google Cloud Console](https://console.cloud.google.com/)
- ALERA project already set up and running locally

## Step-by-Step Setup

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click **NEW PROJECT**
4. Name it (e.g., "ALERA Healthcare Development")
5. Click **CREATE**
6. Wait for the project to be created and select it

### 2. Enable Required APIs

1. In Google Cloud Console, go to **APIs & Services** > **Library**
2. Search for "Google Identity" or "Google+ API"
3. Click **Google+ API** (or **Google Identity Services API** if available)
4. Click **ENABLE**

Alternative: You can also search for and enable:
- "Google Drive API" (optional)
- "Google+ API" (primary for sign-in)

### 3. Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **+ CREATE CREDENTIALS** at the top
3. Select **OAuth client ID**
4. If prompted to create a consent screen first:
   - Click **Configure Consent Screen**
   - Select **External** as the User Type
   - Click **CREATE**
   - Fill in the required fields:
     - App name: "ALERA Healthcare"
     - User support email: (your email)
     - Developer contact information: (your email)
   - Click **SAVE AND CONTINUE**
   - Leave scopes as default, click **SAVE AND CONTINUE**
   - Click **BACK TO DASHBOARD**

5. Now go back to **Credentials** > **+ CREATE CREDENTIALS** > **OAuth client ID**
6. Select **Web application** as the Application type
7. Name it (e.g., "ALERA Web Client")

### 4. Add Authorized Redirect URIs

In the OAuth 2.0 Client ID creation form, add these URIs under **Authorized redirect URIs**:

**For Local Development:**
```
http://localhost:5173
http://localhost:5174
http://localhost:3000
```

**For Staging/Production:**
```
https://your-staging-domain.com
https://your-production-domain.com
https://alera-gamma.vercel.app
```

> Note: After creating the credentials, you can edit them anytime by going to **Credentials** > Click the credential name

### 5. Copy Your Client ID

1. After creating the OAuth client:
   - You'll see a modal with your **Client ID** and **Client Secret**
   - Copy the **Client ID** (you won't need the Client Secret for this implementation)
   - This is the value you'll add to your environment files

### 6. Configure Frontend Environment

1. Open `.env.local` in the project root:
   ```bash
   nano .env.local
   # or open in your editor
   ```

2. Add or update this line:
   ```
   VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE
   ```

3. Replace `YOUR_CLIENT_ID_HERE` with the Client ID from step 5

4. Save the file

### 7. Configure Backend Environment

1. Open `backend/.env`:
   ```bash
   nano backend/.env
   ```

2. Add or update this line:
   ```
   GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE
   ```

3. Replace `YOUR_CLIENT_ID_HERE` with the **same** Client ID from step 5

4. Save the file

## Verification

### 1. Restart Development Servers

```bash
# If running frontend dev server, restart it:
npm run dev

# In another terminal, restart backend:
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Test Social Sign-In

1. Navigate to **http://localhost:5173/login** in your browser
2. You should now see a **"Continue with Google"** button
3. Click it and test the flow:
   - You should be redirected to Google's sign-in page
   - After signing in, you should be logged into ALERA
   - If this is a new account, you'll be prompted to complete registration

### 3. Test Registration

1. Navigate to **http://localhost:5173/signup**
2. You should see a **"Create your account with Google"** button
3. Click it and test creating a new account via Google

## Troubleshooting

### "Google sign-in is unavailable" Message

**Issue:** You see a warning message saying Google sign-in is unavailable.

**Solutions:**
1. Verify `VITE_GOOGLE_CLIENT_ID` is set in `.env.local` (not empty)
2. Verify `GOOGLE_CLIENT_ID` is set in `backend/.env`
3. Restart both frontend and backend servers
4. Clear browser cache and hard refresh (Ctrl+Shift+R)

### "Invalid Google token" Error

**Issue:** After signing in with Google, you see an error "Invalid Google token"

**Solutions:**
1. Ensure both `VITE_GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_ID` have the **exact same value**
2. Verify the Client ID hasn't been regenerated in Google Cloud Console
3. Check that your redirect URI matches exactly:
   - If using `http://localhost:5173`, ensure Google Console has this exact URI
   - Port numbers matter! `localhost:5173` ≠ `localhost:3000`
4. Check backend logs for detailed error information

### CORS Issues

**Issue:** Request fails with CORS error

**Solutions:**
1. Verify `FRONTEND_URL` in `backend/.env` matches your frontend domain
2. Verify `CORS_ORIGINS` in `backend/.env` includes your frontend URL
3. Restart backend server after changes

### "OAuth is not configured on the server"

**Issue:** Backend returns this error

**Solutions:**
1. Verify `GOOGLE_CLIENT_ID` is set in `backend/.env` (not empty)
2. Restart the backend server
3. Check that the value is not just whitespace

## Security Considerations

### Development vs. Production

**Development:**
- Using `http://localhost` is fine
- Client ID can be public (it's already exposed in frontend)

**Production:**
- Always use `https://` URLs
- Configure credentials for your production domain
- Consider rotating credentials regularly
- Store `GOOGLE_CLIENT_ID` securely

### Best Practices

1. **Never commit credentials** to git:
   - `.env.local` should be in `.gitignore` ✓ (already is)
   - `backend/.env` should be in `.gitignore` ✓ (already is)

2. **Use separate credentials** for each environment:
   - Development: localhost URIs
   - Staging: staging domain
   - Production: production domain

3. **Restrict redirect URIs** to only your domains

4. **Monitor usage** in Google Cloud Console for suspicious activity

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Sign-In for Web](https://developers.google.com/identity/sign-in/web)
- [React OAuth Google Library](https://github.com/react-oauth/react-oauth.google)

## Support

If you encounter issues:

1. Check backend logs: `tail -f backend.log` or console output
2. Check browser console: Open DevTools (F12) > Console tab
3. Verify both frontend and backend have the same Client ID
4. Ensure Google APIs are enabled in your Google Cloud Project
5. Try creating a new OAuth credential if the issue persists

## Next Steps

After completing this setup:

1. Test social sign-in on both `/login` and `/signup` pages
2. Verify user data is correctly populated from Google
3. Test cross-environment sign-in (if applicable)
4. Configure for production domains when ready

---

**Last Updated:** 2026-05-01
**ALERA Healthcare System**
