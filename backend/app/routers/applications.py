from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app import models, schemas
from app.schemas import StatusEnum
from fastapi import UploadFile, File, Form
from datetime import date
import os
import uuid
from typing import List
from fastapi import Query
from sqlalchemy import or_



router = APIRouter(prefix="/applications", tags=["Applications"])

@router.get("/all", response_model=list[schemas.ApplicationResponse])
def get_all_applications(db: Session = Depends(get_db)):
    """
    Get all applications without any filters
    """
    applications = db.query(models.Application).all()
    return applications



@router.get("/filter", response_model=list[schemas.ApplicationResponse])
def get_filtered_applications(
    status: Optional[StatusEnum] = Query(
        None, description="Filter by application status"
    ),
    start_date: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="End date (YYYY-MM-DD)"),
    db: Session = Depends(get_db)
):
    query = db.query(models.Application)

    if status:
        query = query.filter(models.Application.status == status.value)
    if start_date:
        query = query.filter(models.Application.date_applied >= start_date)
    if end_date:
        query = query.filter(models.Application.date_applied <= end_date)

    return query.all()

@router.get("/search", response_model=list[schemas.ApplicationResponse])
def search_applications(
    q: str = Query(..., description="Search text or numeric values"),
    db: Session = Depends(get_db)
):
    """
    Search applications by company, role, job_description, or id.
    Text search is case-insensitive.
    """
    query = db.query(models.Application)

    # Try to interpret q as number for searching numeric fields like id
    try:
        q_number = int(q)
    except ValueError:
        q_number = None

    # Build the filter
    filters = [
        models.Application.company.ilike(f"%{q}%"),
        models.Application.role.ilike(f"%{q}%"),
        models.Application.job_description.ilike(f"%{q}%"),
    ]
    if q_number is not None:
        filters.append(models.Application.id == q_number)

    query = query.filter(or_(*filters))

    return query.all()
@router.post("/", response_model=schemas.ApplicationResponse)
def create_application(
    company: str = Form(...),
    role: str = Form(...),
    job_description: str = Form(None),
    status: str = Form("Applied"),
    date_applied: date = Form(...),
    resume: UploadFile = File(None, description="Upload a new resume in PDF"),
    selected_resume: str = Form(None, description="Or select an existing resume from dropdown"),
    db: Session = Depends(get_db)
):
    """
    Create a new application.
    Either a new resume can be uploaded OR an existing resume selected.
    """

    # Validate that at least one resume option is provided
    if not resume and not selected_resume:
        raise HTTPException(status_code=400, detail="Please upload a resume or select an existing one")

    # Handle new resume upload
    if resume:
        if resume.content_type != "application/pdf":
            raise HTTPException(status_code=400, detail="Only PDF files are allowed")
        os.makedirs("resumes", exist_ok=True)  # Ensure folder exists

        # Generate unique filename
        file_name = f"{uuid.uuid4()}.pdf"
        file_path = f"resumes/{file_name}"

        # Save file to disk
        with open(file_path, "wb") as buffer:
            buffer.write(resume.file.read())

    else:
        # Use selected existing resume
        file_path = f"resumes/{selected_resume}"

        # Validate that the file exists
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="Selected resume not found on server")

    # Create new application record
    new_app = models.Application(
        company=company,
        role=role,
        status=status,
        job_description=job_description,
        date_applied=date_applied,
        resume_used=file_path
    )

    db.add(new_app)
    db.commit()
    db.refresh(new_app)

    return new_app

@router.get("/resumes/", response_model=List[str])
def list_resumes(db: Session = Depends(get_db)):
    resume_paths = db.query(models.Application.resume_used).all()
    return [os.path.basename(r[0]) for r in resume_paths]



# Update application status
@router.patch("/{app_id}/status")
def update_status(app_id: int, status: StatusEnum, db: Session = Depends(get_db)):
    application = db.query(models.Application).filter(models.Application.id == app_id).first()

    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    application.status = status.value
    db.commit()
    db.refresh(application)

    return application

