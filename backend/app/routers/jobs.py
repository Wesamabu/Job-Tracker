from fastapi import APIRouter, HTTPException
from bs4 import BeautifulSoup
import httpx
import logging

#Setup logging to see errors in your terminal
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
            
            #fallback trigger 
            if response.status_code != 200:
                raise HTTPException(status_code=422, detail=f"Site returned error code: {response.status_code}")

            soup = BeautifulSoup(response.text, "html.parser")

            #Extracting Company Name
            company = "Unknown Company"
            og_site = soup.find("meta", property="og:site_name")
            if og_site:
                company = og_site["content"]
            elif "linkedin.com" in url:
                company = "LinkedIn"
            elif "indeed.com" in url:
                company = "Indeed"
            else:
                #Fallback: Use the domain name
                company = url.split("//")[-1].split(".")[0].capitalize()

            #Extract Job Role
            role = "Unknown Role"
           
            h1_tag = soup.find("h1")
            if h1_tag:
                role = h1_tag.get_text().strip()
            elif soup.title:
        
                role = soup.title.string.split("|")[0].split("-")[0].strip()

            return {
                "company_name": company,
                "role": role,
                "job_description": "Automatic extraction successful. Please verify and edit details below."
            }

        except httpx.RequestError as exc:
            logger.error(f"Network error: {exc}")
            raise HTTPException(status_code=422, detail="Network error: Could not reach the website.")
        except Exception as e:
            logger.error(f"Parsing error: {e}")
            raise HTTPException(status_code=422, detail="Safe fallback: Could not extract data from this specific URL.")