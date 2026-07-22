# Google Sign-In Quick Start Checklist

## 🚀 Get Started in 5 Minutes

### Step 1: Get Google OAuth Credentials (3 min)
- [ ] Visit https://console.cloud.google.com/
- [ ] Create new project (or use existing)
- [ ] Go to "APIs & Services" > "Library"
- [ ] Search "Google+ API" → Click ENABLE
- [ ] Go to "Credentials"
- [ ] Click "+ CREATE CREDENTIALS"
- [ ] Select "OAuth client ID"
- [ ] If prompted to "Configure Consent Screen":
  - [ ] Select "External"
  - [ ] Fill App name: "ALERA Healthcare"
  - [ ] Fill Developer contact email
  - [ ] Complete setup
- [ ] Go back to Credentials > Create OAuth client ID
- [ ] Select "Web application"
- [ ] Name: "ALERA Web Client"
- [ ] Add Redirect URIs:
  - [ ] http://localhost:5173
  - [ ] http://localhost:5174
  - [ ] http://localhost:3000
- [ ] Copy the **Client ID**

### Step 2: Configure Frontend (1 min)
- [ ] Open `.env.local` in project root
- [ ] Find: `VITE_GOOGLE_CLIENT_ID=`
- [ ] Paste your Client ID: `VITE_GOOGLE_CLIENT_ID=<YOUR-CLIENT-ID>`
- [ ] Save file

### Step 3: Configure Backend (30 sec)
- [ ] Open `backend/.env`
- [ ] Find: `GOOGLE_CLIENT_ID=`
- [ ] Paste same Client ID: `GOOGLE_CLIENT_ID=<YOUR-CLIENT-ID>`
- [ ] Save file

### Step 4: Restart Dev Servers (1 min)
- [ ] Terminal 1: Stop frontend (`Ctrl+C`), then: `npm run dev`
- [ ] Terminal 2: Stop backend (`Ctrl+C`), then: `cd backend && python main.py`
- [ ] Wait for servers to start

### Step 5: Test (30 sec)
- [ ] Open http://localhost:5173/login
- [ ] Click "Continue with Google"
- [ ] Sign in with your Google account
- [ ] Should redirect to dashboard ✅

---

## ✅ Verification Checklist

### Frontend Checks
- [ ] `.env.local` has `VITE_GOOGLE_CLIENT_ID=<YOUR-ID>`
- [ ] `npm run dev` shows no errors
- [ ] http://localhost:5173/login loads
- [ ] "Continue with Google" button visible
- [ ] Google login popup appears when clicked

### Backend Checks
- [ ] `backend/.env` has `GOOGLE_CLIENT_ID=<YOUR-ID>`
- [ ] Backend server running (http://localhost:8000)
- [ ] `/auth/oauth/google` endpoint responds
- [ ] No 500 errors in backend logs

### Google Cloud Checks
- [ ] Project created and selected
- [ ] Google+ API enabled
- [ ] OAuth 2.0 Client ID created (Web application)
- [ ] Redirect URIs added to credentials
- [ ] Client ID copied correctly

---

## 🧪 Test Scenarios

### Test 1: New Patient Account
1. Go to http://localhost:5173/signup
2. Click "Create your account with Google"
3. Use new Google account email
4. Select "Patient" role
5. Click "Create Account"
6. ✅ Should redirect to dashboard

### Test 2: Existing Account Login
1. Go to http://localhost:5173/login
2. Click "Continue with Google"
3. Use same email from Test 1
4. ✅ Should login directly to dashboard

### Test 3: Professional Account
1. Go to http://localhost:5173/signup
2. Click "Create your account with Google"
3. Use new email
4. Select "Doctor" or "Hospital"
5. Enter license number: "TEST123"
6. Enter license state: "CA"
7. Click "Create Account"
8. ✅ Should create account (pending admin verification)

---

## ⚠️ Troubleshooting

### Problem: "Google sign-in is unavailable"
**Solution:** 
- Check `VITE_GOOGLE_CLIENT_ID` is set in `.env.local`
- Restart frontend: `npm run dev`
- Browser may need hard refresh (Ctrl+Shift+R)

### Problem: "Invalid Google token" error
**Solution:**
- Ensure `GOOGLE_CLIENT_ID` matches on frontend AND backend
- Check Client ID is exactly correct (copy/paste again)
- Verify both servers restarted after updating `.env`

### Problem: "Google Auth is not configured on the server"
**Solution:**
- Backend `.env` missing `GOOGLE_CLIENT_ID`
- Add it and restart backend
- Check backend logs: should show config loaded

### Problem: Redirect URI mismatch
**Solution:**
- Add http://localhost:5173 to Authorized Redirect URIs
- Must exactly match (check for typos)
- Credentials panel > Edit OAuth client > Add URI

### Problem: Can't see Google button
**Solution:**
- Run: `npm install` (ensure @react-oauth/google installed)
- Check browser console for errors (F12)
- Try incognito/private window
- Clear browser cache

### Problem: Form submits but account doesn't create
**Solution:**
- Check backend logs for errors
- Ensure professional roles have license number filled
- Check if email already exists in database
- Try different email address

---

## 📚 Documentation Files

Created comprehensive guides:
1. **[GOOGLE_SIGNIN_INTEGRATION.md](GOOGLE_SIGNIN_INTEGRATION.md)** - Complete setup guide
2. **[GOOGLE_SIGNIN_UI_REFERENCE.md](GOOGLE_SIGNIN_UI_REFERENCE.md)** - UI flows and mockups
3. **[GOOGLE_SIGNIN_IMPLEMENTATION.md](GOOGLE_SIGNIN_IMPLEMENTATION.md)** - Code reference
4. **[docs/GOOGLE_OAUTH_SETUP.md](docs/GOOGLE_OAUTH_SETUP.md)** - Original setup guide

---

## 🎉 Success Indicators

After completing steps 1-5, you should see:
- ✅ Google button on login page
- ✅ Google button on signup page
- ✅ Smooth Google authentication
- ✅ Automatic redirect to dashboard
- ✅ New accounts show in database

---

## 📞 Need Help?

Check:
1. `.env` files are correctly filled
2. Both servers are running
3. Google Cloud Console has correct redirect URIs
4. Browser console (F12) for JavaScript errors
5. Server logs (terminal) for API errors

Still stuck? Check the full documentation files above.

---

**Status:** ✅ All code integrated. Only need Google Client ID to activate!
