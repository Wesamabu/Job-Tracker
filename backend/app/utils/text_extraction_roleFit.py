import os
import json
import re
from collections import defaultdict
from typing import List

import fitz  # PyMuPDF
from groq import Groq
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

# your existing imports
from app.database import get_db
from app.models import Resume, Application, User

router = APIRouter()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# -------------------------------------------------
# PDF TEXT EXTRACTION
# -------------------------------------------------
def extract_text_from_pdf(file_path: str) -> str:
    if not os.path.exists(file_path):
        return ""

    text = ""
    try:
        with fitz.open(file_path) as doc:
            for page in doc:
                page_text = page.get_text()
                page_text = page_text.replace("-\n", "")
                page_text = page_text.replace("\n", " ")
                text += page_text + " "

        text = re.sub(r"\s+", " ", text).lower().strip()
        return text

    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return ""


# -------------------------------------------------
# AI SKILL EXTRACTION
# -------------------------------------------------
def extract_skills(text: str) -> List[str]:
    prompt = f"""
Extract ONLY meaningful technical and professional skills.

Rules:
- Return ONLY a valid JSON array
- No explanation
- No extra text
- No duplicates
- Lowercase only

Text:
{text}
"""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        temperature=0
    )

    content = response.choices[0].message.content.strip()

    try:
        return json.loads(content)
    except json.JSONDecodeError:
        match = re.search(r"\[.*?\]", content, re.S)
        if match:
            try:
                return json.loads(match.group())
            except:
                return []

    return []


