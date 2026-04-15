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

# Generate demo resume PDFs before seeding
import generate_demo_resumes  # noqa: F401

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
        {"name": "Software Engineer Resume", "category": "tech", "file_path": "app/uploads/demo_swe_resume.pdf"},
        {"name": "Full Stack Developer Resume", "category": "tech", "file_path": "app/uploads/demo_fullstack_resume.pdf"},
        {"name": "General Resume", "category": "general", "file_path": "app/uploads/demo_general_resume.pdf"},
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
            "job_description": "Build and maintain high-performance user-facing features for Google Search using React, TypeScript, and JavaScript. Design reusable UI components, optimize web performance, and collaborate with backend engineers on REST API integrations. Experience with CSS, HTML5, and responsive design required. Familiarity with CI/CD pipelines and Git workflows expected.",
            "notes": "Completed recruiter screen. Technical round scheduled.",
            "resume": resumes[0],
        },
        {
            "company": "Stripe",
            "role": "Full Stack Developer",
            "location": "Remote",
            "status": "applied",
            "date_applied": date(2026, 3, 10),
            "job_description": "Work on Stripe's payment infrastructure using Node.js, React, and PostgreSQL. Build full-stack features for merchant dashboards, implement REST APIs, and integrate third-party payment services. Strong knowledge of JavaScript, TypeScript, Docker, and AWS required. Experience with Agile/Scrum and CI/CD pipelines a plus.",
            "notes": "Submitted through careers page.",
            "resume": resumes[1],
        },
        {
            "company": "Amazon",
            "role": "Software Engineer II",
            "location": "Seattle, WA",
            "status": "rejected",
            "date_applied": date(2026, 1, 15),
            "job_description": "Design and build scalable backend microservices for AWS using Java, Python, and Spring Boot. Work with distributed systems, optimize SQL and NoSQL databases, and deploy services using Docker and Kubernetes on AWS EC2 and Lambda. Strong understanding of algorithms, data structures, and system design required.",
            "notes": "Rejected after online assessment.",
            "resume": resumes[2],
        },
        {
            "company": "Meta",
            "role": "React Engineer",
            "location": "Menlo Park, CA",
            "status": "offered",
            "date_applied": date(2026, 1, 28),
            "job_description": "Build high-quality React components for Facebook and Instagram used by billions of users. Work with JavaScript, TypeScript, GraphQL, and REST APIs. Optimize rendering performance, write unit and integration tests with Jest, and collaborate closely with product designers. Experience with React Native is a bonus.",
            "notes": "Received offer — negotiating salary.",
            "resume": resumes[0],
        },
        {
            "company": "Microsoft",
            "role": "Backend Engineer",
            "location": "Redmond, WA",
            "status": "applied",
            "date_applied": date(2026, 3, 1),
            "job_description": "Develop cloud-native backend services for Microsoft Azure using Python, Java, and C#. Design RESTful APIs, work with distributed databases like PostgreSQL and MongoDB, and deploy using Docker and Kubernetes. Proficiency in CI/CD, Git, and Agile development expected. Azure certification is a plus.",
            "notes": "Applied via LinkedIn.",
            "resume": resumes[1],
        },
        {
            "company": "Airbnb",
            "role": "Software Engineer",
            "location": "San Francisco, CA",
            "status": "screening",
            "date_applied": date(2026, 2, 5),
            "job_description": "Build full-stack features for Airbnb's host and guest platform using React, Ruby on Rails, and Python. Work on REST APIs, optimize PostgreSQL queries, and deploy on AWS. Experience with JavaScript, TypeScript, Docker, and agile workflows required. Strong problem-solving skills and ability to work in a fast-paced environment.",
            "notes": "Phone screen scheduled for next week.",
            "resume": resumes[0],
        },
        {
            "company": "Spotify",
            "role": "Python Backend Developer",
            "location": "Remote",
            "status": "applied",
            "date_applied": date(2026, 3, 15),
            "job_description": "Build and maintain backend services for Spotify's data platform using Python, FastAPI, and Apache Kafka. Work with large-scale data pipelines, PostgreSQL, and cloud infrastructure on Google Cloud Platform. Experience with Docker, Kubernetes, and machine learning pipelines is a plus. Strong Python and SQL skills required.",
            "notes": "Referred by a friend at Spotify.",
            "resume": resumes[2],
        },
        {
            "company": "Netflix",
            "role": "Senior Software Engineer",
            "location": "Los Gatos, CA",
            "status": "rejected",
            "date_applied": date(2025, 12, 10),
            "job_description": "Design and build streaming infrastructure for Netflix using Java, Python, and Apache Kafka. Work on distributed systems at massive scale, optimize microservices deployed on AWS, and collaborate with data engineering teams. Experience with Docker, Kubernetes, PostgreSQL, and system design at scale required.",
            "notes": "Rejected after first interview round.",
            "resume": resumes[1],
        },
        {
            "company": "Salesforce",
            "role": "Full Stack Engineer",
            "location": "San Francisco, CA",
            "status": "applied",
            "date_applied": date(2026, 3, 18),
            "job_description": "Build CRM features for the Salesforce platform using JavaScript, React, Node.js, and Java. Design REST and GraphQL APIs, work with PostgreSQL databases, and deploy on AWS using CI/CD pipelines. Experience with Agile development, Git, Docker, and Salesforce APIs preferred.",
            "notes": "Applied through company website.",
            "resume": resumes[0],
        },
        {
            "company": "LinkedIn",
            "role": "Software Engineer — Platform",
            "location": "Sunnyvale, CA",
            "status": "accepted",
            "date_applied": date(2026, 1, 5),
            "job_description": "Build and scale LinkedIn's professional network platform using Java, Python, and React. Design distributed systems, work with REST APIs and GraphQL, and optimize PostgreSQL and Redis databases. Experience with Docker, Kubernetes, AWS, and CI/CD pipelines expected. Strong knowledge of algorithms and system design required.",
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
