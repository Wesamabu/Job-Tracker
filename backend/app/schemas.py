from pydantic import BaseModel
from datetime import date
from typing import Optional
from enum import Enum

class ApplicationBase(BaseModel):
    company: str
    role: str
    status: Optional[str] = "Applied"
    date_applied: Optional[date]
    resume_used: Optional[str]
    job_description: Optional[str]


class ApplicationCreate(ApplicationBase):
    pass


class ApplicationResponse(ApplicationBase):
    id: int

    class Config:
        from_attributes = True



class StatusEnum(str, Enum):
    applied = "Applied"
    interview = "Interview"
    rejected = "Rejected"
    offer = "Offer"