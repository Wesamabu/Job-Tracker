# Frontend ↔ Backend Integration Changes

every change made to connect the frontend and backend so that real data flows end-to-end.

---

## What Was Wrong Before

| Problem | Where |
|---|---|
| Backend had no `/api` prefix, frontend expected `/api/...` | `backend/main.py` |
| `Application` model used `company_name` but router/schema used `company` | `backend/app/models.py` |
| `Application` model had no `location`, `notes` fields | `backend/app/models.py` |
| `Application` model required `user_id` but router never set it → crash on create | `backend/app/routers/applications.py` |
| Schema field names didn't match frontend (`role` vs `jobTitle`, `date_applied` vs `appliedDate`) | `backend/app/schemas.py` |
| `GET /applications/all` didn't match frontend which called `GET /applications/` | `backend/app/routers/applications.py` |
| Missing `GET /applications/{id}`, `PUT /applications/{id}`, `DELETE /applications/{id}` | `backend/app/routers/applications.py` |
| Dashboard router filtered by `"responded"` and `"interview"` but real status values were different | `backend/app/routers/dashboard.py` |
| Dashboard stats returned wrong field names (`total_applications` vs `totalApplications`) | `backend/app/routers/dashboard.py` |
| Missing `GET /dashboard/activity` endpoint | `backend/app/routers/dashboard.py` |
| `Resume` model had no `category` field | `backend/app/models.py` |
| `dashboard.service.ts` imported `{ api }` which doesn't exist — only `apiClient` is exported | `frontend/src/features/dashboard/services/dashboard.service.ts` |
| `dashboard.service.ts` called `.data` on response but `apiClient` returns the data directly | `frontend/src/features/dashboard/services/dashboard.service.ts` |
| `DashboardPage` used hardcoded stats, fake setTimeout for loading | `frontend/src/features/dashboard/pages/DashboardPage/DashboardPage.tsx` |
| `ApplicationsPage` used hardcoded `initialApplications` array, never called API | `frontend/src/features/applications/pages/ApplicationsPage/ApplicationsPage.tsx` |
| `ResumesPage` used hardcoded `initialResumes` array, never called API | `frontend/src/features/resume/pages/ResumesPage/ResumesPage.tsx` |
| `NewApplicationModal` "Save" button only showed a toast, never called API | `frontend/src/shared/components/Modals/NewApplicationModal.tsx` |
| `NewResumeModal` "Save" button only showed a toast, never called API | `frontend/src/shared/components/Modals/NewResumeModal.tsx` |
| `apiClient` had no `postForm()` method for file uploads | `frontend/src/shared/lib/apiClient.ts` |

---

## Changes Made

### Backend

#### `backend/app/models.py`
- **`Application` model**: renamed `company_name` → `company`, changed `date_applied` from `DateTime` to `Date`, added `location` (String), added `notes` (Text)
- **`Resume` model**: added `category` (String, default `"general"`)

#### `backend/app/schemas.py`
- Complete rewrite to use camelCase field names that match the frontend:
  - `ApplicationCreate`: accepts `jobTitle`, `company`, `location`, `status`, `appliedDate`, `description`, `notes`, `resumeId`
  - `ApplicationUpdate`: same fields but all optional
  - `ApplicationResponse`: returns `id`, `jobTitle`, `company`, `location`, `status`, `appliedDate`, `description`, `notes`, `resumeUsed`
  - `StatusEnum`: updated to match frontend status values (`applied`, `screening`, `interviewing`, `offered`, `rejected`, `accepted`, `declined`)

#### `backend/app/routers/applications.py`
- Complete rewrite:
  - `GET /all` → `GET /` (matches what frontend calls)
  - `POST /` now accepts **JSON body** (not multipart form), sets `user_id=1` automatically
  - Added `GET /{id}` — fetch a single application
  - Added `PUT /{id}` — update any fields of an application
  - Added `DELETE /{id}` — delete an application
  - Added `_to_response()` helper that maps DB fields to camelCase for the frontend
  - All endpoints filter by `user_id == 1` (hardcoded until auth is implemented)

#### `backend/app/routers/dashboard.py`
- Fixed `get_dashboard_stats()`:
  - Returns correct camelCase keys: `totalApplications`, `active`, `interviews`, `offers`
  - Fixed status value comparisons to match real stored values
- Added `GET /activity` — returns the 10 most recent applications as an activity feed

