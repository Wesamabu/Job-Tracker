from google.cloud import aiplatform
from vertexai.language_models import TextEmbeddingModel
import numpy as np
import os

# 1. Initialize Vertex AI with your specific Project ID and Region
# Setting the location to 'us-central1' ensures the API finds the model.
PROJECT_ID = "job-tracker-gcp"
LOCATION = "us-central1"

aiplatform.init(project=PROJECT_ID, location=LOCATION)

def get_embedding(text: str) -> list[float]:
    """
    Calls Vertex AI 'text-embedding-004' and returns the embedding vector.
    This fulfills the requirement for Issues #2, #3, and #4.
    """
    if not text:
        return []

    try:
        # Use the latest stable model version to avoid 404/deprecation errors
        model = TextEmbeddingModel.from_pretrained("text-embedding-004")
        
        # Vertex AI expects a list of strings
        embeddings = model.get_embeddings([text])
        
        # Extract values from the first (and only) result and convert to floats
        return [float(x) for x in embeddings[0].values]
        
    except Exception as e:
        print(f"Vertex AI Error: {e}")
        return []

def compute_similarity(vec1: list[float], vec2: list[float]) -> float:
    """
    Returns cosine similarity score between two embedding vectors (0.0 to 1.0).
    Used to match resumes against job descriptions.
    """
    if not vec1 or not vec2:
        return 0.0

    # Convert lists to numpy arrays for vector math
    v1 = np.array(vec1)
    v2 = np.array(vec2)
    
    # Cosine Similarity Formula: (v1 • v2) / (||v1|| * ||v2||)
    dot_product = np.dot(v1, v2)
    norm_v1 = np.linalg.norm(v1)
    norm_v2 = np.linalg.norm(v2)
    
    # Avoid division by zero
    if norm_v1 == 0 or norm_v2 == 0:
        return 0.0
        
    return float(dot_product / (norm_v1 * norm_v2))