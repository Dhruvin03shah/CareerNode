import operator
from typing import Annotated, List, TypedDict, Optional

class State(TypedDict, total=False):
    # ── Identity & Resume ────────────────────────────────
    user_id: int
    resume_text: str
    structured_resume: dict
    extracted_skills: List[str]
    extracted_projects: List[dict]
    skills: List[str]
    resume_feedback: str
    role: str
    company: str
    ats_data: dict

    # ── Interview Arrays (operator.add = append-only via agents) ─
    questions: Annotated[List[str], operator.add]
    answers:   Annotated[List[str], operator.add]
    scores:    Annotated[List[float], operator.add]
    feedback:  Annotated[List[str], operator.add]
    speaking_feedback: Annotated[List[List[str]], operator.add]

    # ── Learning Output ──────────────────────────────────
    learning_path: List[str]

    # ── Per-Turn Convenience Fields ──────────────────────
    current_question: str
    current_answer:   str
    last_answer:      str

    # ── Adaptive Interview Engine (Phase 12) ─────────────
    question_count:       int           # total questions asked so far
    difficulty:           str           # "easy" | "medium" | "hard"
    current_topic:        str           # topic tag of the current question
    topics_covered:       List[str]     # one tag per question asked
    weak_topics:          List[str]     # topics user marked as "not familiar"
    user_confidence:      Optional[str] # "strong" | "basic" | "not_familiar" | None

    # ── Self-Awareness Flow Control (Phase 12) ────────────
    awaiting_familiarity: bool          # True → frontend shows 1/2/3 buttons
    familiarity_response: Optional[str] # "1" | "2" | "3"

    # ── Depth Tracking (Phase 12 v2) ──────────────────────
    depth_level:          int           # 0=main Q, 1=follow-up, 2=deep probe (then switch)
    follow_up_count:      int           # how many follow-ups on the current topic so far

    # ── Voice Confidence (Phase 13) ────────────────────────
    speaking_duration_s:  float         # seconds the user spoke (sent from frontend)
    confidence_data:      dict          # {confidence_score, level, signals, wpm, filler_count}