#### `backend/app/routers/resumes.py`
- `_to_response()` now includes `category`, `fileFormat` (derived from file extension), `uploadDate`, and other fields to match the frontend `Resume` type
- `POST /resumes` now accepts `category` as a form field
- Added `.doc` to allowed file extensions

#### `backend/main.py`
- Added `prefix="/api"` to all `app.include_router()` calls
- Final routes: `/api/health`, `/api/applications`, `/api/dashboard`, `/api/resumes`

---

### Frontend

#### `frontend/src/shared/lib/apiClient.ts`
- Added `postForm(endpoint, formData)` method for file uploads (does not set `Content-Type` so browser sets multipart boundary automatically)
- Added handling for `204 No Content` responses (returns `undefined` instead of trying to parse empty body)

#### `frontend/src/features/dashboard/services/dashboard.service.ts`
- Fixed import: `{ api }` → `apiClient` (default import)
- Removed incorrect `.data` accessor — `apiClient.get()` returns the parsed data directly

#### `frontend/src/features/dashboard/pages/DashboardPage/DashboardPage.tsx`
- Removed all hardcoded stats and fake `setTimeout` loading
- Added `useEffect` that calls `dashboardService.getStats()` on mount and on `refreshKey` change
- Stats cards now show real data from the API
- Bar chart now shows real application funnel data
- "New Application" modal now triggers a stats refresh after save

#### `frontend/src/features/applications/pages/ApplicationsPage/ApplicationsPage.tsx`
- Removed `initialApplications` hardcoded data
- Added `fetchApplications()` that calls `applicationsService.getAll()` on mount
- `handleStatusChange()` now calls `applicationsService.update()` and reverts on error
- `NewApplicationModal` receives `onApplicationAdded={fetchApplications}` to refresh list after save
- Hardcoded `resumes` array removed from props passed to modal

#### `frontend/src/features/resume/pages/ResumesPage/ResumesPage.tsx`
- Removed `initialResumes` hardcoded data
- Added `fetchResumes()` that calls `GET /api/resumes` on mount
- `NewResumeModal` receives `onResumeAdded={fetchResumes}` to refresh list after upload

#### `frontend/src/features/applications/services/applications.service.ts`
- Changed `getAll()` endpoint from `/applications` → `/applications/` (trailing slash to match FastAPI)

#### `frontend/src/shared/components/Modals/NewApplicationModal.tsx`
- Removed fake toast-only save behavior
- Added `useRef` for all input fields (jobTitle, company, location, date, notes, description)
- `handleSave()` now validates required fields and calls `applicationsService.create()`
- Shows loading spinner while saving, shows error toast on failure
- Calls `onApplicationAdded()` callback after successful save
- Removed `resumes` prop (resume picker currently shows empty list until resume API integration is wired to the dropdown)

#### `frontend/src/shared/components/Modals/NewResumeModal.tsx`
- Removed fake toast-only save behavior
- Added `useRef` for title and file inputs
- `handleSave()` validates required fields, builds a `FormData`, and calls `apiClient.postForm('/resumes', formData)`
- Shows loading spinner while uploading
- Calls `onResumeAdded()` callback after successful upload

---

## New File

#### `backend/seed.py`
- Run with `python seed.py` from the `backend/` directory
- Deletes the old `app.db`, recreates all tables, inserts:
  - 1 demo user (id=1)
  - 3 resumes (Software Engineer, Full Stack Developer, General)
  - 10 job applications across Google, Stripe, Amazon, Meta, Microsoft, Airbnb, Spotify, Netflix, Salesforce, LinkedIn
  - Mix of statuses: `applied`, `screening`, `interviewing`, `offered`, `rejected`, `accepted`

---

## How to Run Everything

### 1. Seed the database
```bash
cd backend
python seed.py
```

### 2. Start the backend
```bash
cd backend
uvicorn main:app --reload
# Runs at http://localhost:8000
# API docs at http://localhost:8000/docs
```

### 3. Start the frontend
```bash
cd frontend
npm run dev
# Runs at http://localhost:5173
```

---

## Important Notes for the Team

- **No authentication yet**: all endpoints use `user_id = 1` hardcoded. The seed script creates this user. Do not change this until authentication is implemented.
- **If you change models**: delete `backend/app.db` and re-run `python seed.py` to recreate the DB with fresh tables.
- **Status values**: use lowercase consistently (`applied`, `screening`, `interviewing`, `offered`, `rejected`, `accepted`, `declined`). The frontend and backend are now aligned on these.
- **Analytics and Insights pages**: not yet wired to the API — those pages still show placeholder text. They are next.
