from backend.tools.llm import call_llm

def user_simulator(state):
    print("Running User Simulator")
    question = state.get("current_question", "")
    role = state.get("role", "candidate")
    
    # Generate a realistic technical answer using the LLM
    prompt = f"Act as a candidate interviewing for a {role} position. Provide a realistic, concise 2-3 sentence technical answer to this interview question: {question}. Do not include any pleasantries or intro text, just provide the answer directly."
    answer = call_llm(prompt)
    
    if not answer or "Fallback" in answer:
        answer = "I would first extract the data using SQL, clean it with Python Pandas, and then visualize the trends using Tableau."
        
    return {"answers": [answer], "current_answer": answer}
