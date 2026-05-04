import os
from groq import Groq
from dotenv import load_dotenv
from typing import Generator
from backend.tools.logger import log_api, log_error

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"), override=True)

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def call_llm(prompt: str) -> str:
    """Calls Groq Llama3 model. Falls back to dummy response if it fails."""
    log_api("Groq", f"Generating standard response. Prompt length: {len(prompt)}")
    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model="llama-3.1-8b-instant",
            temperature=0.3,
        )
        return chat_completion.choices[0].message.content.strip()
    except Exception as e:
        log_error("llm.py", f"LLM API Error: {e}")
        # Fallback to dummy response
        if "question" in prompt.lower() or "generate" in prompt.lower():
            return "Can you explain a complex project you worked on? (Fallback)"
        elif "evaluate" in prompt.lower() or "score" in prompt.lower():
            return "SCORE: 7.5\nFEEDBACK: Good answer, but could use more technical details. (Fallback)"
        elif "learning" in prompt.lower() or "path" in prompt.lower():
            return "Focus on system design and algorithmic optimization. (Fallback)"
        elif "skills" in prompt.lower():
            return "Python, SQL, Communication (Fallback)"
        return "Dummy response."

def stream_llm(prompt: str) -> Generator[str, None, None]:
    """Streams tokens from Groq one chunk at a time."""
    log_api("Groq Streaming", f"Starting stream response. Prompt length: {len(prompt)}")
    try:
        stream = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.1-8b-instant",
            temperature=0.3,
            stream=True,
        )
        for chunk in stream:
            token = chunk.choices[0].delta.content
            if token:
                yield token
    except Exception as e:
        log_error("llm.py", f"LLM Stream Error: {e}")
        yield "Could not stream response. Please try again."

