import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"

// Derive a human-readable explanation from the interview state
export function deriveDecision(state, questionIdx) {
  if (!state || questionIdx === 0) return null

  const scores   = state.scores || []
  const qs       = state.questions || []
  const lastScore = scores[scores.length - 1]
  const difficulty = state.difficulty || "medium"

  const explanations = []

  if (lastScore !== undefined) {
    if (lastScore < 5) {
      explanations.push("Your previous answer lacked depth — a follow-up was triggered to probe further.")
    } else if (lastScore >= 8) {
      explanations.push("Strong performance detected — difficulty has been increased.")
    } else {
      explanations.push("Solid response — moving to a different domain to test breadth.")
    }
  }

  const diffLabel = difficulty === "hard" ? "Advanced" : difficulty === "medium" ? "Intermediate" : "Foundational"
  explanations.push(`Difficulty level: ${diffLabel}`)

  if (qs.length >= 2) {
    explanations.push(`${qs.length - 1} topic${qs.length > 2 ? "s" : ""} covered so far — ensuring diversity.`)
  }

  return explanations
}

export default function DecisionExplanation({ explanations }) {
  const [open, setOpen] = useState(false)

  if (!explanations || explanations.length === 0) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-2"
      >
        <button
          onClick={() => setOpen(o => !o)}
          className="flex items-center gap-1.5 text-[11px] text-muted-foreground/60 hover:text-muted-foreground transition-colors"
        >
          <span>🤖 Why this question?</span>
          {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-2 p-3 rounded-xl border border-primary/10 bg-primary/5 space-y-1.5">
                {explanations.map((e, i) => (
                  <p key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                    <span className="text-primary/60 mt-0.5">›</span>
                    {e}
                  </p>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  )
}
