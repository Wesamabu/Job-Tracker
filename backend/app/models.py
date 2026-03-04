"""
SQLAlchemy models for Job Tracker.

Models will be added here as features are implemented:
- Application  (Milestone 1)
- Resume       (Milestone 1)

Import Base from app.database and define each model as a class.
All tables are created automatically on startup via Base.metadata.create_all()
in main.py.
"""

#from app.database import Base  # noqa: F401 — imported so models can subclass Base

# Future models go here, e.g.:
#
# from sqlalchemy import Column, Integer, String, DateTime
# from datetime import datetime
#
# class Application(Base):
#     __tablename__ = "applications"
#     id = Column(Integer, primary_key=True, index=True)
#     ...

from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.database import Base

class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    company = Column(String)
    role = Column(String)
    # This is the important one for your stats!
    status = Column(String, default="applied") # e.g., "applied", "responded", "interview"
    created_at = Column(DateTime, default=datetime.utcnow)