from fastapi import APIRouter, HTTPException
from app.utils.scraper import scrape_job_details
# Import the flexible schema we just created
from app.schemas import JobUrlRequest

router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.post("/parse-url")
async def parse_job_url(request: JobUrlRequest):
    # Strictly using the 'url' field as per requirements
    target_url = request.url

    # Call the scraper logic
    data = scrape_job_details(target_url)
    
    if not data or not data.get("job_description"):
        raise HTTPException(
            status_code=422, 
            detail="Could not automatically parse this URL. Please enter details manually."
        )
        
    return data