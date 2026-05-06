# Social Sign-In Quick Setup

## Problem
Social sign-in features are not showing on the login/signup pages.

## Solution
You need a Google OAuth 2.0 Client ID. This takes **5 minutes** to set up.

## Quick Start (Copy-Paste)

### 1. Get Client ID (2 minutes)
1. Go to https://console.cloud.google.com/
2. Create new project or select existing
3. Enable "Google+ API" (search in library)
4. Go to Credentials → **+ CREATE CREDENTIALS** → **OAuth client ID**
5. Choose **Web application**
6. Add these redirect URIs:
   - `http://localhost:5173`
   - `http://localhost:5174`
7. **Copy the Client ID** (looks like: `123456789-abcd1234.apps.googleusercontent.com`)

### 2. Update Frontend (.env.local)
```bash
VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE
```

### 3. Update Backend (backend/.env)
```bash
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE
```
(Use the SAME Client ID as frontend)

### 4. Restart Servers
- Restart frontend: `npm run dev`
- Restart backend: `cd backend && python -m uvicorn app.main:app --reload --port 8000`

### 5. Test
- Go to http://localhost:5173/login
- Click **"Continue with Google"** button
- Should work! ✓

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Button still doesn't show | Make sure `VITE_GOOGLE_CLIENT_ID` is set and servers restarted |
| "Invalid token" error | Verify frontend and backend have the **same** Client ID |
| Redirect fails | Check redirect URI includes exact port (e.g., `:5173`) |

## Full Details
See [docs/GOOGLE_OAUTH_SETUP.md](../docs/GOOGLE_OAUTH_SETUP.md) for complete setup guide.

---

**That's it!** Social sign-in should now work. 🎉
