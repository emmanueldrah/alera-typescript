# Scalability Review for 10,000 Users

## Executive Summary

The current codebase can serve small to moderate traffic, but it has several bottlenecks that would become expensive at 10,000 users:

- some endpoints still return unbounded or very large result sets
- analytics endpoints were loading entire datasets into memory
- synchronized-history reads trigger heavy backfill work on demand
- the frontend eagerly loads many feature datasets into one global context on login
- repeated user-list fetches and broad context invalidation increase API and render pressure

This pass includes a few safe improvements:

- aggregate analytics queries now run in SQL instead of Python
- accessible user lists are now paginated and capped
- medical-record backfill no longer performs repeated per-record user lookups
- the frontend initial bootstrap now requests smaller pages for eager datasets

## Bottlenecks

### Database Queries

High-risk paths:

- `backend/app/routes/users.py`
  `GET /api/users/accessible` previously returned `.all()` for several role branches.
- `backend/app/routes/admin.py`
  analytics endpoints loaded full matching rows and counted in Python.
- `backend/app/services/medical_record_sync.py`
  `backfill_patient_canonical_records()` fetched related users one record at a time.
- `backend/app/routes/records.py`
  `GET /api/records/synchronized-history/{patient_id}` triggers canonical backfill on read, then loads the full canonical history for that patient.
- `backend/app/routes/allergies.py`, `organizations.py`, `patient_permissions.py`, parts of `admin.py`
  still contain unbounded `.all()` patterns.

Why this matters at 10,000 users:

- full-table or full-patient-history scans increase DB latency and memory use
- N+1 lookups multiply query count under concurrency
- on-demand history backfill makes read traffic do write-heavy work

### API Calls

Hot paths:

- `src/contexts/AppDataContext.tsx`
  on bootstrap it issues many parallel requests, including appointments, prescriptions, allergies, labs, imaging, referrals, ambulance data, and many structured-record types.
- `src/contexts/AuthContext.tsx`
  refetches accessible users in several lifecycle points after auth changes and visibility events.

Why this matters:

- each login or refresh fans out into many requests
- global refreshes reload unrelated features together
- high request multiplicity increases backend contention and frontend TTFB

### Frontend State Management

Main issue:

- `src/contexts/AppDataContext.tsx` acts as a single high-cardinality store for many unrelated domains.

Why this matters:

- any refresh can invalidate a large object graph
- a single provider update can trigger broad rerenders
- initial app load fetches far more data than one screen usually needs

## Improvements Applied

### 1. SQL Aggregation Instead of Python Scans

Updated:

- `backend/app/routes/admin.py`

Changes:

- `GET /api/admin/analytics/appointments` now uses `GROUP BY` and `COUNT`
- `GET /api/admin/analytics/users` now uses `GROUP BY` and `COUNT`

Impact:

- avoids materializing large result sets in Python
- reduces API latency and backend memory use

### 2. Pagination for Accessible Users

Updated:

- `backend/app/routes/users.py`
- `src/lib/apiService.ts`
- `src/contexts/AuthContext.tsx`

Changes:

- `GET /api/users/accessible` now accepts `skip` and `limit`
- backend caps the limit at 200
- frontend now requests the first 100 users instead of fetching an unbounded set

Impact:

- protects one of the most frequently reused auth-side queries
- reduces payload size and client memory churn

### 3. Removed N+1 User Lookups in Medical Record Backfill

Updated:

- `backend/app/services/medical_record_sync.py`

Changes:

- related user/provider IDs are collected first
- users are loaded once into a map
- record backfill reuses that map rather than querying per record

Impact:

- significantly lowers query count for patient history backfill
- makes synchronized history reads less expensive

### 4. Smaller Frontend Bootstrap Payloads

Updated:

- `src/contexts/AppDataContext.tsx`

Changes:

- initial eager collection fetches now request 100 items instead of 200
- structured-record eager fetches now request 100 instead of 500

Impact:

- lowers startup request cost
- reduces initial render payload size
- improves perceived responsiveness

## Recommended Next Steps

### Backend

1. Move synchronized-history backfill out of request/response flow.
   Best option: background job triggered on write events, not on read.

2. Add database indexes for the hottest filters.
   Priority examples:
   - appointments: `(patient_id, scheduled_time)`, `(provider_id, scheduled_time)`
   - notifications: `(user_id, created_at)`, `(user_id, is_read, is_archived)`
   - structured_records: `(record_type, created_at)`, `(patient_id, created_at)`
   - medical_records: `(patient_id, event_time)`, `(organization_id, event_time)`

3. Standardize paginated list responses.
   Several endpoints return raw lists while others return `{ total, items }`. Pick one shape and apply it consistently.

4. Add caching for read-heavy summaries.
   Good candidates:
   - unread notification counts
   - admin dashboard stats
   - organization directory
   - doctor/provider directory

5. Introduce a background job system.
   Good job candidates:
   - email and SMS sending
   - notification fan-out
   - medical record synchronization/backfill
   - analytics materialization
   - file post-processing

### Frontend

1. Break `AppDataContext` into feature-scoped hooks backed by React Query.
   Suggested first slices:
   - appointments
   - prescriptions
   - records
   - referrals

2. Lazy-load data per route instead of preloading the entire workspace.
   The dashboard shell should not fetch labs, billing, imaging, and ambulance data just to show one page.

3. Add infinite scrolling or paginated tables for high-volume views.
   Priority screens:
   - users
   - notifications
   - audit logs
   - records/timeline

4. Cache stable reference data client-side.
   Good candidates:
   - role metadata
   - provider directory
   - organizations
   - feature-access configuration

## Practical Scaling Outlook

With the current architecture, 10,000 registered users is feasible only if:

- concurrent active users stay modest
- list endpoints remain bounded
- synchronized-history traffic is limited

To comfortably support 10,000 users with growing clinical data, the next real milestone is:

- background jobs for side effects and synchronization
- repository/query optimization with indexes
- route-level lazy fetching on the frontend
- caching for summary endpoints and directories
