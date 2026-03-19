from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import FRONTEND_ORIGIN
from app.database import Base, engine
from app.routers import health, applications

# Create all tables
import app.models  # noqa: F401
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Job Tracker API", version="0.1.0")

# CORS middleware (optional, only needed if frontend calls backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN],  # or ["http://localhost:5173"] if frontend exists
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router)
app.include_router(applications.router)