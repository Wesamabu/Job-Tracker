import fitz  # PyMuPDF
from docx import Document
import os

def extract_text_from_file(file_path: str) -> str:
    """
    Reads a file from disk and returns the plain text content.
    Supported formats: .pdf, .docx
    """
    if not os.path.exists(file_path):
        return ""

    ext = os.path.splitext(file_path)[1].lower()
    text = ""

    try:
        if ext == ".pdf":
            # Using PyMuPDF to extract text from PDF
            with fitz.open(file_path) as doc:
                for page in doc:
                    text += page.get_text()
        
        elif ext == ".docx":
            # Using python-docx to extract text from Word files
            doc = Document(file_path)
            text = "\n".join([para.text for para in doc.paragraphs])
            
        return text.strip()
    
    except Exception as e:
        # Log error but don't crash the app
        print(f"Error reading {file_path}: {e}")
        return ""