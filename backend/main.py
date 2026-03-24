from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import FRONTEND_ORIGIN
from app.database import Base, engine
from app.routers import health, applications, dashboard, resumes

# Create all tables
import app.models  # noqa: F401
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Job Tracker API", version="0.1.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# All routes are under /api prefix so the frontend can call http://localhost:8000/api/...
app.include_router(health.router, prefix="/api")
app.include_router(applications.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(resumes.router, prefix="/api")
