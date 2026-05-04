from langgraph.graph import StateGraph, END, START
from backend.graph.state import State
from backend.agents.resume_agent    import resume_agent
from backend.agents.interview_agent import interview_agent
from backend.agents.evaluator_agent import evaluator_agent
from backend.agents.learning_agent  import learning_agent
from backend.agents.planner_agent   import planner_router

def create_graph():
    workflow = StateGraph(State)

    # ── Nodes ────────────────────────────────────────────────────────
    workflow.add_node("resume_agent",      resume_agent)
    workflow.add_node("interview_agent",   interview_agent)
    workflow.add_node("evaluator_agent",   evaluator_agent)
    workflow.add_node("learning_agent",    learning_agent)

    # ── Edges ────────────────────────────────────────────────────────
    # Start → planner decides first step
    workflow.add_conditional_edges(START, planner_router)

    # Every agent (except learning) routes back through the planner
    for node in ["resume_agent", "interview_agent", "evaluator_agent"]:
        workflow.add_conditional_edges(node, planner_router)

    # Learning agent is the terminal step
    workflow.add_edge("learning_agent", END)

    return workflow.compile()

graph = create_graph()

def run_graph(input_state: dict) -> dict:
    return graph.invoke(input_state)
