import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"

// Derive adaptive badge message from state change
export function deriveAdaptiveBadge(prevState, newState) {
  if (!prevState || !newState) return null

  const prevScores = prevState.scores || []
  const newScores  = newState.scores  || []

  if (newScores.length === 0) return null

  const lastScore = newScores[newScores.length - 1]
  const prevDiff  = prevState.difficulty || "easy"
  const newDiff   = newState.difficulty  || "easy"

  if (prevDiff !== newDiff) {
    const label = newDiff === "hard" ? "🔥 Difficulty → Advanced" : "📉 Difficulty → Foundational"
    return { text: label, variant: newDiff === "hard" ? "warning" : "info" }
  }

  if (lastScore < 5) return { text: "🔁 Follow-up triggered — answer needs more depth", variant: "danger" }
  if (lastScore >= 8) return { text: "⚡ Excellent! Increasing challenge level", variant: "success" }
  if (lastScore >= 6) return { text: "✅ Good answer — switching topic", variant: "info" }

  return { text: "📌 Continuing with similar difficulty", variant: "neutral" }
}

const VARIANT_CLASSES = {
  success: "bg-emerald-500/15 border-emerald-500/30 text-emerald-300",
  warning: "bg-orange-500/15 border-orange-500/30 text-orange-300",
  danger:  "bg-rose-500/15   border-rose-500/30   text-rose-300",
  info:    "bg-blue-500/15   border-blue-500/30   text-blue-300",
  neutral: "bg-muted/30      border-border/30     text-muted-foreground",
}

export default function AdaptiveBadge({ badge }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!badge) return
    setVisible(true)
    const t = setTimeout(() => setVisible(false), 4500)
    return () => clearTimeout(t)
  }, [badge])

  return (
    <AnimatePresence>
      {visible && badge && (
        <motion.div
          key={badge.text}
          initial={{ opacity: 0, x: 20, scale: 0.95 }}
          animate={{ opacity: 1, x: 0,  scale: 1 }}
          exit={{    opacity: 0, x: 20, scale: 0.95 }}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium ${VARIANT_CLASSES[badge.variant]}`}
        >
          {badge.text}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
