import os
import re
import fitz  # PyMuPDF
from docx import Document
from dotenv import load_dotenv

load_dotenv()


def extract_skill_text_from_file(file_path: str) -> str:
    """
    Extract raw text from a resume PDF or DOCX for skill extraction.
    """
    if not os.path.exists(file_path):
        return ""

    ext = os.path.splitext(file_path)[1].lower()
    text = ""

    try:
        if ext == ".pdf":
            with fitz.open(file_path) as doc:
                for page in doc:
                    page_text = page.get_text()
                    page_text = page_text.replace("-\n", "")
                    page_text = page_text.replace("\n", " ")
                    text += page_text + " "

        elif ext == ".docx":
            doc = Document(file_path)
            text = " ".join([para.text for para in doc.paragraphs])

        return re.sub(r"\s+", " ", text).strip()

    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return ""
