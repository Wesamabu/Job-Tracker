from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Application

# Hardcoded user_id=1 until authentication is implemented
USER_ID = 1

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

# Status values that count as "interview stage"
INTERVIEW_STATUSES = ["interviewing", "interview"]
# Status values that count as "offer stage"
OFFER_STATUSES = ["offered", "offer", "accepted"]
# Status values that count as "active"
ACTIVE_STATUSES = ["applied", "screening", "interviewing", "interview"]


@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    """Return summary stats for the dashboard."""
    base = db.query(Application).filter(Application.user_id == USER_ID)

    total_apps = base.count()
    total_interviews = base.filter(Application.status.in_(INTERVIEW_STATUSES)).count()
    total_offers = base.filter(Application.status.in_(OFFER_STATUSES)).count()
    active = base.filter(Application.status.in_(ACTIVE_STATUSES)).count()

    int_rate = (total_interviews / total_apps * 100) if total_apps > 0 else 0
    offer_rate = (total_offers / total_apps * 100) if total_apps > 0 else 0

    return {
        "totalApplications": total_apps,
        "active": active,
        "interviews": total_interviews,
        "offers": total_offers,
        "interviewRate": f"{round(int_rate, 2)}%",
        "offerRate": f"{round(offer_rate, 2)}%",
    }


@router.get("/activity")
def get_recent_activity(db: Session = Depends(get_db)):
    """Return the 10 most recently added applications as activity feed."""
    recent = (
        db.query(Application)
        .filter(Application.user_id == USER_ID)
        .order_by(Application.created_at.desc())
        .limit(10)
        .all()
    )

    return [
        {
            "id": str(app.id),
            "type": "application",
            "company": app.company,
            "position": app.role,
            "timestamp": app.created_at.isoformat() if app.created_at else None,
        }
        for app in recent
    ]
