"""
Resume endpoints — Issue #7  (feat/backend-resumes-api)

GET  /resumes      → list all resumes for the current user
POST /resumes      → upload a resume file (PDF / DOCX) + optional display name
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

from app.database import get_db
from app.models import Resume

router = APIRouter(prefix="/resumes", tags=["Resumes"])

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
ALLOWED_EXTENSIONS = {".pdf", ".docx"}

# Resolve to  backend/uploads/  (one level up from app/)
UPLOAD_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads"
)
os.makedirs(UPLOAD_DIR, exist_ok=True)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _validate_file_type(filename: str) -> None:
    """Raise 400 if the file extension is not .pdf or .docx."""
    ext = os.path.splitext(filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "error": {
                    "code": "VALIDATION_ERROR",
                    "message": (
                        f"Invalid file type '{ext}'. "
                        "Only PDF and DOCX files are allowed."
                    ),
                }
            },
        )


def _to_camel(resume: Resume) -> dict:
    """Convert a Resume ORM instance to the camelCase shape defined in API_CONTRACT."""
    # Stored filename format: {uuid8}_{original_filename}
    stored = os.path.basename(resume.file_path)
    parts = stored.split("_", 1)
    original_filename = parts[1] if len(parts) > 1 else stored

    created = resume.created_at
    created_str = (
        created.isoformat() + "Z"
        if created and created.tzinfo is None
        else created.isoformat()
        if created
        else None
    )

    return {
        "id": resume.id,
        "name": resume.name,
        "fileName": original_filename,
        "createdAt": created_str,
    }


# ---------------------------------------------------------------------------
# GET /resumes
# ---------------------------------------------------------------------------
@router.get("")
def list_resumes(db: Session = Depends(get_db)):
    """Return all resumes for the current user."""
    # TODO: replace hardcoded user_id with real auth when implemented
    user_id = 1

    resumes = (
        db.query(Resume)
        .filter(Resume.user_id == user_id)
        .order_by(Resume.created_at.desc())
        .all()
    )

    items = [_to_camel(r) for r in resumes]
    return {"items": items, "total": len(items)}


# ---------------------------------------------------------------------------
# POST /resumes
# ---------------------------------------------------------------------------
@router.post("", status_code=status.HTTP_201_CREATED)
def upload_resume(
    file: UploadFile = File(...),
    name: Optional[str] = Form(None),
    db: Session = Depends(get_db),
):
    """Upload a new resume (PDF or DOCX) with an optional display name."""
    # TODO: replace hardcoded user_id with real auth when implemented
    user_id = 1

    # 1. Validate file type
    _validate_file_type(file.filename)

    # 2. Save file with a unique prefix to avoid name collisions
    unique_prefix = uuid.uuid4().hex[:8]
    safe_filename = f"{unique_prefix}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, safe_filename)

    try:
        with open(file_path, "wb") as buf:
            shutil.copyfileobj(file.file, buf)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": {
                    "code": "INTERNAL_ERROR",
                    "message": "Failed to save uploaded file.",
                }
            },
        )

    # 3. Determine display name (fall back to filename without extension)
    display_name = name if name else os.path.splitext(file.filename)[0]

    # 4. Persist metadata in DB
    resume = Resume(
        user_id=user_id,
        name=display_name,
        file_path=file_path,
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)

    return _to_camel(resume)
