from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import FRONTEND_ORIGIN
from app.database import Base, engine
from app.routers import health

# ---------------------------------------------------------------------------
# Create all DB tables on startup (no-op if tables already exist)
# ---------------------------------------------------------------------------
import app.models  # noqa: F401 — ensures models are registered with Base
Base.metadata.create_all(bind=engine)

# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Job Tracker API",
    version="0.1.0",
    root_path="/api"
)

# ---------------------------------------------------------------------------
# CORS
# Allow the Vite dev server to call this API during local development.
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(health.router)

# Future routers will be added here as features are implemented:
# app.include_router(applications.router, prefix="/applications", tags=["applications"])
# app.include_router(resumes.router,      prefix="/resumes",      tags=["resumes"])
# app.include_router(dashboard.router,    prefix="/dashboard",    tags=["dashboard"])