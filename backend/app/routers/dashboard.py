from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import get_db
from app import models

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/")
def dashboard_summary(db: Session = Depends(get_db)):
    total_applications = db.query(models.Application).count()

    total_responses = db.query(models.Application) \
        .filter(models.Application.status != "Applied") \
        .count()

    response_rate = (total_responses / total_applications * 100) if total_applications > 0 else 0

    # Average response time in days
    responded_apps = db.query(models.Application) \
        .filter(models.Application.status != "Applied") \
        .all()
    avg_response_time = 0
    if responded_apps:
        total_days = sum(
            (app.last_updated - app.date_applied).days for app in responded_apps
        )
        avg_response_time = total_days / len(responded_apps)

    total_interviews = db.query(models.Application) \
        .filter(models.Application.status == "Interview") \
        .count()

    # Applications per week in current month
    from sqlalchemy import extract
    now = datetime.now()
    weekly_counts = []
    for week in range(1, 5):
        count = db.query(models.Application) \
            .filter(extract("month", models.Application.date_applied) == now.month) \
            .filter(extract("week", models.Application.date_applied) == week) \
            .count()
        weekly_counts.append(count)

    return {
        "total_applications": total_applications,
        "total_responses": total_responses,
        "response_rate": round(response_rate, 2),
        "avg_response_time": round(avg_response_time, 2),
        "total_interviews": total_interviews,
        "weekly_counts": weekly_counts
    }