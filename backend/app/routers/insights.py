"""
Insights endpoints

GET /insights/career → Compares user's resumes against job descriptions using
                       Vertex AI embeddings and returns a comprehensive career summary.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Application, Resume
from app.utils.text_extraction import extract_text_from_file
from app.utils.embeddings import get_embedding, compute_similarity

# Hardcoded user_id=1 until authentication is implemented
USER_ID = 1

router = APIRouter(prefix="/insights", tags=["Insights"])

# ── Role categorisation keywords ─────────────────────────────────────────────

ROLE_CATEGORIES: dict[str, list[str]] = {
    "Frontend": ["frontend", "react", "vue", "angular", "ui", "ux", "css"],
    "Backend": ["backend", "server", "api", "python", "java", "node", "django", "flask"],
    "Full Stack": ["full stack", "fullstack", "full-stack"],
    "Data": ["data", "analytics", "etl", "warehouse", "sql", "database"],
    "ML / AI": ["machine learning", "ml", "ai", "deep learning", "nlp"],
    "DevOps": ["devops", "sre", "infrastructure", "cloud", "platform", "aws", "gcp", "azure"],
}

# Statuses that count as having received a positive response (interview+)
POSITIVE_STATUSES = {"interviewing", "interview", "offered", "offer", "accepted"}


# ── Helpers ──────────────────────────────────────────────────────────────────

def _categorize_role(role: str) -> str:
    """Map a job role/title string to a broad category using keyword matching."""
    role_lower = role.lower()
    for category, keywords in ROLE_CATEGORIES.items():
        if any(kw in role_lower for kw in keywords):
            return category
    return "General"


def _build_insights(snapshot: list[dict], best_resume: str | None, lowest_cat: str | None) -> list[str]:
    """Generate 3-4 human-readable bullet points summarising patterns."""
    bullets: list[str] = []

    if not snapshot:
        return ["Not enough application data to generate insights yet."]

    # 1. Overall volume
    total_apps = sum(s["applications"] for s in snapshot)
    num_categories = len(snapshot)
    bullets.append(
        f"You have applied to {total_apps} role(s) across {num_categories} "
        f"categor{'y' if num_categories == 1 else 'ies'}."
    )

    # 2. Strongest category
    best_cat = max(snapshot, key=lambda s: s["avgAlignment"])
    bullets.append(
        f"Your strongest alignment is in {best_cat['category']} roles "
        f"({best_cat['avgAlignment']}% avg alignment)."
    )

    # 3. Best resume
    if best_resume:
        bullets.append(
            f'"{best_resume}" is your best-performing resume based on interview/offer rate.'
        )

    # 4. Weakest area
    if lowest_cat:
        bullets.append(
            f"{lowest_cat} roles show the lowest resume-to-JD alignment — "
            f"consider tailoring your resume for this category."
        )

    return bullets


def _build_recommendations(
    snapshot: list[dict],
    lowest_cat: str | None,
    best_resume: str | None,
) -> list[str]:
    """Generate a numbered list of actionable next steps."""
    recs: list[str] = []

    if not snapshot:
        return ["Add more applications so we can generate personalised recommendations."]

    # Sort categories by alignment descending
    sorted_cats = sorted(snapshot, key=lambda s: s["avgAlignment"], reverse=True)

    # 1. Focus on strong categories
    top = sorted_cats[0]
    recs.append(
        f"Focus applications on {top['category']} roles — your resume aligns "
        f"best with these positions ({top['avgAlignment']}%)."
    )

    # 2. Improve weakest category
    if lowest_cat:
        recs.append(
            f"Strengthen your {lowest_cat} resume by adding relevant keywords "
            f"and project experience for that domain."
        )

    # 3. Resume advice
    if best_resume:
        recs.append(
            f'Use "{best_resume}" as your primary template and create '
            f"category-specific variants from it."
        )

    # 4. General tips based on interview rate
    low_interview_cats = [s for s in snapshot if s["interviewRateValue"] < 30]
    if low_interview_cats:
        names = ", ".join(c["category"] for c in low_interview_cats)
        recs.append(
            f"Review and rewrite your job-description match for {names} roles — "
            f"low interview rates suggest your resume isn't passing initial screens."
        )

    # 5. Always-useful tip
    recs.append(
        "Keep job descriptions saved for every application so alignment "
        "tracking stays accurate over time."
    )

    return recs


# ── GET /insights/career ─────────────────────────────────────────────────────

@router.get("/career")
def get_career_insights(db: Session = Depends(get_db)):
    """
    Compare the user's resume(s) against their saved job descriptions using
    Vertex AI text embeddings and return a structured career summary.
    """

    # ── 1. Fetch applications & resumes ──────────────────────────────────────
    applications = (
        db.query(Application)
        .filter(Application.user_id == USER_ID)
        .all()
    )

    resumes = (
        db.query(Resume)
        .filter(Resume.user_id == USER_ID)
        .all()
    )

    # Early return when there is no data
    if not applications:
        return {
            "overallAlignment": 0,
            "snapshot": [],
            "bestResume": None,
            "lowestAlignment": None,
            "whatThisMeans": ["No applications found. Start adding jobs to get insights."],
            "whatToDoNext": ["Add your first job application to begin tracking."],
        }

    # ── 2. Extract resume text & compute embeddings (cached per resume) ──────
    resume_cache: dict[int, dict] = {}
    for r in resumes:
        text = extract_text_from_file(r.file_path)
        embedding = get_embedding(text) if text else []
        resume_cache[r.id] = {
            "name": r.name,
            "embedding": embedding,
        }

    # ── 3. Score every application ───────────────────────────────────────────
    #   For each app we compute cosine similarity between the resume that was
    #   used and the job description.  Results are bucketed by role category.

    category_bucket: dict[str, list[dict]] = {}
    resume_stats: dict[int, dict] = {}
    all_scores: list[float] = []

    # Pre-filter resumes that have a usable embedding
    usable_resumes = {
        rid: data for rid, data in resume_cache.items() if data["embedding"]
    }

    for app in applications:
        category = _categorize_role(app.role)
        score: float | None = None  # None = could not compute

        # Compute similarity when a job description exists
        if app.job_description and app.job_description.strip() and usable_resumes:
            jd_embedding = get_embedding(app.job_description)
            if jd_embedding:
                if app.resume_id and app.resume_id in usable_resumes:
                    # Use the linked resume
                    score = compute_similarity(
                        usable_resumes[app.resume_id]["embedding"], jd_embedding
                    )
                else:
                    # No linked resume → try all resumes, keep best match
                    score = max(
                        compute_similarity(rd["embedding"], jd_embedding)
                        for rd in usable_resumes.values()
                    )

        # Only count genuinely computed scores in alignment averages
        if score is not None:
            all_scores.append(score)

        # Bucket by category (store score as 0.0 when not computable for
        # interview-rate stats; alignment averages use all_scores instead)
        category_bucket.setdefault(category, []).append({
            "score": score,
            "status": app.status,
            "resume_id": app.resume_id,
        })

        # Track per-resume performance
        if app.resume_id and app.resume_id in resume_cache:
            if app.resume_id not in resume_stats:
                resume_stats[app.resume_id] = {
                    "name": resume_cache[app.resume_id]["name"],
                    "total": 0,
                    "interviews": 0,
                }
            resume_stats[app.resume_id]["total"] += 1
            if app.status in POSITIVE_STATUSES:
                resume_stats[app.resume_id]["interviews"] += 1

    # ── 4. Overall alignment ─────────────────────────────────────────────────
    overall = round((sum(all_scores) / len(all_scores)) * 100, 1) if all_scores else 0

    # ── 5. Build snapshot per category ───────────────────────────────────────
    snapshot: list[dict] = []
    for cat, entries in category_bucket.items():
        valid_scores = [e["score"] for e in entries if e["score"] is not None]
        avg = sum(valid_scores) / len(valid_scores) if valid_scores else 0
        total = len(entries)
        interviews = sum(1 for e in entries if e["status"] in POSITIVE_STATUSES)
        int_rate = (interviews / total * 100) if total > 0 else 0

        snapshot.append({
            "category": cat,
            "applications": total,
            "avgAlignment": round(avg * 100, 1),
            "interviewRate": f"{round(int_rate, 1)}%",
            "interviewRateValue": round(int_rate, 1),   # numeric copy for sorting
        })

    # Sort snapshot: highest alignment first
    snapshot.sort(key=lambda s: s["avgAlignment"], reverse=True)

    # ── 6. Best-performing resume ────────────────────────────────────────────
    best_resume: str | None = None
    best_rate = -1.0
    for rid, stats in resume_stats.items():
        rate = (stats["interviews"] / stats["total"]) if stats["total"] > 0 else 0
        if rate > best_rate:
            best_rate = rate
            best_resume = stats["name"]

    # ── 7. Lowest alignment category ─────────────────────────────────────────
    lowest_cat: str | None = None
    if snapshot:
        worst = min(snapshot, key=lambda s: s["avgAlignment"])
        lowest_cat = worst["category"]

    # ── 8. Build prose sections ──────────────────────────────────────────────
    what_this_means = _build_insights(snapshot, best_resume, lowest_cat)
    what_to_do = _build_recommendations(snapshot, lowest_cat, best_resume)
    what_to_do = [f"{i+1}. {item}" for i, item in enumerate(what_to_do)]

    # ── 9. Strip internal-only fields before returning ───────────────────────
    for item in snapshot:
        item.pop("interviewRateValue", None)

    return {
        "overallAlignment": overall,
        "snapshot": snapshot,
        "bestResume": best_resume,
        "lowestAlignment": lowest_cat,
        "whatThisMeans": what_this_means,
        "whatToDoNext": what_to_do,
    }
