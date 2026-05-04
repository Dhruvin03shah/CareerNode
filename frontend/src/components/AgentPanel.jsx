import { motion, AnimatePresence } from "framer-motion"

const AGENTS = [
  {
    key: "evaluator",
    label: "Evaluator Agent",
    icon: "📊",
    desc: "Scores your answer",
    activeColor: "border-orange-500/40 bg-orange-500/10 text-orange-300",
    idleColor:   "border-border/20 bg-muted/20 text-muted-foreground/40",
    doneColor:   "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    glow: "shadow-orange-500/20",
  },
  {
    key: "planner",
    label: "Planner Agent",
    icon: "🧠",
    desc: "Decides next topic",
    activeColor: "border-purple-500/40 bg-purple-500/10 text-purple-300",
    idleColor:   "border-border/20 bg-muted/20 text-muted-foreground/40",
    doneColor:   "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    glow: "shadow-purple-500/20",
  },
  {
    key: "interviewer",
    label: "Interview Agent",
    icon: "🎤",
    desc: "Generates question",
    activeColor: "border-blue-500/40 bg-blue-500/10 text-blue-300",
    idleColor:   "border-border/20 bg-muted/20 text-muted-foreground/40",
    doneColor:   "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    glow: "shadow-blue-500/20",
  },
  {
    key: "learning",
    label: "Learning Agent",
    icon: "📚",
    desc: "Builds growth plan",
    activeColor: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    idleColor:   "border-border/20 bg-muted/20 text-muted-foreground/40",
    doneColor:   "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    glow: "shadow-emerald-500/20",
  },
]

// Maps thinking step → which agents are active/done
const STEP_STATE = {
  idle:        { active: [],            done: [] },
  evaluating:  { active: ["evaluator"], done: [] },
  planning:    { active: ["planner"],   done: ["evaluator"] },
  generating:  { active: ["interviewer"], done: ["evaluator", "planner"] },
  complete:    { active: ["learning"],  done: ["evaluator", "planner", "interviewer"] },
  finished:    { active: [],            done: ["evaluator", "planner", "interviewer", "learning"] },
}

export default function AgentPanel({ thinkingStep }) {
  const state = STEP_STATE[thinkingStep] || STEP_STATE.idle

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 px-1">
        Agent Orchestration
      </p>
      {AGENTS.map(agent => {
        const isActive = state.active.includes(agent.key)
        const isDone   = state.done.includes(agent.key)
        const cls = isActive ? agent.activeColor : isDone ? agent.doneColor : agent.idleColor

        return (
          <motion.div
            key={agent.key}
            layout
            animate={{ scale: isActive ? 1.02 : 1 }}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border text-xs transition-all duration-300 ${cls} ${isActive ? `shadow-md ${agent.glow}` : ""}`}
          >
            <span className="text-base shrink-0">{agent.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[11px] leading-tight">{agent.label}</p>
              <p className="opacity-60 text-[10px] leading-tight">{agent.desc}</p>
            </div>
            <div className="shrink-0">
              {isActive && (
                <span className="flex gap-0.5">
                  {[0,1,2].map(i => (
                    <span key={i} className="w-1 h-1 rounded-full bg-current animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </span>
              )}
              {isDone && <span className="text-emerald-400 text-xs">✓</span>}
              {!isActive && !isDone && <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/20 block" />}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
