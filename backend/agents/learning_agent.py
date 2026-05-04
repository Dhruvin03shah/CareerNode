"""
Learning Agent — Phase 12
==========================
Generates a personalized learning path using both the per-question feedback
AND the weak_topics list accumulated during the session.
"""

from backend.tools.llm import call_llm
from backend.tools.db import save_interview
from backend.tools.logger import log_agent

def learning_agent(state: dict) -> dict:
    log_agent("LearningAgent", "Generating personalized learning path")
    save_interview(state)

    feedback_list = state.get("feedback", [])
    weak_topics   = state.get("weak_topics", [])
    scores        = state.get("scores", [])
    role          = state.get("role", "this role")

    feedback_text = "\n".join(f"- {f}" for f in feedback_list if f.strip())
    if not feedback_text:
        feedback_text = "No detailed feedback available."

    avg_score = round(sum(scores) / len(scores), 1) if scores else 0.0

    weak_topics_text = ""
    if weak_topics:
        weak_topics_text = (
            "\n\nTOPICS THE CANDIDATE DECLARED UNFAMILIAR (prioritise in the plan):\n"
            + "\n".join(f"- {t}" for t in weak_topics)
        )

    performance_label = (
        "strong performer (scores mostly 8+)"   if avg_score >= 8 else
        "competent (scores mostly 6–7)"          if avg_score >= 6 else
        "needs significant improvement (scores below 6)"
    )

    prompt = f"""You are a senior engineering mentor generating a personalised learning plan.

Candidate role:    {role}
Overall performance: {performance_label} (avg score: {avg_score}/10)

Interview feedback summary:
{feedback_text}
{weak_topics_text}

Generate a focused learning plan with 4–6 bullet points that:
1. Directly addresses the weak areas and unfamiliar topics above.
2. Gives specific, actionable steps (not vague advice).
3. Includes what to study, practice, or build.
4. If weak_topics exist, start with them.
5. Be concise — one bullet per action item.

Format: return ONLY the bullet points, each starting with "• ".
"""

    response = call_llm(prompt)

    # Parse bullet points (support *, -, or • prefixes)
    learning_path = [
        line.strip().lstrip("•*- ").strip()
        for line in response.split("\n")
        if line.strip() and line.strip()[0] in ("•", "*", "-")
    ]

    # Fallback
    if not learning_path:
        learning_path = [
            "Review core technical concepts related to the role.",
            "Practice structuring answers with real-world examples.",
            "Deepen knowledge of specific tools mentioned in the interview.",
        ]
        if weak_topics:
            for t in weak_topics:
                learning_path.insert(0, f"Study and practise: {t} — you marked this as unfamiliar.")

    return {"learning_path": learning_path}