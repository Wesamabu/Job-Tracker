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
- API responses use **camelCase** (even if the DB uses snake_case internally).

---

## Database
- DB: **PostgreSQL**
- Local dev recommended via **Docker Compose**
- Migrations: **Alembic**
- ORM/Models: **SQLModel** (built on SQLAlchemy, great with FastAPI)

---

## Local Development (high-level)

### Frontend
- Runs on: `http://localhost:5173` (default Vite)

### Backend
- Runs on: `http://localhost:8000` (recommended)

### Database
- Runs on: `localhost:5432` via Docker

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