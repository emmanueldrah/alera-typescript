# Vercel Deployment Setup for ALERA

To ensure the ALERA backend functions correctly on Vercel, you need to configure the following Environment Variables in your Vercel Project Settings.

## Required Environment Variables

| Variable | Description | Recommended Value |
| :--- | :--- | :--- |
| `ENVIRONMENT` | Deployment environment | `production` |
| `SECRET_KEY` | JWT signing key | A long, random string (e.g., `openssl rand -hex 32`) |
| `DATABASE_URL` | Database connection string | For production, use a PostgreSQL URL (Supabase/Neon). If using SQLite, it will default to `/tmp/alera.db` (ephemeral). |
| `CORS_ORIGINS` | Allowed frontend origins | `["https://your-app.vercel.app"]` |
| `VERCEL` | Vercel environment flag | `1` |

## Database Configuration (IMPORTANT)

> [!CAUTION]
> **SQLite on Vercel is Ephemeral.** Any data saved (like new users) will be deleted whenever the Vercel function instance is recycled. 

For a persistent healthcare application, please use a managed PostgreSQL database.

1.  Create a database on **Supabase** or **Neon**.
2.  Copy your connection string.
3.  Add it as `DATABASE_URL` in Vercel.

## Troubleshooting

If you still see 500 errors:
1.  Check the **Vercel Logs** in your dashboard.
2.  Verify that `api/index.py` is correctly identified as the entry point in `vercel.json`.
3.  Ensure your `requirements.txt` includes all necessary dependencies.
