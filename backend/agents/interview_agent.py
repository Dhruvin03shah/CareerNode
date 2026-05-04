"""
Interview Agent — Phase 12 v2 (Depth-Aware)
=============================================
Generates the next interview question using:
  - depth_level / follow_up_count for staying on topic or probing deeper
  - adaptive_logic.compute_difficulty() for difficulty scaling
  - weak_topics to avoid repeating painful areas
  - topics_covered to enforce diversity
"""

from backend.tools.llm import call_llm
from backend.rag.retriever import retrieve_context
from backend.agents.adaptive_logic import compute_difficulty
from backend.tools.logger import log_agent
from backend.resume.resume_rag import build_resume_index, retrieve_resume_context


def build_interview_prompt(state: dict) -> str:
    """Build the LLM prompt for the next interview question based on current state."""
    skills          = state.get("skills", [])
    role            = state.get("role", "Candidate")
    company         = state.get("company", "a company")
    resume_text     = state.get("resume_text", "")
    questions       = state.get("questions", [])
    answers         = state.get("answers", [])
    weak_topics     = state.get("weak_topics", [])
    depth_level     = state.get("depth_level", 0)
    follow_up_count = state.get("follow_up_count", 0)
    current_topic   = state.get("current_topic", "")
    extracted_projects = state.get("extracted_projects", [])

    # ── 1. Generic Industry Context ──────────────────────────────────
    query   = f"Interview questions for {role} at {company} regarding {', '.join(skills)}"
    context = retrieve_context(query)
    
    # ── 2. Dynamic Resume RAG Context ────────────────────────────────
    index, chunks = build_resume_index(resume_text)
    resume_query = current_topic if current_topic else f"{role} {', '.join(skills)}"
    resume_context = retrieve_resume_context(resume_query, index, chunks) if index else ""
    
    project_text = "None extracted."
    if extracted_projects:
        project_text = "\n".join(
            [f"- {p.get('name', 'Project')}: {p.get('description', '')} (Tech: {', '.join(p.get('technologies', []))})" for p in extracted_projects]
        )

    difficulty  = compute_difficulty(state)
    last_answer = answers[-1] if answers else ""
    used_topics = "\n".join([f"- {q}" for q in questions]) if questions else "None yet"

    weak_ctx = ""
    if weak_topics:
        weak_ctx = (
            f"\nWEAK TOPICS (user scored poorly here -- avoid repeating):\n"
            + "\n".join(f"- {t}" for t in weak_topics)
            + "\nPrefer new topics instead."
        )

    topic_areas = (
        "- Machine Learning fundamentals\n"
        "- Deep Learning / NLP\n"
        "- SQL / Data Analysis\n"
        "- System Design\n"
        "- Real-world projects\n"
        "- Problem-solving\n"
        "- Behavioral / communication"
    )

    if last_answer:
        last_question = questions[-1] if questions else ""

        # ── Depth-aware instruction block ───────────────────────────────
        if depth_level >= 1:
            depth_instruction = f"""You are currently doing a FOLLOW-UP on the topic: "{current_topic}" (follow-up {follow_up_count}/2).

The candidate's previous answer was vague, short, or lacked depth. DO NOT switch to a new topic yet.

Your goal: probe DEEPER on the SAME topic.
- Ask for a concrete, specific example or real-world application.
- Ask them to walk you through implementation step-by-step.
- Ask for metrics, numbers, or measurable outcomes.
- Challenge a vague claim they made.

Example approaches (pick one that fits naturally):
- "You mentioned [X] — can you walk me through exactly how you implemented that?"
- "What were the actual results or metrics you saw from this?"
- "How would you handle [a specific edge case or challenge] in that scenario?"
- "Can you give me a concrete example from your experience?"

{'' if follow_up_count < 2 else 'This is your FINAL follow-up on this topic. After this question, plan to move on to a completely new topic.'}"""
        else:
            depth_instruction = """You are deciding whether to probe deeper or move to a new topic.

Decision rules:
- If the candidate's answer was STRONG, detailed, and used examples: acknowledge it briefly, then smoothly transition to a new topic.
- If the answer was SHORT or VAGUE (e.g., "I did some basic analysis", "yes I've used it"): DO NOT switch topics. Ask a natural follow-up question to probe deeper.
- If the candidate said "I don't know" or "I'm not familiar": acknowledge gracefully and switch to a completely different topic."""

        prompt = f"""You are an expert, conversational AI technical interviewer for a {role} role at {company}.

The candidate just answered this:
Question: {last_question}
Candidate's Answer: {last_answer}

{depth_instruction}

IMPORTANT RULES:
1. React NATURALLY — like a skilled human interviewer who has CAREFULLY READ the candidate's resume.
2. DO NOT use robotic phrases like "Let's move to a new topic" or "Great answer!"
3. If staying on topic, tie your follow-up directly to something specific they said.
4. If switching topics, preferentially ask about one of their PROJECTS listed below. Ask decision-based questions (e.g. "Why did you choose X over Y in this project?"), optimization questions, or ask them to explain a specific technical implementation detail.
5. Avoid generic textbook questions (e.g. "What is machine learning?"). Instead, challenge their claims.
6. Keep your response concise and clear (max 3-4 lines).
7. The question should be {difficulty.upper()} level for a {role} role.
8. If the candidate gives an extremely short, low-effort answer (like just "yes" or "no"), politely but firmly call it out (e.g., "A simple 'yes' isn't enough for this interview, please elaborate...") and re-ask the core of the previous question.

Already covered topics (DO NOT repeat):
{used_topics}
{weak_ctx}

Available topic areas to draw from:
{topic_areas}

Candidate's Extracted Projects:
{project_text}

Relevant Resume Details (RAG Context):
{resume_context if resume_context else "No specific resume context available. Fallback to generic interview."}

General Industry Context:
{context}

Resume summary: {resume_text[:500]}

Return ONLY your response to the candidate. Nothing else."""

    else:
        prompt = f"""You are an expert, conversational AI technical interviewer.

Your task is to warmly welcome the candidate and ask the very first interview question.

IMPORTANT RULES:
1. Start with a brief, warm, professional greeting. Introduce yourself as their AI interviewer for the {role} role at {company}.
2. Smoothly transition into the first {difficulty}-level interview question.
3. The question MUST be relevant to the candidate's skills and directly reference one of their listed projects or experiences.
4. Ask a decision-based or implementation-specific question ("Why did you use X for Y?"), not a generic definition.
5. Keep the total response clear and concise (max 4-5 lines).

Candidate's Extracted Projects:
{project_text}

Relevant Resume Details (RAG Context):
{resume_context if resume_context else "No specific resume context available. Fallback to generic interview."}

General Industry Context:
{context}

Resume: {resume_text[:500]}
Role: {role}
Company: {company}

Return ONLY your greeting and the first question."""

    return prompt


def interview_agent(state: dict) -> dict:
    log_agent("InterviewAgent", f"Generating next question for topic: {state.get('current_topic', 'new')}")
    prompt    = build_interview_prompt(state)
    question  = call_llm(prompt)

    questions  = state.get("questions", [])
    difficulty = compute_difficulty(state)

    return {
        "questions":        [question],
        "current_question": question,
        "question_count":   len(questions) + 1,
        "difficulty":       difficulty,
        "last_answer":      state.get("answers", [""])[-1] if state.get("answers") else "",
        "user_confidence":  None,
    }
