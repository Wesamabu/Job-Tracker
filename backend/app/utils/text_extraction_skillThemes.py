import os
import re
import fitz  # PyMuPDF
from docx import Document
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

# Initialize the Groq client
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def extract_skill_text_from_file(file_path: str) -> str:
    """
    Extract CLEAN text optimized for skill extraction (NOT full document dump).

    Purpose:
    - Remove noise from resumes
    - Normalize text for Groq skill extraction
    - Improve skill detection accuracy
    """

    if not os.path.exists(file_path):
        return ""

    ext = os.path.splitext(file_path)[1].lower()
    text = ""

    try:
        # -------------------------
        # PDF EXTRACTION
        # -------------------------
        if ext == ".pdf":
            with fitz.open(file_path) as doc:
                for page in doc:
                    page_text = page.get_text()
                    # Remove extra line breaks & hyphen breaks
                    page_text = page_text.replace("-\n", "")
                    page_text = page_text.replace("\n", " ")
                    text += page_text + " "

        # -------------------------
        # DOCX EXTRACTION
        # -------------------------
        elif ext == ".docx":
            doc = Document(file_path)
            raw_text = " ".join([para.text for para in doc.paragraphs])
            text += raw_text

        # -------------------------
        # AI CLEANING STEP (Normalize & refine)
        # -------------------------
        if text:
            prompt = f"""
            Clean and normalize the text extracted from a document.

            Rules:
            - Remove irrelevant information (like dates, addresses, etc.)
            - Fix line breaks, hyphenations, and spacing
            - Return clean, structured text suitable for skill extraction
            - Keep only professional/technical content
            - Lowercase all text for consistency

            Text:
            {text}
            """

            response = client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[{"role": "user", "content": prompt}],
                temperature=0
            )

            cleaned_text = response.choices[0].message.content.strip()
            return cleaned_text
        else:
            return ""

    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return ""
