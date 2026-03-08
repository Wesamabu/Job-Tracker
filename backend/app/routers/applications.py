from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from datetime import date

from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/applications", tags=["Applications"])


@router.post("/", response_model=schemas.ApplicationResponse)
def create_application(app: schemas.ApplicationCreate, db: Session = Depends(get_db)):
    new_app = models.Application(**app.model_dump())
    db.add(new_app)
    db.commit()
    db.refresh(new_app)
    return new_app


@router.get("/", response_model=list[schemas.ApplicationResponse])
def get_applications(
    status: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Application)

    if status:
        query = query.filter(models.Application.status == status)

    if start_date:
        query = query.filter(models.Application.date_applied >= start_date)

    if end_date:
        query = query.filter(models.Application.date_applied <= end_date)

    return query.all()


@router.patch("/{app_id}/status")
def update_status(app_id: int, status: str, db: Session = Depends(get_db)):
    application = db.query(models.Application).filter(models.Application.id == app_id).first()

    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    application.status = status
    db.commit()
    db.refresh(application)
    return application