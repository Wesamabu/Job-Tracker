from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Application  # Matches the class name in models.py

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    # Pulls the counts from the database
    total_apps = db.query(Application).count()
    
    # Count based on the 'status' column in the Application model
    total_responses = db.query(Application).filter(Application.status == "responded").count()
    total_interviews = db.query(Application).filter(Application.status == "interview").count()

    # Calculate the rates, with checks to avoid division by zero
    res_rate = (total_responses / total_apps * 100) if total_apps > 0 else 0
    int_rate = (total_interviews / total_apps * 100) if total_apps > 0 else 0

    return {
        "total_applications": total_apps,
        "total_responses": total_responses,
        "response_rate": f"{round(res_rate, 2)}%",
        "total_interviews": total_interviews,
        "interview_rate": f"{round(int_rate, 2)}%",
        "average_response_time": "0 days"
    }