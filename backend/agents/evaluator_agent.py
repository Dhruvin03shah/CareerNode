"""
Evaluator Agent — Phase 13 (Voice + Confidence)
================================================
Evaluates the candidate's answer and decides:
  - depth_level: 0 = main Q, 1 = follow-up, 2 = deep probe -> then switch
  - follow_up_count: total follow-ups on the current topic
  - weak_topics: topics where user scores < 4 across turns
  - confidence_data: voice-based confidence signals
"""

from backend.tools.llm import call_llm
import re, json, math
from backend.tools.logger import log_agent, log_info, log_error

FILLER_WORDS = ["um", "uh", "like", "you know", "basically", "literally",
                "actually", "so", "right", "I mean", "kind of", "sort of"]

def compute_voice_confidence(transcript: str, speaking_duration_s: float) -> dict:
    """Heuristic voice confidence from transcript + speaking duration."""
    words = transcript.split()
    word_count = len(words)
    duration = max(speaking_duration_s, 1)  # avoid /0

    # Words per minute
    wpm = (word_count / duration) * 60

    # Filler word count
    lower = transcript.lower()
    filler_count = sum(lower.count(fw) for fw in FILLER_WORDS)
    filler_ratio = filler_count / max(word_count, 1)

    # Sentence completion (ends with proper punctuation)
    has_complete_sentences = bool(re.search(r'[.!?]', transcript))

    # Score components (0–100)
    # Speed: ideal 120-160 WPM
    if 120 <= wpm <= 160:
        speed_score = 100
    elif wpm < 80 or wpm > 200:
        speed_score = 30
    elif wpm < 120:
        speed_score = 50 + (wpm - 80) * 1.25  # 50->100 as wpm 80->120
    else:
        speed_score = 100 - (wpm - 160) * 0.7  # decay after 160

    filler_score = max(0, 100 - filler_count * 15)  # each filler -15
    length_score = min(100, (word_count / 80) * 100)  # ideal ~80 words
    structure_score = 70 if has_complete_sentences else 40

    overall = math.floor(
        speed_score * 0.3 +
        filler_score * 0.3 +
        length_score * 0.2 +
        structure_score * 0.2
    )
    overall = max(0, min(100, overall))

    if overall >= 70:
        level = "High"
    elif overall >= 40:
        level = "Medium"
    else:
        level = "Low"

    signals = []
    if wpm < 100:
        signals.append("Speaking too slowly — try to maintain a steady pace")
    elif wpm > 180:
        signals.append("Speaking too fast — slow down for clarity")
    else:
        signals.append(f"Good speaking speed ({int(wpm)} WPM)")

    if filler_count > 3:
        signals.append(f"Frequent filler words ({filler_count} detected) — try to reduce 'um', 'uh', etc.")
    elif filler_count > 0:
        signals.append(f"Minor filler words ({filler_count}) — mostly clear")
    else:
        signals.append("Excellent — no filler words detected")

    if word_count < 30:
        signals.append("Answer was too short — elaborate more")
    elif word_count > 200:
        signals.append("Answer was too long — be more concise")
    else:
        signals.append("Good answer length")

    if not has_complete_sentences:
        signals.append("Try to speak in complete sentences")

    return {
        "confidence_score": overall,
        "level": level,
        "signals": signals,
        "wpm": int(wpm),
        "filler_count": filler_count,
        "word_count": word_count,
    }

# ── Topic keyword extractor (no extra LLM call, uses heuristics) ─────
TOPIC_KEYWORDS = {
    "Machine Learning":   ["machine learning", "ml", "model", "training", "overfitting", "bias", "regression", "classification", "feature"],
    "Deep Learning / NLP":["deep learning", "neural", "nlp", "transformer", "bert", "llm", "embedding", "attention", "lstm", "cnn"],
    "SQL / Data Analysis":["sql", "query", "join", "aggregate", "database", "pandas", "data analysis", "pivot", "group by"],
    "System Design":      ["system design", "scale", "microservice", "api", "latency", "throughput", "architecture", "distributed", "cache"],
    "Real-world Projects":["project", "built", "deployed", "production", "pipeline", "workflow", "shipping"],
    "Problem Solving":    ["algorithm", "complexity", "optimize", "time complexity", "space", "recursion", "dynamic programming"],
    "Behavioral":         ["team", "conflict", "leadership", "deadline", "challenge", "communication", "collaboration"],
}

def extract_topic(text: str) -> str:
    """Heuristic keyword match against the question text."""
    lower = text.lower()
    best_topic = "General"
    best_hits = 0
    for topic, keywords in TOPIC_KEYWORDS.items():
        hits = sum(1 for kw in keywords if kw in lower)
        if hits > best_hits:
            best_hits = hits
            best_topic = topic
    return best_topic


FAMILIARITY_QUESTION_TEMPLATE = (
    "It seems you might be struggling with this topic. "
    "How familiar are you with **{topic}**?\n\n"
    "Reply with:\n"
    "**1** — Strong (I know this, ask me a deeper question)\n"
    "**2** — Basic (I know the basics, make it simpler)\n"
    "**3** — Not familiar (Skip this topic, mark for learning)"
)


