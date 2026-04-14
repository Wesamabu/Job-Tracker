from collections import Counter
import json
from fastapi import APIRouter, Depends
from collections import defaultdict

from app.utils.embeddings import get_embedding, compute_similarity, generate_summary
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db

from app.auth.dependencies import get_current_user, get_db
from app.models import Application, Resume, User
from app.utils.text_extraction_roleFit import extract_skills
from app.utils.text_extraction_skillThemes import extract_skill_text_from_file



router = APIRouter(prefix="/insights_service", tags=["insights_service"])

class InsightsService:
    """
    AI-powered analytics engine for:
    - Role Fit scoring
    - Skill extraction
    - Skill gap analysis
    """

# -------------------------------------------------
# ROLE FIT (Role + % ONLY)
# -------------------------------------------------
@router.get("/roleFit")
def role_fit(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    applications = db.query(Application).filter(
        Application.user_id == current_user.id
    ).all()

    resumes = db.query(Resume).filter(
        Resume.user_id == current_user.id
    ).all()

    if not applications or not resumes:
        return {"message": "Add resume and job applications first"}

    # -------------------------------------------------
    # GROUP JOBS BY ROLE (NO HARDCODING)
    # -------------------------------------------------
    roles = defaultdict(list)

    for app in applications:
        if app.role and app.job_description:
            roles[app.role.lower()].append(app)

    # -------------------------------------------------
    # COMBINE ALL RESUME SKILLS
    # -------------------------------------------------
    combined_resume_skills = set()

    for resume in resumes:
        resume_text = extract_skill_text_from_file(resume.file_path)
        if not resume_text:
            continue

        skills = extract_skills(resume_text)
        combined_resume_skills.update(s.lower() for s in skills)

    if not combined_resume_skills:
        return {"message": "No skills found in resumes"}

    # -------------------------------------------------
    # CALCULATE MATCH PER ROLE
    # -------------------------------------------------
    results = []

    for role, apps in roles.items():

        combined_job_skills = set()

        for app in apps:
            job_skills = extract_skills(app.job_description)
            combined_job_skills.update(s.lower() for s in job_skills)

        if not combined_job_skills:
            continue

        matched = combined_resume_skills.intersection(combined_job_skills)

        match_percent = (len(matched) / len(combined_job_skills)) * 100

        results.append({
            "role": role.capitalize(),
            "match_percentage": round(match_percent, 2)
        })

    # -------------------------------------------------
    # SORT RESULTS (BEST FIRST)
    # -------------------------------------------------
    results.sort(key=lambda x: x["match_percentage"], reverse=True)

    return results


# -------------------------------------------------
# SKILL Themes (SKILL + % ONLY)
# -------------------------------------------------
@router.get("/skillThemes")
def skill_themes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    resumes = db.query(Resume).filter(Resume.user_id == current_user.id).all()
    applications = db.query(Application).filter(Application.user_id == current_user.id).all()

    if not resumes or not applications:
        return {"message": "No data found"}

    total_resumes = len(resumes)
    total_jobs = len(applications)

    resume_count = defaultdict(int)
    job_count = defaultdict(int)

    # -------------------------
    # RESUME SKILLS
    # -------------------------
    for r in resumes:
        text = extract_skill_text_from_file(r.file_path)
        skills = set(extract_skills(text or ""))

        for skill in skills:
            resume_count[skill.lower().strip()] += 1

    # -------------------------
    # JOB SKILLS
    # -------------------------
    for app in applications:
        skills = set(extract_skills(app.job_description or ""))

        for skill in skills:
            job_count[skill.lower().strip()] += 1

    # -------------------------
    # FINAL MATCHING
    # -------------------------
    results = []

    for skill, job_freq in job_count.items():

        resume_freq = resume_count.get(skill, 0)

        job_coverage = job_freq / total_jobs
        resume_coverage = resume_freq / total_resumes

        if job_coverage == 0:
            continue

        match_percentage = (resume_coverage / job_coverage) * 100

        # clamp to realistic range
        match_percentage = max(0, min(match_percentage, 100))

        results.append({
            "skill": skill,
            "match_percentage": round(match_percentage, 2)
        })

    return sorted(results, key=lambda x: x["match_percentage"], reverse=True)