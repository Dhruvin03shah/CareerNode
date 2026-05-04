"""
Resume Parser — Phase 16
========================
Handles two jobs:
  1. extract_resume_text()   — PDF / TXT → raw string
  2. parse_structured_resume() — raw string → structured JSON dict via LLM
"""

import io
import json
import re
from backend.tools.logger import log_agent, log_error, log_info


# ── 1. TEXT EXTRACTION ─────────────────────────────────────────────────────────

def extract_resume_text(file_bytes: bytes, filename: str) -> str:
    """
    Extract plain text from a PDF or TXT file.
    Tries pdfplumber first (better layout handling), falls back to PyPDF2.
    """
    filename_lower = filename.lower()

    if filename_lower.endswith(".pdf"):
        # ── Attempt 1: pdfplumber ──────────────────────────────────────
        try:
            import pdfplumber
            with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
                pages = [page.extract_text() or "" for page in pdf.pages]
            text = "\n".join(pages).strip()
            if text:
                log_info("ResumeParser", f"pdfplumber extracted {len(text)} chars")
                return text
        except Exception as e:
            log_error("ResumeParser", f"pdfplumber failed: {e} — trying PyPDF2")

        # ── Attempt 2: PyPDF2 fallback ─────────────────────────────────
        try:
            import PyPDF2
            reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
            text = "\n".join(
                page.extract_text() or "" for page in reader.pages
            ).strip()
            if text:
                log_info("ResumeParser", f"PyPDF2 extracted {len(text)} chars")
                return text
        except Exception as e:
            log_error("ResumeParser", f"PyPDF2 also failed: {e}")

        raise ValueError("Could not extract text from PDF. Please upload a text-selectable PDF.")

    else:
        # TXT / plain text
        try:
            text = file_bytes.decode("utf-8").strip()
            log_info("ResumeParser", f"TXT decoded: {len(text)} chars")
            return text
        except Exception as e:
            raise ValueError(f"Unsupported file format: {e}")


# ── 2. STRUCTURED PARSING ──────────────────────────────────────────────────────

_STRUCTURED_RESUME_SKELETON = {
    "skills": [],
    "projects": [],
    "experience": [],
    "education": [],
    "tools": [],
}

_PARSE_PROMPT_TEMPLATE = """You are an expert resume parser. Extract structured information from the resume below.

Return a single valid JSON object with EXACTLY these keys:

{{
  "skills": ["<skill1>", "<skill2>", ...],
  "projects": [
    {{
      "name": "<project name>",
      "description": "<1-2 sentence summary of what it does and what problem it solves>",
      "technologies": ["<tech1>", "<tech2>", ...]
    }}
  ],
  "experience": ["<job title at company, 1 line summary of responsibilities>", ...],
  "education": ["<degree, institution, year>", ...],
  "tools": ["<tool/framework/platform>", ...]
}}

Rules:
- Normalize technology names (e.g. "TensorFlow 2.x" → "TensorFlow", "postgres" → "PostgreSQL")
- Remove duplicate skills/tools
- Keep project descriptions concise but meaningful — include the tech stack and outcome
- List at most 15 skills, 10 tools, 5 projects, 5 experience entries
- If a section has no data, use an empty array []
- Return ONLY the JSON. No markdown, no explanation, no code fences.

Resume Text:
{resume_text}

Target Role: {role}
"""


def parse_structured_resume(resume_text: str, role: str, call_llm_fn) -> dict:
    """
    Calls the LLM to parse resume_text into a structured JSON dict.
    Returns the skeleton dict on any failure — never raises.
    """
    import copy
    skeleton = copy.deepcopy(_STRUCTURED_RESUME_SKELETON)

    if not resume_text or not resume_text.strip():
        log_error("ResumeParser", "Empty resume text — returning skeleton")
        return skeleton

    prompt = _PARSE_PROMPT_TEMPLATE.format(
        resume_text=resume_text[:4000],  # stay well within token limits
        role=role or "Software Engineer",
    )

    try:
        log_agent("ResumeParser", "Calling LLM for structured resume parsing")
        raw = call_llm_fn(prompt)

        if not raw:
            log_error("ResumeParser", "LLM returned empty response")
            return skeleton

        # ── Attempt 1: direct json.loads ───────────────────────────────
        try:
            parsed = json.loads(raw)
        except json.JSONDecodeError:
            # ── Attempt 2: extract JSON from markdown fences or surrounding text ─
            json_match = re.search(r'\{.*\}', raw, re.DOTALL)
            if json_match:
                parsed = json.loads(json_match.group())
            else:
                log_error("ResumeParser", "Could not locate JSON in LLM response")
                return skeleton

        # Validate and sanitize — ensure all expected keys exist
        result = {}
        result["skills"]     = _clean_list(parsed.get("skills", []))
        result["projects"]   = _clean_projects(parsed.get("projects", []))
        result["experience"] = _clean_list(parsed.get("experience", []))
        result["education"]  = _clean_list(parsed.get("education", []))
        result["tools"]      = _clean_list(parsed.get("tools", []))

        log_info("ResumeParser", (
            f"Parsed: {len(result['skills'])} skills, "
            f"{len(result['projects'])} projects, "
            f"{len(result['experience'])} experience entries"
        ))
        return result

    except Exception as e:
        log_error("ResumeParser", f"Structured parsing failed: {e}")
        return skeleton


# ── Internal helpers ───────────────────────────────────────────────────────────

def _clean_list(items) -> list:
    """Filter to non-empty strings, dedupe, truncate."""
    if not isinstance(items, list):
        return []
    seen = set()
    out = []
    for item in items:
        if isinstance(item, str) and item.strip() and item.strip().lower() not in seen:
            seen.add(item.strip().lower())
            out.append(item.strip())
    return out[:15]


def _clean_projects(items) -> list:
    """Validate project dicts."""
    if not isinstance(items, list):
        return []
    out = []
    for p in items:
        if not isinstance(p, dict):
            continue
        name = str(p.get("name", "")).strip()
        desc = str(p.get("description", "")).strip()
        techs = _clean_list(p.get("technologies", []))
        if name:
            out.append({"name": name, "description": desc, "technologies": techs})
    return out[:5]