def evaluator_agent(state: dict) -> dict:
    """Evaluate answer and compute both content score and voice confidence."""
    speaking_duration_s = float(state.get("speaking_duration_s", 30))
    transcript = state.get("current_answer", "")

    # Compute voice confidence from heuristics
    confidence_data = compute_voice_confidence(transcript, speaking_duration_s)

    log_agent("EvaluatorAgent", f"Evaluating answer | duration={speaking_duration_s}s | confidence={confidence_data['level']}")

    question = state.get("current_question", "")
    answer   = state.get("current_answer", "")

    prompt = f"""You are a strict technical interviewer evaluating a candidate's answer.

Your job is to critically evaluate the answer — NOT to be lenient.

---

# 🎯 Evaluation Criteria

Score the answer based on:

1. Technical Accuracy (0–10)
2. Depth of Explanation (0–10)
3. Clarity & Structure (0–10)
4. Use of Examples / Real-world Thinking (0–10)
5. Speaking Quality & Communication (0–10) (Look for filler words like 'um', 'uh', overly short or overly long rambling answers, and coherent structuring)

---

# ⚠️ Strict Scoring Rules

* DO NOT give high scores easily
* Average answers should be 5–7
* Only strong, detailed, well-reasoned answers should be 8–10
* If answer is shallow, generic, or partially incorrect → score below 6
* If answer lacks examples → reduce score
* If answer is vague or surface-level → penalize
* If answer is a single word, "I don't know", or clearly off-topic → score 1–3

---

# 📌 Important Instructions

* Be honest and critical
* Point out EXACT weaknesses
* Do NOT give generic praise
* Avoid repeating the question
* Give actionable feedback (how to improve)

---

# 🧾 Output Format (STRICT)

Return in this EXACT format:

SCORE: <number between 1 and 10>

FEEDBACK:

* Strengths:

  * ...
* Weaknesses:

  * ...
* How to Improve:

  * ...

SPEAKING_FEEDBACK:
["feedback point 1 about filler words or clarity", "feedback point 2 about structure or length"]

---

# 📥 Input

Question:
{question}

Answer:
{answer}
"""

    response = call_llm(prompt)

    # Defaults
    score    = 5.0
    feedback = "Answer was not detailed enough. Provide concrete examples and deeper technical reasoning."
    speaking_feedback_list = []

    try:
        score_match = re.search(r'SCORE:\s*([\d.]+)', response, re.IGNORECASE)
        if score_match:
            score = max(1.0, min(10.0, float(score_match.group(1))))

        feedback_match = re.search(r'FEEDBACK:\s*(.*?)(?:SPEAKING_FEEDBACK:|$)', response, re.IGNORECASE | re.DOTALL)
        if feedback_match:
            extracted = feedback_match.group(1).strip()
            if extracted:
                feedback = extracted
                
        speaking_match = re.search(r'SPEAKING_FEEDBACK:\s*(\[.*?\])', response, re.IGNORECASE | re.DOTALL)
        if speaking_match:
            import json
            try:
                speaking_feedback_list = json.loads(speaking_match.group(1))
            except Exception:
                pass

    except Exception as e:
        log_error("EvaluatorAgent", f"Error parsing evaluator response: {e}")

    # ── Detect topic ──────────────────────────────────────────────────
    current_topic   = extract_topic(question)
    topics_covered  = list(state.get("topics_covered", []))
    topics_covered.append(current_topic)

    # ── Depth-tracking logic ──────────────────────────────────────────
    # Check if this is still the same topic as before (follow-up scenario)
    prev_topic       = state.get("current_topic", "")
    follow_up_count  = state.get("follow_up_count", 0)
    depth_level      = state.get("depth_level", 0)

    VAGUE_TERMS = [
        "basic", "some", "kind of", "etc", "general", "usually",
        "maybe", "I think", "I guess", "sort of", "a bit",
    ]
    answer_lower    = answer.lower()
    is_vague        = any(term in answer_lower for term in VAGUE_TERMS)
    is_short        = len(answer.split()) < 30
    is_mid_score    = 4.0 <= score <= 7.0
    is_same_topic   = (current_topic == prev_topic) or (not prev_topic)
    max_follow_ups  = 2

    # Decide whether to follow-up or move on
    should_follow_up = (
        is_same_topic
        and (is_vague or is_short)
        and is_mid_score
        and follow_up_count < max_follow_ups
    )

    if should_follow_up:
        new_depth_level     = min(depth_level + 1, 2)
        new_follow_up_count = follow_up_count + 1
        log_info("EvaluatorAgent", f"Follow-up triggered (depth={new_depth_level}, count={new_follow_up_count})")
    else:
        # Reset depth when switching topics or answer was strong
        new_depth_level     = 0
        new_follow_up_count = 0

    result = {
        "scores":           [score],
        "feedback":         [feedback],
        "speaking_feedback":[speaking_feedback_list],
        "current_topic":    current_topic,
        "topics_covered":   topics_covered,
        "depth_level":      new_depth_level,
        "follow_up_count":  new_follow_up_count,
        "confidence_data":  confidence_data,
    }

    # Mark weak topic on very low scores
    if score < 4.0:
        weak_topics = list(state.get("weak_topics", []))
        if current_topic not in weak_topics:
            weak_topics.append(current_topic)
        result["weak_topics"] = weak_topics
        log_info("EvaluatorAgent", f"Score {score} < 4 - marking '{current_topic}' as weak.")

    log_info("EvaluatorAgent", f"Confidence: {confidence_data['level']} ({confidence_data['confidence_score']}/100) | {confidence_data['signals'][0]}")
    return result
