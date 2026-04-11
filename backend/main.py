from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import FRONTEND_ORIGIN
from app.database import Base, engine
from app.routers import health, applications, dashboard, resumes, jobs, auth, insights

# Create all tables
import app.models  # noqa: F401
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Job Tracker API", version="0.1.0")

# CORS middleware
#added "http://localhost:8000" so Swagger UI can talk to the API successfully
origins = [
    FRONTEND_ORIGIN,
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# All routes are under /api prefix for consistency
app.include_router(health.router, prefix="/api")
app.include_router(applications.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(resumes.router, prefix="/api")
app.include_router(jobs.router, prefix="/api") # Added prefix here
app.include_router(auth.router, prefix="/api")
app.include_router(insights.router, prefix="/api")