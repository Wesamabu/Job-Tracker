from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
def health_check():
    """Simple health check endpoint. Returns 200 OK if the server is running."""
    return {"status": "ok"}