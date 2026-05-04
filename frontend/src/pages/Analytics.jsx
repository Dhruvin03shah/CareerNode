import { useInterview } from "../context/InterviewContext"
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card"
import { ScoreLineChart, SkillBarChart, SkillRadarChart, SkillGapAnalyzer } from "../components/Analytics"
import { BarChart3 } from "lucide-react"
import { motion } from "framer-motion"

export default function Analytics() {
  const { history } = useInterview()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <BarChart3 className="w-7 h-7 text-blue-400" />
          Performance Analytics
        </h1>
        <p className="text-muted-foreground mt-1">
          Deep insights into your interview performance across all sessions.
        </p>
      </div>

      {history.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <BarChart3 className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">No data yet</p>
            <p className="text-sm text-muted-foreground/60 mt-1">Complete at least one interview to see your analytics.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
              <ScoreLineChart history={history} />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <SkillBarChart history={history} />
            </motion.div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <SkillRadarChart history={history} />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <SkillGapAnalyzer history={history} />
            </motion.div>
          </div>

          {/* Session Summary Table */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Card className="border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Session History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/50 text-muted-foreground text-left">
                        <th className="pb-3 font-medium">#</th>
                        <th className="pb-3 font-medium">Role</th>
                        <th className="pb-3 font-medium">Company</th>
                        <th className="pb-3 font-medium">Score</th>
                        <th className="pb-3 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {[...history].reverse().map((h, i) => {
                        const score = parseFloat(h.avgScore)
                        const color = score >= 8 ? "text-emerald-400" : score >= 6 ? "text-yellow-400" : "text-rose-400"
                        return (
                          <tr key={h.id} className="hover:bg-muted/20 transition-colors">
                            <td className="py-3 text-muted-foreground">{i + 1}</td>
                            <td className="py-3 font-medium">{h.role}</td>
                            <td className="py-3 text-muted-foreground">{h.company}</td>
                            <td className={`py-3 font-bold ${color}`}>{h.avgScore}/10</td>
                            <td className="py-3 text-muted-foreground">{new Date(h.date).toLocaleDateString()}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  )
}
