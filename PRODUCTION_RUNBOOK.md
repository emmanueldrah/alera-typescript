# ALERA Production Runbook

This runbook is the minimum path to a safe ALERA production deployment.

## 1. Required Production Configuration

Set these environment variables in your hosting platform before deployment:

| Variable | Required | Notes |
| --- | --- | --- |
| `ENVIRONMENT` | Yes | Must be `production` |
| `DATABASE_URL` | Yes | Use managed PostgreSQL, not SQLite |
| `SECRET_KEY` | Yes | Strong random value for JWT signing |
| `ENCRYPTION_KEY` | Yes | Strong random value for protected data |
| `FRONTEND_URL` | Yes | Public frontend origin, for example `https://alera.health` |
| `CORS_ORIGINS` | Yes | JSON array of allowed frontend origins |
| `TRUSTED_HOSTS` | Recommended | Comma-separated production hostnames |
| `EXPOSE_API_DOCS` | Recommended | Set to `false` in production unless docs must be public |

Optional provider integrations:

| Variable Group | Purpose |
| --- | --- |
| `RESEND_*`, `SENDGRID_*`, or SMTP settings | Transactional email |
| `TWILIO_*` | SMS notifications |
| `AGORA_*` | Telemedicine/video sessions |

## 2. Pre-Deploy Checklist

Run:

```bash
bash scripts/verify-deployment.sh
```

Expected outcome:

- Frontend tests pass
- Backend tests pass
- Type-check passes
- Production build succeeds

## 3. Deploy Steps

1. Configure production environment variables in Vercel.
2. Confirm the production database is reachable.
3. Deploy the current main branch.
4. Wait for the frontend build and Python API deployment to finish.

## 4. Post-Deploy Verification

Run:

```bash
bash test-health.sh https://your-production-domain
```

Expected results:

- `/api/health` returns `200`
- `/api/ready` returns `200`
- response payload reports healthy/ready status

Manual smoke checks:

1. Load the landing page.
2. Load login and signup pages.
3. Log in with a verified test account.
4. Open dashboard home.
5. Open one provider page and one patient page.
6. Verify an API-backed write flow such as notification read, consent creation, or appointment creation.

## 5. Rollback Triggers

Rollback immediately if any of the following occur:

- `/api/ready` returns `503`
- authentication fails for valid users
- production DB writes fail
- repeated 500s appear in Vercel logs
- dashboard routes fail to load required chunks

## 6. Operational Notes

- ALERA now splits frontend routes into separate chunks, so watch for chunk-load failures in browser logs after deploy.
- API responses include request IDs and security headers; use request IDs when tracing production issues.
- Default admin seeding is blocked in production unless explicit credentials are configured.

## 7. Recommended Follow-Up Integrations

- Add Sentry or equivalent frontend/backend error reporting.
- Add uptime monitoring for `/api/health` and `/api/ready`.
- Add managed database backups and restore testing.
- Add a real CI pipeline to run the same checks on every push.
