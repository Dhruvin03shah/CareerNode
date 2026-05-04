import { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "./AuthContext"

const GamificationContext = createContext(null)

const BADGES_CATALOG = [
  { id: "first_interview",  label: "First Step",        desc: "Completed your first interview",           icon: "🎯", condition: (h) => h.length >= 1 },
  { id: "five_interviews",  label: "Interview Pro",     desc: "Completed 5 interviews",                  icon: "🏆", condition: (h) => h.length >= 5 },
  { id: "high_scorer",      label: "High Achiever",     desc: "Scored 8+ in an interview",               icon: "⭐", condition: (h) => h.some(e => parseFloat(e.avgScore) >= 8) },
  { id: "consistent",       label: "Consistency King",  desc: "3+ sessions without a score drop",        icon: "📈", condition: (h) => {
    if (h.length < 3) return false
    const recent = h.slice(0, 3).map(e => parseFloat(e.avgScore))
    return recent[0] >= recent[1] && recent[1] >= recent[2]
  }},
  { id: "sql_expert",       label: "SQL Expert",        desc: "Demonstrated SQL skills in interviews",   icon: "🗄️", condition: (h) => h.some(e => (e.data?.skills || []).some(s => s.toLowerCase().includes("sql"))) },
  { id: "ml_master",        label: "ML Master",         desc: "Demonstrated ML expertise",               icon: "🤖", condition: (h) => h.some(e => parseFloat(e.avgScore) >= 7 && (e.data?.skills || []).some(s => s.toLowerCase().includes("machine") || s.toLowerCase().includes("ml"))) },
]

const DEFAULT_GAME_DATA = { streak: 0, lastInterviewDate: null, xp: 0, level: 1 }

// Per-user storage key
function gameKey(email) {
  return `careernode_gamification_${email ?? "guest"}`
}

export function GamificationProvider({ children }) {
  const { user } = useAuth()

  const [gameData, setGameData] = useState(DEFAULT_GAME_DATA)

  // Reload gamification state whenever the logged-in user changes
  useEffect(() => {
    if (user?.email) {
      const stored = localStorage.getItem(gameKey(user.email))
      setGameData(stored ? JSON.parse(stored) : { ...DEFAULT_GAME_DATA })
    } else {
      setGameData({ ...DEFAULT_GAME_DATA })
    }
  }, [user?.email])

  const computeBadges = (history) => BADGES_CATALOG.filter(b => b.condition(history))

  const updateAfterInterview = (history, score) => {
    if (!user?.email) return { xpGained: 0, newLevel: 1 }

    const today   = new Date().toDateString()
    const lastDate = gameData.lastInterviewDate
    const newStreak = lastDate === new Date(Date.now() - 86400000).toDateString()
      ? gameData.streak + 1
      : lastDate === today ? gameData.streak : 1

    const xpGained = Math.round(score * 10)
    const newXP    = gameData.xp + xpGained
    const newLevel = Math.floor(newXP / 100) + 1

    const updated = { streak: newStreak, lastInterviewDate: today, xp: newXP, level: newLevel }
    setGameData(updated)
    localStorage.setItem(gameKey(user.email), JSON.stringify(updated))
    return { xpGained, newLevel }
  }

  return (
    <GamificationContext.Provider value={{ gameData, computeBadges, updateAfterInterview, BADGES_CATALOG }}>
      {children}
    </GamificationContext.Provider>
  )
}

export function useGamification() {
  return useContext(GamificationContext)
}
