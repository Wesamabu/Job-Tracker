"""
SQLAlchemy models for Job Tracker.
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, func, Date, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    applications = relationship("Application", back_populates="user")
    resumes = relationship("Resume", back_populates="user")


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    category = Column(String, nullable=True, default="general")
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="resumes")
    applications = relationship("Application", back_populates="resume")


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=True)

    company = Column(String, nullable=False)
    role = Column(String, nullable=False)
    location = Column(String, nullable=True)
    status = Column(String, nullable=False, default="applied")
    date_applied = Column(Date, nullable=True)
    job_description = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="applications")
    resume = relationship("Resume", back_populates="applications")


class InsightsCache(Base):
    """
    Stores the last generated career summary for a user alongside a fingerprint
    of the data that produced it. If the fingerprint hasn't changed since the
    last generation, we return the cached summary instead of calling Groq again.
    """
    __tablename__ = "insights_cache"
    __table_args__ = (UniqueConstraint("user_id"),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    fingerprint = Column(String, nullable=False)
    summary = Column(Text, nullable=True)
    role_fit = Column(Text, nullable=True)       # JSON string
    skill_themes = Column(Text, nullable=True)   # JSON string
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
