import hashlib
import json
from collections import defaultdict
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.auth.dependencies import get_current_user, get_db
from app.models import Application, Resume, User, InsightsCache
from app.utils.text_extraction_roleFit import extract_skills
from app.utils.text_extraction_skillThemes import extract_skill_text_from_file


def save_cache(db: Session, user_id: int, fingerprint: str, **fields):
    """
    Save fields to the cache. Handles the race condition where multiple
    requests try to INSERT at the same time — falls back to UPDATE on conflict.
    """
    cache = db.query(InsightsCache).filter(InsightsCache.user_id == user_id).first()
    if cache:
        cache.fingerprint = fingerprint
        for key, value in fields.items():
            setattr(cache, key, value)
        db.commit()
    else:
        try:
            db.add(InsightsCache(user_id=user_id, fingerprint=fingerprint, **fields))
            db.commit()
        except IntegrityError:
            db.rollback()
            cache = db.query(InsightsCache).filter(InsightsCache.user_id == user_id).first()
            if cache:
                cache.fingerprint = fingerprint
                for key, value in fields.items():
                    setattr(cache, key, value)
                db.commit()


router = APIRouter(prefix="/insights_service", tags=["insights_service"])


def compute_fingerprint(resumes: list, applications: list) -> str:
    """
    Builds a fingerprint from the user's current resumes and applications.
    Any change (new resume, new application, status update) produces a
    different fingerprint, which triggers a cache miss and a fresh computation.
    """
    resume_ids = sorted(str(r.id) for r in resumes)
    app_parts = sorted(f"{app.id}:{app.status}" for app in applications)
    raw = "|".join(resume_ids) + "||" + ",".join(app_parts)
    return hashlib.md5(raw.encode()).hexdigest()


# -------------------------------------------------
# ROLE FIT
# -------------------------------------------------
@router.get("/roleFit")
def role_fit(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    applications = db.query(Application).filter(Application.user_id == current_user.id).all()
    resumes = db.query(Resume).filter(Resume.user_id == current_user.id).all()

    if not applications or not resumes:
        return {"message": "Add resume and job applications first"}

    # Check cache first
    fingerprint = compute_fingerprint(resumes, applications)
    cache = db.query(InsightsCache).filter(InsightsCache.user_id == current_user.id).first()
    if cache and cache.fingerprint == fingerprint and cache.role_fit:
        return json.loads(cache.role_fit)

    # Cache miss — compute role fit
    roles = defaultdict(list)
    for app in applications:
        if app.role and app.job_description:
            roles[app.role.lower()].append(app)

    combined_resume_skills = set()
    for resume in resumes:
        resume_text = extract_skill_text_from_file(resume.file_path)
        if not resume_text:
            continue
        skills = extract_skills(resume_text)
        combined_resume_skills.update(s.lower() for s in skills)

    if not combined_resume_skills:
        return {"message": "No skills found in resumes"}

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

    results.sort(key=lambda x: x["match_percentage"], reverse=True)

    save_cache(db, current_user.id, fingerprint, role_fit=json.dumps(results))

    return results


# -------------------------------------------------
# SKILL THEMES
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

    # Check cache first
    fingerprint = compute_fingerprint(resumes, applications)
    cache = db.query(InsightsCache).filter(InsightsCache.user_id == current_user.id).first()
    if cache and cache.fingerprint == fingerprint and cache.skill_themes:
        return json.loads(cache.skill_themes)

    # Cache miss — compute skill themes
    total_jobs = len(applications)
    resume_count = defaultdict(int)
    job_count = defaultdict(int)

    for r in resumes:
        text = extract_skill_text_from_file(r.file_path)
        skills = set(extract_skills(text or ""))
        for skill in skills:
            resume_count[skill.lower().strip()] += 1

    for app in applications:
        skills = set(extract_skills(app.job_description or ""))
        for skill in skills:
            job_count[skill.lower().strip()] += 1

    results = []
    for skill, job_freq in job_count.items():
        if resume_count.get(skill, 0) == 0:
            continue
        match_percentage = (job_freq / total_jobs) * 100
        results.append({
            "skill": skill,
            "match_percentage": round(match_percentage, 2)
        })

    results = sorted(results, key=lambda x: x["match_percentage"], reverse=True)

    save_cache(db, current_user.id, fingerprint, skill_themes=json.dumps(results))

    return results
