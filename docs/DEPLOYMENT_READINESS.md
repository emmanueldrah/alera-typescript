# Deployment Readiness Review

## Highest Impact Improvements

1. Replace request-time synchronization and other heavy read-path work with background jobs.
Why it matters:
This is the biggest reliability risk under real traffic. Reads should stay cheap on Vercel/serverless, and expensive fan-out work belongs in async workers or scheduled jobs.

2. Finish pagination and bounded responses across all list endpoints.
Why it matters:
Unbounded lists are the fastest way to turn moderate data growth into slow pages, high memory use, and oversized serverless responses.

3. Move rate limiting and caching to shared infrastructure.
Why it matters:
The current in-memory limiter and no-cache approach are fine in a single process, but they do not scale cleanly across multiple Vercel instances.

4. Split frontend bootstrap data loading by feature.
Why it matters:
The current dashboard boot path still loads too many datasets eagerly. Route-level data loading will reduce time-to-interactive and unnecessary API pressure.

5. Introduce real database migrations and deployment checks.
Why it matters:
`backend/database.py` still contains schema patching behavior that should move to controlled migrations. Production deploys should be repeatable and auditable.

## Production Changes Applied

- Centralized frontend env parsing in `src/config/env.ts`
- Frontend API/socket config now reads from one validated source
- Vite production build now supports env-driven sourcemaps and console dropping
- Backend settings now support `.env`, `.env.local`, and `backend/.env`
- Backend `CORS_ORIGINS` now accepts JSON arrays or comma-separated strings
- Production env templates now require a persistent database and explicit frontend origin
- Added `npm run verify:deployment`

## Recommended Vercel Environment Variables

Backend:

- `ENVIRONMENT=production`
- `DATABASE_URL=postgresql://...`
- `SECRET_KEY=...`
- `ENCRYPTION_KEY=...`
- `FRONTEND_URL=https://your-domain.vercel.app`
- `CORS_ORIGINS=https://your-domain.vercel.app`
- `CORS_ORIGIN_REGEX=https://.*\.vercel\.app`
- `COOKIE_SECURE=true`
- `EXPOSE_API_DOCS=false`

Frontend:

- `VITE_APP_ENV=production`
- `VITE_API_URL=/api`
- `VITE_API_TIMEOUT=10000`
- `VITE_SOURCEMAP=false`
- `VITE_DROP_CONSOLE=true`
- `VITE_ENABLE_ERROR_REPORTING=true`
- `VITE_ENABLE_ANALYTICS=false`

## Vercel Hosting Notes

- The current repo already includes a Vercel Python entrypoint at `api/index.py`
- Static frontend assets are built to `dist/`
- API requests should stay same-origin through `/api`
- Production must use a managed persistent database, not SQLite
- If background jobs are introduced later, they should be hosted outside the request path
