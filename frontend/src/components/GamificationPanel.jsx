import { useGamification } from "../context/GamificationContext"
import { useInterview } from "../context/InterviewContext"
import { Card, CardHeader, CardTitle, CardContent } from "./ui/Card"
import { Flame, Zap, Star, Lock } from "lucide-react"

export default function GamificationPanel() {
  const { gameData, computeBadges, BADGES_CATALOG } = useGamification()
  const { history } = useInterview()
  const earnedBadges = computeBadges(history)
  const earnedIds = new Set(earnedBadges.map(b => b.id))

  const xpToNext = ((gameData.level) * 100) - gameData.xp
  const xpProgress = ((gameData.xp % 100) / 100) * 100

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-400" /> Your Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
            <Flame className="w-5 h-5 text-orange-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-orange-300">{gameData.streak}</p>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <Zap className="w-5 h-5 text-blue-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-blue-300">Lv.{gameData.level}</p>
            <p className="text-xs text-muted-foreground">Level</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
            <Star className="w-5 h-5 text-purple-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-purple-300">{gameData.xp}</p>
            <p className="text-xs text-muted-foreground">XP</p>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Level {gameData.level}</span>
            <span>{xpToNext} XP to next level</span>
          </div>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-700" style={{ width: `${xpProgress}%` }} />
          </div>
        </div>

        {/* Badges */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Badges</p>
          <div className="grid grid-cols-3 gap-2">
            {BADGES_CATALOG.map(badge => {
              const earned = earnedIds.has(badge.id)
              return (
                <div
                  key={badge.id}
                  title={badge.desc}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl text-center transition-all ${earned ? "bg-yellow-500/10 border border-yellow-500/20" : "bg-muted/30 border border-border/20 opacity-40"}`}
                >
                  <span className="text-2xl">{earned ? badge.icon : "🔒"}</span>
                  <p className="text-xs font-medium leading-tight">{badge.label}</p>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
