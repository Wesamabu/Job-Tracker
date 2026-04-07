"""
Seed script — populates the database with a realistic fake user for demo purposes.

Run from the backend/ directory:
    python seed.py

This will:
1. Delete the existing app.db
2. Recreate all tables
3. Insert a demo user, 3 resumes, and 10 job applications
"""

import os
import sys
from datetime import date, datetime

# Make sure app/ is importable
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Delete old database so we start clean
DB_PATH = os.path.join(os.path.dirname(__file__), "app.db")
if os.path.exists(DB_PATH):
    os.remove(DB_PATH)
    print(f"Deleted old database: {DB_PATH}")

from app.database import Base, engine, SessionLocal
from app.models import User, Resume, Application

from app.auth.utils import hash_password

# Recreate all tables
Base.metadata.create_all(bind=engine)
print("Created database tables.")

db = SessionLocal()

try:
    # ── 1. Create demo user ──────────────────────────────────────────────────
    user = User(
        first_name="John",
        last_name="Smith",
        email="john.smith@gmail.com",
        hashed_password=hash_password("password123#"),
    )
    db.add(user)
    db.flush()
    print(f"Created user: {user.first_name} {user.last_name} (id={user.id})")

    # ── 2. Create resumes ────────────────────────────────────────────────────
    resumes_data = [
        {"name": "Software Engineer Resume", "category": "tech", "file_path": "uploads/demo_swe_resume.pdf"},
        {"name": "Full Stack Developer Resume", "category": "tech", "file_path": "uploads/demo_fullstack_resume.pdf"},
        {"name": "General Resume", "category": "general", "file_path": "uploads/demo_general_resume.pdf"},
    ]

    resumes = []
    for r in resumes_data:
        resume = Resume(user_id=user.id, name=r["name"], category=r["category"], file_path=r["file_path"])
        db.add(resume)
        resumes.append(resume)

    db.flush()
    print(f"Created {len(resumes)} resumes.")

    # ── 3. Create applications ───────────────────────────────────────────────
    applications_data = [
        {
            "company": "Google",
            "role": "Frontend Engineer",
            "location": "Mountain View, CA",
            "status": "interviewing",
            "date_applied": date(2026, 2, 20),
            "job_description": "Build user-facing features for Google Search.",
            "notes": "Completed recruiter screen. Technical round scheduled.",
            "resume": resumes[0],
        },
        {
            "company": "Stripe",
            "role": "Full Stack Developer",
            "location": "Remote",
            "status": "applied",
            "date_applied": date(2026, 3, 10),
            "job_description": "Work on Stripe's payment infrastructure.",
            "notes": "Submitted through careers page.",
            "resume": resumes[1],
        },
        {
            "company": "Amazon",
            "role": "Software Engineer II",
            "location": "Seattle, WA",
            "status": "rejected",
            "date_applied": date(2026, 1, 15),
            "job_description": "Build scalable backend services for AWS.",
            "notes": "Rejected after online assessment.",
            "resume": resumes[2],
        },
        {
            "company": "Meta",
            "role": "React Engineer",
            "location": "Menlo Park, CA",
            "status": "offered",
            "date_applied": date(2026, 1, 28),
            "job_description": "Build React components for Facebook and Instagram.",
            "notes": "Received offer — negotiating salary.",
            "resume": resumes[0],
        },
        {
            "company": "Microsoft",
            "role": "Backend Engineer",
            "location": "Redmond, WA",
            "status": "applied",
            "date_applied": date(2026, 3, 1),
            "job_description": "Build services for Microsoft Azure.",
            "notes": "Applied via LinkedIn.",
            "resume": resumes[1],
        },
        {
            "company": "Airbnb",
            "role": "Software Engineer",
            "location": "San Francisco, CA",
            "status": "screening",
            "date_applied": date(2026, 2, 5),
            "job_description": "Build features for Airbnb's host platform.",
            "notes": "Phone screen scheduled for next week.",
            "resume": resumes[0],
        },
        {
            "company": "Spotify",
            "role": "Python Backend Developer",
            "location": "Remote",
            "status": "applied",
            "date_applied": date(2026, 3, 15),
            "job_description": "Build backend services for Spotify's data platform.",
            "notes": "Referred by a friend at Spotify.",
            "resume": resumes[2],
        },
        {
            "company": "Netflix",
            "role": "Senior Software Engineer",
            "location": "Los Gatos, CA",
            "status": "rejected",
            "date_applied": date(2025, 12, 10),
            "job_description": "Build streaming infrastructure for Netflix.",
            "notes": "Rejected after first interview round.",
            "resume": resumes[1],
        },
        {
            "company": "Salesforce",
            "role": "Full Stack Engineer",
            "location": "San Francisco, CA",
            "status": "applied",
            "date_applied": date(2026, 3, 18),
            "job_description": "Build CRM features on Salesforce platform.",
            "notes": "Applied through company website.",
            "resume": resumes[0],
        },
        {
            "company": "LinkedIn",
            "role": "Software Engineer — Platform",
            "location": "Sunnyvale, CA",
            "status": "accepted",
            "date_applied": date(2026, 1, 5),
            "job_description": "Build LinkedIn's professional network platform.",
            "notes": "Accepted offer! Start date TBD.",
            "resume": resumes[0],
        },
    ]

    for a in applications_data:
        app = Application(
            user_id=user.id,
            resume_id=a["resume"].id,
            company=a["company"],
            role=a["role"],
            location=a["location"],
            status=a["status"],
            date_applied=a["date_applied"],
            job_description=a["job_description"],
            notes=a["notes"],
        )
        db.add(app)

    db.commit()
    print(f"Created {len(applications_data)} applications.")
    print("\nSeed complete! Start the backend with: uvicorn main:app --reload")

except Exception as e:
    db.rollback()
    print(f"Error: {e}")
    raise
finally:
    db.close()
