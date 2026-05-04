def parser_tool(text: str) -> list:
    """Extracts dummy skills from text."""
    if "Python" in text:
        return ["Python", "SQL", "Machine Learning"]
    return ["Communication", "Problem Solving"]

def llm_tool(prompt: str) -> str:
    """Returns a dummy generated text based on the prompt."""
    if "question" in prompt.lower() or "generate" in prompt.lower():
        return "Can you explain a complex project you worked on?"
    elif "evaluate" in prompt.lower() or "score" in prompt.lower():
        return "Good answer, but could use more technical details."
    elif "learning" in prompt.lower() or "path" in prompt.lower():
        return "Focus on system design and algorithmic optimization."
    return "Dummy response."
