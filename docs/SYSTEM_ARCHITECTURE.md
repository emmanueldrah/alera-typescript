# ALERA System Architecture

## Repository Shape

ALERA is a full-stack monorepo with three runtime-facing layers:

1. Frontend SPA
   `src/` contains a Vite + React + TypeScript single-page application.
2. Backend API
   `backend/` contains a FastAPI application with SQLAlchemy models and service utilities.
3. Deployment adapter
   `api/index.py` is a thin Vercel serverless entry point that imports the FastAPI app from `backend/main.py`.

## Runtime Architecture

### Frontend Layer

Main entry and composition:

- `src/main.tsx`
  mounts the React application.
- `src/App.tsx`
  wires the app shell, React Query, auth/app/notification/chat providers, and top-level routing.
- `src/pages/`
  contains route-level UI for landing pages, dashboards, and feature workspaces.
- `src/components/`
  contains shared UI and layout components.

Frontend state and API access:

- `src/contexts/AuthContext.tsx`
  owns authenticated user state and session bootstrap.
- `src/contexts/AppDataContext.tsx`
  acts as a broad feature state orchestrator for appointments, prescriptions, referrals, labs, imaging, billing, and more.
- `src/lib/apiClient.ts`
  owns Axios configuration, CSRF handling, cookie-based auth, and refresh retry behavior.
- `src/lib/apiService.ts`
  exposes typed frontend API calls and response contracts.

### Backend Layer

Main entry and composition:

- `backend/main.py`
  now acts only as the FastAPI entry point.
- `backend/app/bootstrap.py`
  now owns app factory concerns: middleware registration, router registration, health routes, startup state, and exception handling.
- `api/index.py`
  adapts the backend app to Vercel and performs serverless-safe initialization.

Backend delivery and domain-adjacent code:

- `backend/app/routes/`
  FastAPI routers. This is the HTTP delivery layer.
- `backend/app/schemas/`
  request and response DTOs for the API layer.
- `backend/app/models/`
  SQLAlchemy ORM models representing the persistence layer.
- `backend/app/services/`
  application services for email, file storage, external imaging, and medical-record synchronization.
- `backend/app/utils/`
  cross-cutting concerns such as auth, cookies, CSRF, access control, rate limiting, and websocket management.
- `backend/database.py`
  engine/session setup plus schema patching and initialization logic.
- `backend/config.py`
  environment-based configuration.

### Database Layer

Current database interaction pattern:

- SQLAlchemy ORM models live in `backend/app/models/`.
- Sessions come from `backend/database.py` via `get_db`.
- Route handlers frequently query and mutate models directly.
- `backend/database.py` also contains startup-time schema patch helpers for SQLite upgrades.

Persistence characteristics:

- Development defaults to SQLite via `DATABASE_URL=sqlite:///alera.db`.
- Production validation in `backend/config.py` requires a persistent non-SQLite database.
- The Vercel bridge still attempts best-effort `init_db()` on startup.

## Request and Data Flow

### Browser to API

1. React pages and contexts call methods in `src/lib/apiService.ts`.
2. `apiService` uses the shared Axios client from `src/lib/apiClient.ts`.
3. `apiClient` sends cookie-based requests to `/api/...`, automatically attaching the CSRF header when needed.
4. Vercel routes `/api/*` to `api/index.py`, which exposes the FastAPI app.
5. FastAPI routes in `backend/app/routes/` validate requests, enforce auth/role checks, and access the database through SQLAlchemy sessions.
6. ORM models are serialized back through Pydantic schemas and returned to the frontend.

### Database Interactions

Most database access happens directly inside route handlers:

- Authentication and user management:
  `backend/app/routes/auth.py`, `backend/app/routes/users.py`
- Clinical workflows:
  `appointments.py`, `prescriptions.py`, `allergies.py`, `lab_tests.py`, `imaging.py`, `referrals.py`
- Shared record synchronization:
  `backend/app/services/medical_record_sync.py`

This means the codebase currently mixes:

