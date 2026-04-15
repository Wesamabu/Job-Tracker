from fastapi import APIRouter, HTTPException
from bs4 import BeautifulSoup
import httpx
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.post("/parse-url")
async def parse_job_url(payload: dict):
    url = payload.get("url")
    if not url:
        raise HTTPException(status_code=400, detail="URL is required")

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }

    async with httpx.AsyncClient(timeout=10.0, headers=headers, follow_redirects=True) as client:
        try:
            response = await client.get(url)

            if response.status_code != 200:
                raise HTTPException(status_code=422, detail=f"Site returned error code: {response.status_code}")

            soup = BeautifulSoup(response.text, "html.parser")

            # ── Company Name ──────────────────────────────────────────────────
            # Try og:site_name meta tag first (works on most sites)
            # Fall back to extracting from the domain name
            company = "Unknown Company"
            og_site = soup.find("meta", property="og:site_name")
            if og_site and og_site.get("content"):
                company = og_site["content"]
            else:
                company = url.split("//")[-1].split(".")[0].capitalize()

            # ── Job Role ──────────────────────────────────────────────────────
            # Try h1 first, then fall back to page title
            role = "Unknown Role"
            h1_tag = soup.find("h1")
            if h1_tag:
                role = h1_tag.get_text().strip()
            elif soup.title and soup.title.string:
                role = soup.title.string.split("|")[0].split("-")[0].strip()

            # ── Job Description ───────────────────────────────────────────────
            # Try common HTML patterns used by job sites that allow scraping.
            # LinkedIn and Indeed block scraping so this will be empty for them.
            # The user will need to paste the description manually in that case.
            description = ""

            selectors = [
                # Generic patterns that work on many company career pages
                {"tag": "div", "attr": {"class": lambda c: c and "job-description" in " ".join(c).lower()}},
                {"tag": "div", "attr": {"class": lambda c: c and "description" in " ".join(c).lower()}},
                {"tag": "section", "attr": {"class": lambda c: c and "description" in " ".join(c).lower()}},
                {"tag": "div", "attr": {"id": lambda i: i and "description" in i.lower()}},
                # Indeed
                {"tag": "div", "attr": {"id": "jobDescriptionText"}},
            ]

            for selector in selectors:
                content = soup.find(selector["tag"], selector["attr"])
                if content:
                    description = content.get_text(separator="\n").strip()
                    break

            # Fallback: use the meta description tag if nothing else was found.
            # Most job sites include a summary of the role here even when the
            # full description is JavaScript-rendered.
            if not description:
                meta_desc = soup.find("meta", attrs={"name": "description"})
                if meta_desc and meta_desc.get("content"):
                    description = meta_desc["content"].strip()

            # Fallback: try og:description
            if not description:
                og_desc = soup.find("meta", property="og:description")
                if og_desc and og_desc.get("content"):
                    description = og_desc["content"].strip()

            return {
                "company_name": company,
                "role": role,
                "job_description": description,
            }

        except httpx.RequestError as exc:
            logger.error(f"Network error: {exc}")
            raise HTTPException(status_code=422, detail="Network error: Could not reach the website.")
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Parsing error: {e}")
            raise HTTPException(status_code=422, detail="Could not extract data from this URL.")
