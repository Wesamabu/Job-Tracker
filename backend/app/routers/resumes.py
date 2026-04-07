"""
Resume endpoints

GET    /resumes          → list all resumes for the current user
POST   /resumes          → upload a resume file (PDF / DOCX) + optional display name + category
DELETE /resumes/{id}     → delete a resume by id
"""

import os
import uuid
import shutil
from typing import Optional

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
    status,
)
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user, get_db
from app.models import Resume, User

router = APIRouter(prefix="/resumes", tags=["Resumes"])

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".doc"}

UPLOAD_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads"
)
os.makedirs(UPLOAD_DIR, exist_ok=True)


def _validate_file_type(filename: str) -> None:
    ext = os.path.splitext(filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type '{ext}'. Only PDF, DOC, and DOCX files are allowed.",
        )


def _to_response(resume: Resume) -> dict:
    """Convert a Resume ORM instance to the shape the frontend expects."""
    stored = os.path.basename(resume.file_path)
    parts = stored.split("_", 1)
    original_filename = parts[1] if len(parts) > 1 else stored

    ext = os.path.splitext(original_filename)[1].upper().lstrip(".")
    file_format = ext if ext in ("PDF", "DOC", "DOCX") else "PDF"

    created = resume.created_at
    upload_date = created.strftime("%Y-%m-%d") if created else None

    return {
        "id": str(resume.id),
        "title": resume.name,
        "category": resume.category or "general",
        "fileName": original_filename,
        "fileFormat": file_format,
        "fileSize": "—",
        "uploadDate": upload_date,
        "tags": [],
        "description": None,
        "isPrimary": False,
    }


# ── GET /resumes ─────────────────────────────────────────────────────────────

@router.get("")
def list_resumes(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Return all resumes for the current user."""
    resumes = (
        db.query(Resume)
        .filter(Resume.user_id == current_user.id)
        .order_by(Resume.created_at.desc())
        .all()
    )
    items = [_to_response(r) for r in resumes]
    return {"items": items, "total": len(items)}


# ── POST /resumes ─────────────────────────────────────────────────────────────

@router.post("", status_code=status.HTTP_201_CREATED)
def upload_resume(
    file: UploadFile = File(...),
    name: Optional[str] = Form(None),
    category: Optional[str] = Form("general"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Upload a new resume (PDF, DOC, or DOCX) with an optional display name and category."""
    _validate_file_type(file.filename)

    unique_prefix = uuid.uuid4().hex[:8]
    safe_filename = f"{unique_prefix}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, safe_filename)

    try:
        with open(file_path, "wb") as buf:
            shutil.copyfileobj(file.file, buf)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save uploaded file.",
        )

    display_name = name if name else os.path.splitext(file.filename)[0]

    resume = Resume(
        user_id=current_user.id,
        name=display_name,
        file_path=file_path,
        category=category,
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)

    return _to_response(resume)


# ── DELETE /resumes/{resume_id} ───────────────────────────────────────────────

@router.delete("/{resume_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_resume(resume_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Delete a resume by id. Also removes the file from disk."""
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()

    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found."
        )

    # Delete the file from disk if it exists
    if os.path.exists(resume.file_path):
        os.remove(resume.file_path)

    db.delete(resume)
    db.commit()