- transport concerns
- authorization concerns
- business rules
- persistence orchestration

inside the same modules.

## Current Layer Mapping

### Frontend

- Presentation:
  `src/components/`, `src/pages/`
- Application/UI orchestration:
  `src/contexts/`, `src/hooks/`
- Infrastructure:
  `src/lib/apiClient.ts`, websocket helpers, storage helpers
- Gaps:
  a lot of feature business logic is embedded in `AppDataContext.tsx` instead of feature-specific application services

### Backend

- Presentation/API:
  `backend/app/routes/`, `backend/app/schemas/`
- Infrastructure:
  `backend/database.py`, `backend/config.py`, `backend/app/services/file_service.py`, `email_service.py`, `sms_service.py`, `postdicom_service.py`
- Domain/persistence:
  `backend/app/models/`
- Gaps:
  route modules still contain business rules and repository-like queries directly

## Clean Architecture Gaps

The most important separations still missing are:

1. Routes depend directly on SQLAlchemy models and ad hoc queries.
2. `backend/database.py` mixes engine setup, migrations/patches, and initialization.
3. `AppDataContext.tsx` is acting as a god-object for many unrelated frontend use cases.
4. `apiService.ts` is a large service catalog rather than feature-scoped clients.
5. Route names and feature page mappings were duplicated until the new shared registry was introduced.

## Refactors Applied In This Pass

### Backend

- Introduced `backend/app/bootstrap.py` as a composition root for:
  - middleware
  - router registration
  - health/readiness routes
  - startup initialization
  - global exception handling
- Simplified `backend/main.py` so it only creates the app and runs Uvicorn when executed directly.

Why this helps:

- keeps the entry point thin
- creates a clearer application boundary
- makes future testing and app-factory reuse easier

### Frontend

- Introduced `src/app/featureRegistry.tsx` as the shared route registry for dashboard feature pages.
- Updated `src/App.tsx` and `src/pages/FeatureWrapper.tsx` to consume the shared registry.

Why this helps:

- removes duplicated route configuration
- centralizes route-to-page mapping
- reduces drift between navigation, access checks, and rendering

## Recommended Next Refactors

### Backend

1. Add feature-specific application services.
   Example: `app/use_cases/appointments/`, `app/use_cases/auth/`, `app/use_cases/referrals/`
2. Add repository modules so routes stop querying ORM models directly.
   Example: `app/repositories/user_repository.py`
3. Move schema patching out of `backend/database.py` into a real migration workflow.
   Alembic would be the cleanest next step.
4. Split auth/cookie/token concerns from auth HTTP handlers.
   `routes/auth.py` is a good candidate for service extraction first.

### Frontend

1. Break `AppDataContext.tsx` into feature modules.
   Good first slices:
   - appointments
   - prescriptions
   - records
   - referrals
2. Move backend-to-frontend mapping functions into dedicated mappers per feature.
3. Replace broad context-driven fetching with feature hooks layered on top of React Query.
4. Group API clients by bounded context instead of one large `apiService.ts`.

## Proposed Target Structure

### Backend

```text
backend/app/
  api/
    routes/
    schemas/
  application/
    auth/
    appointments/
    referrals/
  domain/
    models/
    services/
  infrastructure/
    db/
    repositories/
    notifications/
    files/
  bootstrap.py
```

### Frontend

```text
src/
  app/
    router/
    providers/
  features/
    auth/
      api.ts
      hooks.ts
      mappers.ts
      components/
    appointments/
    referrals/
    records/
  shared/
    ui/
    lib/
```

## Files Removed Safely

The safe cleanup set is generated/runtime output, not source:

- Python `__pycache__`
- pytest caches
- build output in `dist/`
- local virtual environments
- installed dependencies in `node_modules/`
- local logs
- duplicate local backend SQLite database

Tracked files that still deserve a follow-up review but were not architecture-critical include:

- `alera.db`
- `backend/test_stats.py`
- top-level deployment helper scripts and desktop launcher assets

Those may be useful locally, but they should be reviewed for whether they belong in source control.
