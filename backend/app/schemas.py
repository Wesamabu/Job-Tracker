from pydantic import BaseModel, EmailStr, field_validator
from datetime import date
from typing import Optional
from enum import Enum


# ── Auth ────────────────────────────────────────────────────────────────
class RegisterRequest(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str


    @field_validator("first_name", "last_name")
    @classmethod
    def names_must_not_be_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Name fields cannot be empty.")
        return v.title()

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters.")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str

    model_config = {"from_attributes": True}  


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
