"""
Adaptive Interview Logic — Phase 12
====================================
Central module for the two key adaptive decisions:
  1. should_continue(state)  → bool  — should we ask another question?
  2. compute_difficulty(state) → str — what difficulty level for the next question?

Keeping this separate from agents ensures all routing decisions are in one place
and easy to tune without touching agent prompts.
"""

import statistics

MIN_QUESTIONS = 3
MAX_QUESTIONS = 10


def _last_n_scores(state: dict, n: int = 3) -> list:
    scores = state.get("scores", [])
    return scores[-n:] if len(scores) >= n else scores


def should_continue(state: dict) -> bool:
    """
    Adaptive stopping logic.

    Rules:
    ─────
    • Always ask at least MIN_QUESTIONS (3) questions.
    • Never exceed MAX_QUESTIONS (10) — hard ceiling.
    • Stop EARLY if all three are true:
        - avg of last 3 scores >= 8.0  (strong performer)
        - variance of last 3 scores <= 1.0  (consistent)
        - at least 3 distinct topics covered
    • FORCE continue if any of:
        - avg score < 6.0  (needs more probing)
        - 1+ weak topics detected (user declared unfamiliarity)
        - score variance > 2.5  (very inconsistent, needs stabilisation)
    """
    questions    = state.get("questions", [])
    weak_topics  = state.get("weak_topics", [])
    topics_covered = state.get("topics_covered", [])
    n_asked      = len(questions)

    # Hard ceiling
    if n_asked >= MAX_QUESTIONS:
        return False

    # Always ask minimum
    if n_asked < MIN_QUESTIONS:
        return True

    last3 = _last_n_scores(state, 3)
    if not last3:
        return True

    avg   = sum(last3) / len(last3)
    var   = statistics.variance(last3) if len(last3) >= 2 else 999.0
    n_topics = len(set(topics_covered))

    # Force continue conditions (override early-stop)
    if avg < 6.0:
        return True
    if weak_topics:
        return True
    if var > 2.5:
        return True

    # Early stop conditions (all must be true)
    if avg >= 8.0 and var <= 1.0 and n_topics >= 3:
        return False

    # Default: keep going
    return True


def compute_difficulty(state: dict) -> str:
    """
    Determines the difficulty of the NEXT question.

    • Starts at 'easy' for Q1.
    • Moves to 'medium' after Q2.
    • Escalates to 'hard' once avg score >= 7 on last 3.
    • Drops back to 'medium' if user_confidence is 'basic'.
    • Drops to 'easy' if user_confidence is 'not_familiar'.
    • Always 'easy' if there are active weak_topics (recovery mode).
    """
    n_asked         = len(state.get("questions", []))
    last3           = _last_n_scores(state, 3)
    avg             = sum(last3) / len(last3) if last3 else 0.0
    confidence      = state.get("user_confidence")
    weak_topics     = state.get("weak_topics", [])

    if confidence == "not_familiar" or weak_topics:
        return "easy"
    if confidence == "basic":
        return "medium"

    if n_asked <= 1:
        return "easy"
    if n_asked == 2:
        return "medium"
    if avg >= 7.0:
        return "hard"
    if avg >= 5.0:
        return "medium"
    return "easy"
