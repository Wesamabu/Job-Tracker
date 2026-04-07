from vertexai.language_models import TextEmbeddingModel

def get_embeddings(text: str):
    # This is the "AI Brain" for matching jobs to resumes
    model = TextEmbeddingModel.from_pretrained("text-embedding-004")
    embeddings = model.get_embeddings([text])
    return [e.values for e in embeddings][0]