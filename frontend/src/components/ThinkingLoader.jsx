import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"

const STEPS = [
  { key: "evaluating",  label: "Evaluating Response",     icon: "📊", color: "text-orange-400", glow: "shadow-orange-500/30" },
  { key: "planning",    label: "Planning Next Question",   icon: "🧠", color: "text-purple-400", glow: "shadow-purple-500/30" },
  { key: "generating", label: "Generating Question",      icon: "🎤", color: "text-blue-400",   glow: "shadow-blue-500/30"   },
]

const THINKING_MESSAGES = {
  evaluating:  ["Analyzing depth of your answer…", "Checking technical accuracy…", "Scoring your response…"],
  planning:    ["Identifying knowledge gaps…", "Selecting next topic…", "Adapting difficulty level…"],
  generating:  ["Crafting a targeted question…", "Building real-world scenario…", "Finalizing question…"],
}

export default function ThinkingLoader({ activeStep }) {
  const [msgIdx, setMsgIdx] = useState(0)

  useEffect(() => {
    setMsgIdx(0)
    const id = setInterval(() => setMsgIdx(i => i + 1), 900)
    return () => clearInterval(id)
  }, [activeStep])

  const step = STEPS.find(s => s.key === activeStep)
  const msgs = THINKING_MESSAGES[activeStep] || []
  const msg  = msgs[msgIdx % msgs.length] || ""

  if (!step) return null

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeStep}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        className="flex flex-col gap-3"
      >
        {/* Step row */}
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => {
            const idx   = STEPS.findIndex(x => x.key === activeStep)
            const state = i < idx ? "done" : i === idx ? "active" : "idle"
            return (
              <div key={s.key} className="flex items-center gap-1">
                {i > 0 && (
                  <div className={`h-px w-8 transition-colors ${state === "done" ? "bg-primary" : "bg-border/40"}`} />
                )}
                <div className={`
                  flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all
                  ${state === "active"    ? `bg-card border-primary/40 ${s.color} shadow-md ${s.glow}` : ""}
                  ${state === "done"      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : ""}
                  ${state === "idle"      ? "bg-muted/30 border-border/20 text-muted-foreground/40" : ""}
                `}>
                  <span>{state === "done" ? "✓" : s.icon}</span>
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Message with animated dots */}
        <motion.div
          key={msg}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-xs text-muted-foreground ml-1"
        >
          <span className="flex gap-0.5">
            {[0,1,2].map(i => (
              <span
                key={i}
                className="w-1 h-1 rounded-full bg-primary/60 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </span>
          {msg}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
