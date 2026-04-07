from pydantic import BaseModel, Field, AliasChoices
from datetime import date
from typing import Optional
from enum import Enum


# ── Applications ────────────────────────────────────────────────────────────

class ApplicationCreate(BaseModel):
    jobTitle: str
    company: str
    location: Optional[str] = None
    status: str = "applied"
    appliedDate: Optional[date] = None
    description: Optional[str] = None
    notes: Optional[str] = None
    resumeId: Optional[int] = None


class ApplicationUpdate(BaseModel):
    jobTitle: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    status: Optional[str] = None
    appliedDate: Optional[date] = None
    description: Optional[str] = None
    notes: Optional[str] = None
    resumeId: Optional[int] = None


class ApplicationResponse(BaseModel):
    id: int
    jobTitle: str
    company: str
    location: Optional[str] = None
    status: str
    appliedDate: Optional[date] = None
    description: Optional[str] = None
    notes: Optional[str] = None
    resumeUsed: Optional[str] = None

    class Config:
        from_attributes = True


# ── Status Enum (for filter endpoint) ───────────────────────────────────────

class StatusEnum(str, Enum):
    applied = "applied"
    screening = "screening"
    interviewing = "interviewing"
    offered = "offered"
    rejected = "rejected"
    accepted = "accepted"
    declined = "declined"


# ── Job URL Fetching ──────────────────────────────────────────────────────

class JobUrlRequest(BaseModel):
    url: str  # Mandatory field: must be "url"