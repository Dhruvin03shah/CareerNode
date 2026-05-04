"""
Planner Agent — Phase 12
==========================
Routes the LangGraph workflow to the correct next node.

Flow:
  START        → resume_agent (if no skills yet)
  resume_agent → interview_agent (first question)
  interview_agent → __end__ (wait for human answer)
  evaluator_agent → familiarity_agent (if awaiting_familiarity)
  evaluator_agent → interview_agent   (should_continue)
  evaluator_agent → learning_agent    (should stop)
  familiarity_agent → interview_agent (always — familiarity sets up context, next Q is generated)
"""

from backend.agents.adaptive_logic import should_continue
from backend.tools.logger import log_agent

def planner_router(state: dict) -> str:
    log_agent("PlannerAgent", "Deciding next node in the graph")
    skills    = state.get("skills", [])
    questions = state.get("questions", [])
    answers   = state.get("answers", [])
    feedback  = state.get("feedback", [])

    # ── Step 1: Need skills from resume first ─────────────────────────
    if not skills:
        log_agent("PlannerAgent", "Routing to -> resume_agent")
        return "resume_agent"

    # ── Step 2: Waiting for human to answer the current question ──────
    if len(answers) < len(questions):
        log_agent("PlannerAgent", "Routing to -> __end__ (Waiting for user answer)")
        return "__end__"

    # ── Step 3: Evaluate the most recent answer ───────────────────────
    if len(feedback) < len(answers):
        log_agent("PlannerAgent", "Routing to -> evaluator_agent")
        return "evaluator_agent"

    # ── Step 5: Adaptive continue / stop ─────────────────────────────
    if len(questions) == len(answers) == len(feedback):
        if should_continue(state):
            log_agent("PlannerAgent", "Routing to -> interview_agent (Continuing interview)")
            return "interview_agent"
        else:
            log_agent("PlannerAgent", "Routing to -> learning_agent (Interview complete)")
            return "learning_agent"

    log_agent("PlannerAgent", "Routing to -> __end__ (Fallback)")
    return "__end__"
