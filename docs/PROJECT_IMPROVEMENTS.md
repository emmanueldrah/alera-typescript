# Project Improvements

## Highest Impact

1. Move expensive synchronization and notifications out of request handlers.
Why it matters:
This improves both scalability and deployment reliability. Serverless requests should stay fast and deterministic; background work should not run inline with user actions.

2. Finish extracting business logic from route handlers and large React contexts.
Why it matters:
The current app still mixes HTTP, domain rules, and persistence in many backend routes, and `AppDataContext` still acts as a broad frontend orchestrator. Cleaner boundaries make changes safer and testing easier.

3. Standardize pagination and query limits everywhere.
Why it matters:
This is one of the simplest ways to improve performance, reduce bandwidth, and avoid production regressions as data grows.

4. Replace in-memory infrastructure with shared production services where needed.
Why it matters:
Rate limiting, caching, and job execution should not depend on a single app process if the app will scale across multiple instances.

5. Add a real production data workflow.
Why it matters:
Schema evolution, seed behavior, retention tasks, and deployment checks should be predictable and automated rather than relying on runtime patching and manual steps.

## Medium Impact

6. Break frontend data loading into route-level feature hooks.
Why it matters:
Users should not pay the cost of labs, imaging, billing, referrals, and messaging data just to load one dashboard screen.

7. Expand observability.
Why it matters:
Production readiness is not only “it deploys”; it also means errors, latency, and health signals are visible and actionable.

8. Normalize API response shapes.
Why it matters:
A consistent `{ total, items }` or resource envelope approach simplifies pagination, caching, and frontend reuse.

9. Add stronger deployment automation.
Why it matters:
A predictable CI path for linting, backend tests, frontend tests, and production builds reduces release risk.

10. Reduce repo-local operational artifacts and legacy duplication.
Why it matters:
There are still signs of historic/local-only workflows in docs and scripts. Trimming that noise improves maintainability.

## Already Improved In This Pass

- frontend env handling is now centralized
- backend env parsing is more deployment-friendly
- production env templates no longer suggest SQLite for Vercel
- Vite build behavior is more configurable for production
- deployment review and environment guidance are now documented
