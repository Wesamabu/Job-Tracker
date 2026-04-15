"""
Insights endpoints

GET /insights/career → Collects all user data (resumes, applications, outcomes),
                       computes alignment scores, then sends everything to an LLM
                       to generate a personalized career coaching summary.
"""

import hashlib
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.auth.dependencies import get_current_user, get_db
from app.models import Application, Resume, User, InsightsCache
from app.utils.text_extraction import extract_text_from_file
from app.utils.embeddings import get_embedding, compute_similarity, generate_summary

router = APIRouter(prefix="/insights", tags=["Insights"])

POSITIVE_STATUSES = {"interviewing", "interview", "offered", "offer", "accepted"}


# ── GET /insights/career ─────────────────────────────────────────────────────

@router.get("/career")
def get_career_insights(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # ── 1. Fetch all resumes and applications from the database ───────────────
    # We pull everything belonging to the logged-in user.
    resumes = db.query(Resume).filter(Resume.user_id == current_user.id).all()
    applications = db.query(Application).filter(Application.user_id == current_user.id).all()

    # Early return if user has no data yet
    if not applications:
        return {
            "summary": "Add your first job application to get personalized career insights."
        }

    # ── 2. Extract resume text and compute embeddings ─────────────────────────
    # For each resume we extract the full text from the PDF/DOCX file,
    # then convert it to an embedding vector so we can compute similarity scores.
    resume_data: dict[int, dict] = {}
    for r in resumes:
        text = extract_text_from_file(r.file_path)
        embedding = get_embedding(text) if text else []
        resume_data[r.id] = {
            "name": r.name,
            "text": text,
            "embedding": embedding,
        }

    # ── 3. Calculate stats ────────────────────────────────────────────────────

    # Interview rate: how many applications got a positive response
    total = len(applications)
    interviews = sum(1 for app in applications if app.status in POSITIVE_STATUSES)
    interview_rate = round((interviews / total) * 100, 1) if total > 0 else 0

    # Best resume: which resume was linked to the most interviews/offers
    resume_interview_count: dict[int, int] = {}
    for app in applications:
        if app.resume_id and app.status in POSITIVE_STATUSES:
            resume_interview_count[app.resume_id] = resume_interview_count.get(app.resume_id, 0) + 1

    best_resume_name = "Not enough data yet"
    if resume_interview_count:
        best_resume_id = max(resume_interview_count, key=resume_interview_count.get)
        if best_resume_id in resume_data:
            best_resume_name = resume_data[best_resume_id]["name"]

    # ── 4. Build resume section for the prompt ────────────────────────────────
    # We include the full extracted text of every resume so Gemini can
    # read the actual content and quote it in the summary.
    resume_section = ""
    for r_id, data in resume_data.items():
        resume_section += f"Resume: {data['name']}\n"
        resume_section += f"{data['text']}\n"
        resume_section += "---\n"

    if not resume_section:
        resume_section = "No resumes uploaded yet."

    # ── 5. Build applications section for the prompt ──────────────────────────
    # For each application we compute the alignment score between the resume
    # used and the job description, then include all details for Gemini.
    apps_section = ""
    for app in applications:
        # Compute alignment score if we have both a JD and a resume embedding
        alignment = "N/A"
        if app.job_description and app.job_description.strip():
            jd_embedding = get_embedding(app.job_description)
            if jd_embedding:
                if app.resume_id and app.resume_id in resume_data and resume_data[app.resume_id]["embedding"]:
                    score = compute_similarity(resume_data[app.resume_id]["embedding"], jd_embedding)
                    alignment = f"{round(score * 100, 1)}%"
                elif resume_data:
                    # No linked resume — use best match across all resumes
                    best_score = max(
                        compute_similarity(rd["embedding"], jd_embedding)
                        for rd in resume_data.values()
                        if rd["embedding"]
                    ) if any(rd["embedding"] for rd in resume_data.values()) else 0
                    alignment = f"{round(best_score * 100, 1)}%"

        resume_name = resume_data[app.resume_id]["name"] if app.resume_id and app.resume_id in resume_data else "No resume linked"

        apps_section += f"- Company: {app.company} | Role: {app.role} | Status: {app.status} | Alignment: {alignment}\n"
        apps_section += f"  Resume used: {resume_name}\n"
        apps_section += f"  Job Description: {app.job_description[:800] if app.job_description else 'not saved'}\n\n"

    # ── 6. Build the prompt ───────────────────────────────────────────────────
    # This is the full instruction we send to Gemini. It includes:
    # - Instructions on how to behave and what tone to use
    # - All the user's real data
    # - Exact sections we want Gemini to write
    prompt = f"""
You are a brutally honest but encouraging senior tech recruiter with 15 years
of experience. You have reviewed this candidate's full job search history and
every resume they have uploaded. Your job is to write them a personal career
coaching report that feels like it came from someone who genuinely read
everything and cares about their success — not a generic AI summary.

Rules you must follow:
- NEVER say things like "consider updating your resume" or "focus on your strengths"
- ALWAYS quote the user's actual resume text when pointing out problems
- ALWAYS name real companies from their application history
- If their resume has weak language, show them the exact line and rewrite it for them
- If they are applying to companies their resume is not competitive for, say it directly
- Be specific enough that they can take action today

=== RESUMES ===
{resume_section}

=== JOB APPLICATIONS ===
{apps_section}

=== STATS ===
Total applications: {total}
Interview rate: {interview_rate}% ({interviews} interviews out of {total} applications)
Best performing resume: {best_resume_name}

=== WRITE THE FOLLOWING REPORT ===

**Why You're Not Getting Interviews**
Be direct and specific. Look at their alignment scores — if they are low,
explain what that means in plain English. If they are applying to top companies
but their resume is not competitive, tell them. Reference actual companies
and roles from their history above.

**What's Holding Your Resume Back**
Read their resume text above carefully. Find the 2-3 most damaging problems.
Quote the exact weak lines from their resume and rewrite them to show what
a strong version looks like. Look for passive language, missing numbers and
impact, and keywords that appear in their job descriptions but not their resume.

**The Roles You Should Actually Be Targeting**
Based on their alignment scores and interview outcomes above, tell them honestly
which roles and company types they are competitive for right now, and what
specifically would need to change to unlock the roles they are stretching for.

**Your 3 Most Important Next Steps**
Numbered. Specific. Actionable today. Do not say "improve your resume." Instead
say exactly which line to rewrite, which keyword to add, or which type of role
to apply to next and why. Reference their real data.

Tone: like a mentor who has seen thousands of resumes and genuinely wants this
person to get the job. Honest, warm, and specific. Max 500 words.
"""

    # ── 7. Compute fingerprint ────────────────────────────────────────────────
    # The fingerprint is a hash that represents the user's current data state.
    # It includes: sorted resume IDs + each application's ID and status.
    # If any of these change (new resume, status update, new application),
    # the fingerprint changes and we regenerate the summary.
    # If nothing changed since last time, we return the cached summary.
    resume_ids = sorted(str(r.id) for r in resumes)
    app_fingerprint_parts = sorted(f"{app.id}:{app.status}" for app in applications)
    raw_fingerprint = "|".join(resume_ids) + "||" + ",".join(app_fingerprint_parts)
    fingerprint = hashlib.md5(raw_fingerprint.encode()).hexdigest()

    # ── 8. Check cache ────────────────────────────────────────────────────────
    # Look up whether we already have a cached summary for this user.
    # If the stored fingerprint matches the current one, return the cached summary.
    cache = db.query(InsightsCache).filter(InsightsCache.user_id == current_user.id).first()
    if cache and cache.fingerprint == fingerprint:
        return {"summary": cache.summary}

    # ── 9. Call the LLM ───────────────────────────────────────────────────────
    # Only reaches here if the data changed or there is no cached summary yet.
    summary = generate_summary(prompt)

    # ── 10. Save to cache ─────────────────────────────────────────────────────
    # Store the new summary and fingerprint so the next request can use the cache.
    # Uses try/except to handle the race condition where the frontend fires all
    # three insight requests simultaneously and all try to INSERT the same row.
    if cache:
        cache.summary = summary
        cache.fingerprint = fingerprint
        db.commit()
    else:
        try:
            db.add(InsightsCache(user_id=current_user.id, summary=summary, fingerprint=fingerprint))
            db.commit()
        except IntegrityError:
            db.rollback()
            cache = db.query(InsightsCache).filter(InsightsCache.user_id == current_user.id).first()
            if cache:
                cache.summary = summary
                cache.fingerprint = fingerprint
                db.commit()

    return {"summary": summary}
