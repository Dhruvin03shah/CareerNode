from fastapi import APIRouter, File, UploadFile, Form, HTTPException, Body
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
from backend.graph.workflow import run_graph
from backend.tools.llm import stream_llm
from backend.agents.interview_agent import build_interview_prompt
from backend.resume.parser import extract_resume_text
from backend.tools.sarvam_stt import audio_to_text
import json, io
from backend.tools.logger import log_api, log_error

router = APIRouter()

@router.post("/run")
async def run_pipeline(
    resume: Optional[UploadFile] = File(None),
    resume_text: Optional[str] = Form(None),
    role: str = Form(...),
    company: str = Form(...)
):
    log_api("/run", f"Starting new interview session for role: {role} at {company}")
    if resume is not None:
        content = await resume.read()
        extracted_text = extract_resume_text(content, resume.filename)
    elif resume_text:
        extracted_text = resume_text.strip()
    else:
        raise HTTPException(status_code=400, detail="Please provide a resume file or resume text.")

    if not extracted_text:
        raise HTTPException(status_code=400, detail="Could not extract text from the uploaded file.")

    initial_state = {
        "resume_text":          extracted_text,
        "structured_resume":    {},
        "extracted_skills":     [],
        "extracted_projects":   [],
        "role":                 role,
        "company":              company,
        "skills":               [],
        "questions":            [],
        "answers":              [],
        "scores":               [],
        "feedback":             [],
        "speaking_feedback":    [],
        "learning_path":        [],
        "ats_data":             {},
        # ── Phase 12 adaptive fields ──────────────────────────────
        "weak_topics":          [],
        "topics_covered":       [],
        "awaiting_familiarity": False,
        "user_confidence":      None,
        "question_count":       0,
    }

    result = run_graph(initial_state)
    result["resume_text"] = extracted_text
    return result


class AnswerRequest(BaseModel):
    state: dict
    answer: str
    speaking_duration_s: float = 30.0  # seconds the user spoke


@router.post("/answer")
def submit_answer(request: AnswerRequest):
    log_api("/answer", "Received user answer, resuming workflow")
    current_state = request.state
    answers = current_state.get("answers", [])
    answers.append(request.answer)
    current_state["answers"]        = answers
    current_state["current_answer"] = request.answer
    result = run_graph(current_state)
    return result


@router.post("/stream-answer")
async def stream_answer(request: AnswerRequest):
    """
    Runs the workflow (evaluation + state update) synchronously,
    then streams the NEW question token-by-token via SSE.
    """
    log_api("/stream-answer", "Received answer, streaming next question")
    current_state = request.state

    answers = current_state.get("answers", [])
    answers.append(request.answer)
    current_state["answers"]              = answers
    current_state["current_answer"]       = request.answer
    current_state["speaking_duration_s"]  = request.speaking_duration_s

    # Ensure fields are present even if old state was sent
    current_state.setdefault("weak_topics",          [])
    current_state.setdefault("topics_covered",        [])
    current_state.setdefault("question_count",        0)
    current_state.setdefault("depth_level",           0)
    current_state.setdefault("follow_up_count",       0)
    current_state.setdefault("current_topic",         "")
    current_state.setdefault("confidence_data",       {})

    new_state  = run_graph(current_state)
    is_complete = bool(new_state.get("learning_path"))

    async def event_stream():
        # ── Meta event — full state snapshot for the frontend ────────
        meta = {
            "scores":               new_state.get("scores", []),
            "questions":            new_state.get("questions", []),
            "answers":              new_state.get("answers", []),
            "feedback":             new_state.get("feedback", []),
            "speaking_feedback":    new_state.get("speaking_feedback", []),
            "skills":               new_state.get("skills", []),
            "role":                 new_state.get("role", ""),
            "company":              new_state.get("company", ""),
            "resume_text":          new_state.get("resume_text", ""),
            "learning_path":        new_state.get("learning_path", []),
            "resume_feedback":      new_state.get("resume_feedback", ""),
            "ats_data":             new_state.get("ats_data", {}),
            "complete":             is_complete,
            # ── Phase 12/13 ──────────────────────────────────────────────
            "weak_topics":          new_state.get("weak_topics", []),
            "topics_covered":       new_state.get("topics_covered", []),
            "awaiting_familiarity": new_state.get("awaiting_familiarity", False),
            "user_confidence":      new_state.get("user_confidence"),
            "question_count":       new_state.get("question_count", 0),
            "difficulty":           new_state.get("difficulty", "medium"),
            "depth_level":          new_state.get("depth_level", 0),
            "follow_up_count":      new_state.get("follow_up_count", 0),
            "current_topic":        new_state.get("current_topic", ""),
            "confidence_data":      new_state.get("confidence_data", {}),
        }
        yield f"event: meta\ndata: {json.dumps(meta)}\n\n"

        if is_complete:
            yield "event: done\ndata: {}\n\n"
            return

        # ── Stream the latest question token-by-token ─────────────────
        next_question = new_state["questions"][-1]

        import asyncio
        words = next_question.split(" ")
        for i, word in enumerate(words):
            token = word + (" " if i < len(words) - 1 else "")
            yield f"event: token\ndata: {json.dumps(token)}\n\n"
            await asyncio.sleep(0.03)

        yield "event: done\ndata: {}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")


@router.post("/speech-to-text")
async def speech_to_text(audio: UploadFile = File(...)):
    log_api("/speech-to-text", "Received audio file for STT")
    try:
        content = await audio.read()
        transcript = audio_to_text(content, audio.filename)
        return {"transcript": transcript}
    except Exception as e:
        log_error("/speech-to-text", str(e))
        raise HTTPException(status_code=500, detail=str(e))
