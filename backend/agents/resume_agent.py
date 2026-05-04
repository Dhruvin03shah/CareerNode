from backend.tools.llm import call_llm
from backend.tools.logger import log_agent
from backend.resume.parser import parse_structured_resume

from backend.tools.db import save_resume_evaluation
import json

def resume_agent(state):
    log_agent("ResumeAgent", "Extracting structured data from resume")
    resume_text = state.get("resume_text", "")
    role = state.get("role", "Candidate")
    user_id = state.get("user_id", 0)
    
    structured_data = parse_structured_resume(resume_text, role, call_llm)
    extracted_skills = structured_data.get("skills", [])
    extracted_projects = structured_data.get("projects", [])
    
    top_10_skills = extracted_skills[:10] if extracted_skills else []
    
    # Generate Resume Feedback
    feedback_prompt = f"Review the following resume text and provide 2-3 concise sentences of constructive feedback on how the candidate can improve their resume for a {state.get('role', 'job')} role. Resume: {resume_text}"
    resume_feedback = call_llm(feedback_prompt)
    if not resume_feedback or "Fallback" in resume_feedback:
        resume_feedback = "Ensure your resume clearly highlights your impact using metrics and aligns your skills with the job description."
    
    # ── ATS Scoring & AI Feedback ──
    log_agent("ResumeAgent", "Generating ATS Score and detailed feedback")
    ats_prompt = f"""
Analyze the following resume for the target role of "{role}".
Evaluate it based on these 5 criteria:
1. Structure (20 points): sections, clarity, bullet points.
2. Keyword Match (30 points): match with role-specific keywords.
3. Projects & Experience (20 points): real projects, metrics.
4. Technical Depth (15 points): technologies, tools used.
5. Clarity & Impact (15 points): action verbs, concise, outcomes.

You must output a strictly valid JSON object exactly matching this schema:
{{
  "ats_score": 85,
  "keyword_match_score": 75,
  "strengths": ["list", "of", "strings"],
  "weaknesses": ["list", "of", "strings"],
  "suggestions": ["list", "of", "actionable", "strings"],
  "missing_keywords": ["list", "of", "missing", "skills"],
  "improved_bullets": [
    {{ "original": "weak bullet from resume", "improved": "rewritten bullet with metrics" }}
  ]
}}

Resume Text:
{resume_text}

Output only the JSON, no markdown formatting or extra text.
"""
    ats_response = call_llm(ats_prompt)
    ats_data = {}
    try:
        # Clean potential markdown formatting
        cleaned = ats_response.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        elif cleaned.startswith("```"):
            cleaned = cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
            
        ats_data = json.loads(cleaned.strip())
        
        # Save to DB
        save_resume_evaluation(user_id, role, ats_data)
        log_agent("ResumeAgent", f"ATS scoring completed. Score: {ats_data.get('ats_score')}")
    except Exception as e:
        log_agent("ResumeAgent", f"Failed to parse or save ATS data: {e}")
    
    return {
        "skills": top_10_skills,
        "extracted_skills": extracted_skills,
        "extracted_projects": extracted_projects,
        "structured_resume": structured_data,
        "resume_feedback": resume_feedback,
        "ats_data": ats_data
    }
