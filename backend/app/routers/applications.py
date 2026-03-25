from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional

from app.database import get_db
from app import models, schemas

# Hardcoded user_id=1 until authentication is implemented
USER_ID = 1

router = APIRouter(prefix="/applications", tags=["Applications"])


def _to_response(app: models.Application) -> dict:
    """Map an Application ORM object to the camelCase shape the frontend expects."""
    resume_name = app.resume.name if app.resume else None
    return {
        "id": app.id,
        "jobTitle": app.role,
        "company": app.company,
        "location": app.location,
        "status": app.status,
        "appliedDate": app.date_applied,
        "description": app.job_description,
        "notes": app.notes,
        "resumeUsed": resume_name,
    }


# ── GET /applications ────────────────────────────────────────────────────────

@router.get("/", response_model=list[schemas.ApplicationResponse])
def get_all_applications(db: Session = Depends(get_db)):
    """Return all applications for the current user."""
    apps = db.query(models.Application).filter(
        models.Application.user_id == USER_ID
    ).order_by(models.Application.created_at.desc()).all()
    return [_to_response(a) for a in apps]


# ── GET /applications/{id} ───────────────────────────────────────────────────

@router.get("/{app_id}", response_model=schemas.ApplicationResponse)
def get_application(app_id: int, db: Session = Depends(get_db)):
    """Return a single application by ID."""
    app = db.query(models.Application).filter(
        models.Application.id == app_id,
        models.Application.user_id == USER_ID,
    ).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    return _to_response(app)


# ── POST /applications ───────────────────────────────────────────────────────

@router.post("/", response_model=schemas.ApplicationResponse, status_code=201)
def create_application(data: schemas.ApplicationCreate, db: Session = Depends(get_db)):
    """Create a new application."""
    new_app = models.Application(
        user_id=USER_ID,
        company=data.company,
        role=data.jobTitle,
        location=data.location,
        status=data.status,
        date_applied=data.appliedDate,
        job_description=data.description,
        notes=data.notes,
        resume_id=data.resumeId,
    )
    db.add(new_app)
    db.commit()
    db.refresh(new_app)
    return _to_response(new_app)


# ── PUT /applications/{id} ───────────────────────────────────────────────────

@router.put("/{app_id}", response_model=schemas.ApplicationResponse)
def update_application(app_id: int, data: schemas.ApplicationUpdate, db: Session = Depends(get_db)):
    """Update an existing application."""
    app = db.query(models.Application).filter(
        models.Application.id == app_id,
        models.Application.user_id == USER_ID,
    ).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    if data.jobTitle is not None:
        app.role = data.jobTitle
    if data.company is not None:
        app.company = data.company
    if data.location is not None:
        app.location = data.location
    if data.status is not None:
        app.status = data.status
    if data.appliedDate is not None:
        app.date_applied = data.appliedDate
    if data.description is not None:
        app.job_description = data.description
    if data.notes is not None:
        app.notes = data.notes
    if data.resumeId is not None:
        app.resume_id = data.resumeId

    db.commit()
    db.refresh(app)
    return _to_response(app)


# ── DELETE /applications/{id} ────────────────────────────────────────────────

@router.delete("/{app_id}", status_code=204)
def delete_application(app_id: int, db: Session = Depends(get_db)):
    """Delete an application."""
    app = db.query(models.Application).filter(
        models.Application.id == app_id,
        models.Application.user_id == USER_ID,
    ).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    db.delete(app)
    db.commit()


# ── GET /applications/search ─────────────────────────────────────────────────

@router.get("/search/", response_model=list[schemas.ApplicationResponse])
def search_applications(
    q: str = Query(..., description="Search by company or role"),
    db: Session = Depends(get_db),
):
    """Search applications by company name or job title."""
    apps = db.query(models.Application).filter(
        models.Application.user_id == USER_ID,
        or_(
            models.Application.company.ilike(f"%{q}%"),
            models.Application.role.ilike(f"%{q}%"),
        ),
    ).all()
    return [_to_response(a) for a in apps]
