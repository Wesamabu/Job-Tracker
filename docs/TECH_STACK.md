# Job-Tracker Tech Stack

This document locks the tech stack so the team can work in parallel without debating tools.

---

## Frontend
- Framework: **React**
- Build tool: **Vite**
- Location: `/frontend`

### Frontend standards
- Use **camelCase** everywhere in frontend code and API usage.
- Use the API contract in `docs/API_CONTRACT.md` as the source of truth.
- API calls: use **fetch** (built-in) for simplicity.

---

## Backend
- Language: **Python**
- Framework: **FastAPI**
- Location: `/backend`

### Backend standards
- REST endpoints must follow `docs/API_CONTRACT.md`.
- Enable **CORS** so the React dev server can call the API.
- API responses use **camelCase** (even if the DB uses snake_case internally).

---

## Database
- DB: **SQLite**
- File-based DB stored in: `/backend/app.db` (or `/backend/data/app.db`)
- ORM/Models: **SQLAlchemy**

### Database standards
- Use SQLAlchemy models as the source of truth for schema.
-  map to **camelCase** in API.

> Note: We’re using SQLite because it’s easiest for class + local dev. If we ever switch to Postgres later, SQLAlchemy makes that transition easier.

---

## Local Development (high-level)

### Frontend
- Runs on: `http://localhost:5173` (default Vite)

### Backend
- Runs on: `http://localhost:8000` (recommended)

### Database
- Runs as a local file (SQLite), no server needed.

---

## Code Quality (recommended)
- Frontend formatting: Prettier (optional)
- Backend formatting: black + ruff (optional)
---

## Milestone 1 Scope Reminder
Milestone 1 focuses on:
- Dashboard + Applications (CRUD)
- Resume list + upload (basic)

Insights / vector analysis will be implemented after Milestone 1.
