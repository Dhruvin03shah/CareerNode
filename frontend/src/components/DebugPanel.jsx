import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { ChevronDown, ChevronUp, Terminal } from "lucide-react"

const DIFFICULTY_COLOR = {
  easy:   "text-emerald-400",
  medium: "text-yellow-400",
  hard:   "text-rose-400",
}

export default function DebugPanel({ state, questionCount }) {
  const [open, setOpen] = useState(false)

  const qs         = state?.questions  || []
  const scores     = state?.scores     || []
  const skills     = state?.skills     || []
  const difficulty = state?.difficulty || "easy"
  const avgScore   = scores.length
    ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
    : "—"

  // Extract brief topic labels from questions (first 5 words)
  const topics = qs.slice(0, -1).map(q =>
    q.split(" ").slice(0, 5).join(" ") + "…"
  )

  return (
    <div className="rounded-xl border border-border/30 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2 text-[11px] text-muted-foreground/50 hover:text-muted-foreground transition-colors"
      >
        <span className="flex items-center gap-1.5">
          <Terminal className="w-3 h-3" />
          Internal State
        </span>
        {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-2 text-[11px] font-mono border-t border-border/20">
              <div className="flex justify-between pt-2">
                <span className="text-foreground/80">{questionCount} (max 10)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground/50">Avg Score</span>
                <span className="text-foreground/80">{avgScore}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground/50">Difficulty</span>
                <span className={`capitalize ${DIFFICULTY_COLOR[difficulty]}`}>{difficulty}</span>
              </div>
              {skills.length > 0 && (
                <div>
                  <span className="text-muted-foreground/50 block mb-1">Detected Skills</span>
                  <div className="flex flex-wrap gap-1">
                    {skills.slice(0, 4).map((s, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded bg-primary/10 text-primary/70">{s}</span>
                    ))}
                  </div>
                </div>
              )}
              {topics.length > 0 && (
                <div>
                  <span className="text-muted-foreground/50 block mb-1">Topics Asked</span>
                  <div className="space-y-0.5">
                    {topics.map((t, i) => (
                      <p key={i} className="text-muted-foreground/60 truncate">› {t}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
