import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useInterview } from "../context/InterviewContext"
import { useGamification } from "../context/GamificationContext"
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import { Trophy, TrendingUp, MessageSquare, Sparkles, History, BarChart3, ArrowRight, Flame, BookOpen } from "lucide-react"
import { motion } from "framer-motion"
import { lazy, Suspense } from "react"

const HeroOrb = lazy(() => import("../components/three/HeroOrb"))

export default function Dashboard() {
  const { user } = useAuth()
  const { history } = useInterview()
  const { gameData } = useGamification()
  const navigate = useNavigate()

  const avgScore = history.length
    ? (history.reduce((sum, h) => sum + parseFloat(h.avgScore || 0), 0) / history.length).toFixed(1)
    : null
  const lastInterview = history[0]

  const improvementPercent = (() => {
    if (history.length < 2) return null
    const recent = history.slice(0, 3)
    const older  = history.slice(3, 6)
    if (older.length === 0) return null
    const recentAvg = recent.reduce((s, h) => s + parseFloat(h.avgScore), 0) / recent.length
    const olderAvg  = older.reduce((s, h) => s + parseFloat(h.avgScore), 0) / older.length
    return ((recentAvg - olderAvg) / olderAvg * 100).toFixed(0)
  })()

  const scoreColor = (s) =>
    parseFloat(s) >= 8 ? "text-emerald-400" : parseFloat(s) >= 6 ? "text-yellow-400" : "text-rose-400"

  return (
    <div className="space-y-8">
      {/* ─── Hero Section with 3D Orb ─── */}
      <div className="relative rounded-2xl overflow-hidden border border-blue-500/20 bg-gradient-to-br from-blue-950/60 to-indigo-950/60 backdrop-blur-sm">
        {/* 3D Orb canvas — right side */}
        <div className="absolute right-0 top-0 bottom-0 w-64 pointer-events-none" aria-hidden="true">
          <Suspense fallback={null}>
            <HeroOrb />
          </Suspense>
        </div>

        {/* Text + CTA — left side */}
        <div className="relative z-10 p-8 pr-72">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold uppercase tracking-widest text-blue-400/80 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-full">
                AI Career Coach
              </span>
            </div>
            <h1 className="text-3xl font-bold mb-1">
              Welcome back,{" "}
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent capitalize">
                {user?.name}
              </span>
            </h1>
            <p className="text-muted-foreground mt-1 mb-6 max-w-sm">
              Your AI-powered career coach is ready. Start a session to get expert-level feedback tailored to your target role.
            </p>
            <div className="flex items-center gap-3">
              <Button
                className="h-11 px-7 text-sm shadow-lg shadow-blue-500/25"
                onClick={() => navigate("/interview")}
              >
                <Sparkles className="w-4 h-4 mr-2" /> Start New Interview
              </Button>
              <Button
                variant="outline"
                className="h-11 px-5 text-sm"
                onClick={() => navigate("/analytics")}
              >
                View Analytics <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-medium flex items-center gap-2">
              <Trophy className="w-4 h-4 text-emerald-400" /> Average Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-4xl font-bold ${avgScore ? scoreColor(avgScore) : "text-muted-foreground"}`}>
              {avgScore ? <>{avgScore}<span className="text-xl opacity-50">/10</span></> : "—"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Across all sessions</p>
          </CardContent>
        </Card>

        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-medium flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-400" /> Interviews Done
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-blue-300">{history.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Total sessions completed</p>
          </CardContent>
        </Card>

        <Card className="border-indigo-500/20 bg-indigo-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" /> Last Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-4xl font-bold ${lastInterview ? scoreColor(lastInterview.avgScore) : "text-muted-foreground"}`}>
              {lastInterview ? <>{lastInterview.avgScore}<span className="text-xl opacity-50">/10</span></> : "—"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {lastInterview ? `${lastInterview.role} at ${lastInterview.company}` : "No interviews yet"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Performance summary */}
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" /> Performance Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {improvementPercent !== null ? (
              <div className={`flex items-center gap-2 text-sm ${parseFloat(improvementPercent) >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                <TrendingUp className="w-4 h-4" />
                <span className="font-semibold">
                  {parseFloat(improvementPercent) >= 0 ? "+" : ""}{improvementPercent}% improvement
                </span>
                <span className="text-muted-foreground">vs previous sessions</span>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Complete 4+ interviews to see your improvement trend.</p>
            )}
            <div className="flex items-center gap-2 text-sm text-orange-400">
              <Flame className="w-4 h-4" />
              <span className="font-semibold">{gameData.streak} day streak</span>
              <span className="text-muted-foreground">· Level {gameData.level} · {gameData.xp} XP</span>
            </div>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => navigate("/analytics")}>
              View Full Analytics <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </CardContent>
        </Card>

        {/* Recent Sessions */}
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <History className="w-4 h-4 text-muted-foreground" /> Recent Sessions
              </CardTitle>
              <button onClick={() => navigate("/history")} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                View all →
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground">No sessions yet. Start your first interview!</p>
            ) : (
              history.slice(0, 3).map(h => (
                <div
                  key={h.id}
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/30 cursor-pointer transition-colors"
                  onClick={() => navigate("/results", { state: { data: h.data } })}
                >
                  <div>
                    <p className="text-sm font-medium">{h.role}</p>
                    <p className="text-xs text-muted-foreground">{h.company}</p>
                  </div>
                  <div className={`text-sm font-bold ${scoreColor(h.avgScore)}`}>{h.avgScore}/10</div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="cursor-pointer" onClick={() => navigate("/analytics")}>
          <Card className="border-purple-500/20 bg-purple-500/5 hover:border-purple-500/40 transition-all">
            <CardContent className="flex items-center gap-4 p-5">
              <BarChart3 className="w-8 h-8 text-purple-400 shrink-0" />
              <div>
                <p className="font-semibold">View Analytics</p>
                <p className="text-xs text-muted-foreground">Charts, trends, and skill radar</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto" />
            </CardContent>
          </Card>
        </div>

        <div className="cursor-pointer" onClick={() => navigate("/learning")}>
          <Card className="border-orange-500/20 bg-orange-500/5 hover:border-orange-500/40 transition-all">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/20 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="font-semibold">Learning Hub</p>
                <p className="text-xs text-muted-foreground">Skill gaps and curated resources</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
