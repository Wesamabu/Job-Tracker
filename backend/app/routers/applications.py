from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional
from datetime import date

from app.database import get_db
from app import models, schemas
from app.auth.dependencies import get_current_user

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
def get_all_applications(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Return all applications for the current user."""
    apps = db.query(models.Application).filter(
        models.Application.user_id == current_user.id
    ).order_by(models.Application.created_at.desc()).all()
    return [_to_response(a) for a in apps]


# ── GET /applications/{id} ───────────────────────────────────────────────────

@router.get("/{app_id}", response_model=schemas.ApplicationResponse)
def get_application(app_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Return a single application by ID."""
    app = db.query(models.Application).filter(
        models.Application.id == app_id,
        models.Application.user_id == current_user.id,
    ).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    return _to_response(app)


# ── POST /applications ───────────────────────────────────────────────────────

@router.post("/", response_model=schemas.ApplicationResponse, status_code=201)
def create_application(data: schemas.ApplicationCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Create a new application."""
    new_app = models.Application(
        user_id=current_user.id,
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
def update_application(app_id: int, data: schemas.ApplicationUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Update an existing application."""
    app = db.query(models.Application).filter(
        models.Application.id == app_id,
        models.Application.user_id == current_user.id,
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
def delete_application(app_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Delete an application."""
    app = db.query(models.Application).filter(
        models.Application.id == app_id,
        models.Application.user_id == current_user.id,
    ).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    db.delete(app)
    db.commit()


# ── GET /applications/filter ─────────────────────────────────────────────────

@router.get("/filter", response_model=list[schemas.ApplicationResponse])
def get_filtered_applications(
    status: Optional[str] = Query(None, description="Filter by application status"),
    start_date: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="End date (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Filter applications by status and/or date range."""
    query = db.query(models.Application).filter(
        models.Application.user_id == current_user.id
    )

    if status:
        query = query.filter(models.Application.status == status)
    if start_date:
        query = query.filter(models.Application.date_applied >= start_date)
    if end_date:
        query = query.filter(models.Application.date_applied <= end_date)

    return [_to_response(a) for a in query.all()]


# ── GET /applications/search ─────────────────────────────────────────────────

@router.get("/search/", response_model=list[schemas.ApplicationResponse])
def search_applications(
    q: str = Query(..., description="Search by company, role, job description, or id"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Search applications by company name, job title, job description, or id."""
    query = db.query(models.Application).filter(
        models.Application.user_id == current_user.id
    )

    # Try to interpret q as a number for ID search
    try:
        q_number = int(q)
    except ValueError:
        q_number = None

    filters = [
        models.Application.company.ilike(f"%{q}%"),
        models.Application.role.ilike(f"%{q}%"),
        models.Application.job_description.ilike(f"%{q}%"),
    ]
    if q_number is not None:
        filters.append(models.Application.id == q_number)

    return [_to_response(a) for a in query.filter(or_(*filters)).all()]
