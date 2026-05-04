import { useInterview } from "../context/InterviewContext"
import { useNavigate } from "react-router-dom"
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import { Badge } from "../components/ui/Badge"
import { BookOpen, ArrowRight, CheckCircle2, AlertTriangle, XCircle, ExternalLink } from "lucide-react"
import { motion } from "framer-motion"

const DOMAIN_KEYWORDS = {
  "ML/AI": ["machine learning", "model", "sklearn", "neural", "regression", "classification", "xgboost"],
  "SQL/Data": ["sql", "database", "query", "pandas", "data analysis", "etl"],
  "System Design": ["system design", "microservice", "api", "architecture", "scalability"],
  "Behavioral": ["behavioral", "teamwork", "leadership", "communication", "conflict"],
  "DSA": ["algorithm", "data structure", "tree", "graph", "sorting", "complexity"],
  "NLP/DL": ["nlp", "deep learning", "transformer", "bert", "gpt", "lstm"],
}

const LEARNING_RESOURCES = {
  "ML/AI":       { link: "https://www.coursera.org/learn/machine-learning", label: "Coursera — ML by Andrew Ng" },
  "SQL/Data":    { link: "https://mode.com/sql-tutorial/", label: "Mode Analytics SQL Tutorial" },
  "System Design": { link: "https://github.com/donnemartin/system-design-primer", label: "System Design Primer (GitHub)" },
  "Behavioral":  { link: "https://www.themuse.com/advice/behavioral-interview-questions-answers-examples", label: "The Muse — STAR Method Guide" },
  "DSA":         { link: "https://neetcode.io/", label: "NeetCode.io — DSA Roadmap" },
  "NLP/DL":      { link: "https://fast.ai/", label: "Fast.ai — Practical Deep Learning" },
}

function computeDomainScores(history) {
  const domainScores = {}
  Object.keys(DOMAIN_KEYWORDS).forEach(d => { domainScores[d] = { total: 0, count: 0 } })
  history.forEach(h => {
    const questions = h.data?.questions || []
    const scores = h.data?.scores || []
    questions.forEach((q, i) => {
      const ql = q.toLowerCase()
      Object.keys(DOMAIN_KEYWORDS).forEach(d => {
        if (DOMAIN_KEYWORDS[d].some(kw => ql.includes(kw))) {
          domainScores[d].total += scores[i] || 0
          domainScores[d].count += 1
        }
      })
    })
  })
  return Object.entries(domainScores)
    .filter(([, v]) => v.count > 0)
    .map(([domain, v]) => ({
      domain,
      score: parseFloat((v.total / v.count).toFixed(1)),
    }))
    .sort((a, b) => b.score - a.score)
}

export default function Learning() {
  const { history } = useInterview()
  const navigate = useNavigate()
  const domains = computeDomainScores(history)

  const strong    = domains.filter(d => d.score >= 7.5)
  const improving = domains.filter(d => d.score >= 5 && d.score < 7.5)
  const weak      = domains.filter(d => d.score < 5)

  // Collect learning path items from all sessions
  const allLearningPaths = history.flatMap(h => h.data?.learning_path || [])
  const uniquePaths = [...new Set(allLearningPaths)].slice(0, 8)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <BookOpen className="w-7 h-7 text-emerald-400" />
          Learning Hub
        </h1>
        <p className="text-muted-foreground mt-1">
          Personalised skill analysis and curated resources based on your interviews.
        </p>
      </div>

      {history.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">No data yet</p>
            <p className="text-sm text-muted-foreground/60 mt-1">Complete an interview to get personalised learning recommendations.</p>
            <Button className="mt-6" onClick={() => navigate("/interview")}>
              Start Interview <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Skill Bands */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Strong */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
              <Card className="border-emerald-500/20 bg-emerald-500/5 h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" /> Strong Skills
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {strong.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Not enough data yet.</p>
                  ) : strong.map(d => (
                    <Badge key={d.domain} className="bg-emerald-500/15 text-emerald-300 border-emerald-500/20">
                      {d.domain} ({d.score})
                    </Badge>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Improving */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="border-yellow-500/20 bg-yellow-500/5 h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2 text-yellow-400">
                    <AlertTriangle className="w-4 h-4" /> Needs Practice
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {improving.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Not enough data yet.</p>
                  ) : improving.map(d => (
                    <Badge key={d.domain} className="bg-yellow-500/15 text-yellow-300 border-yellow-500/20">
                      {d.domain} ({d.score})
                    </Badge>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Weak */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <Card className="border-rose-500/20 bg-rose-500/5 h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2 text-rose-400">
                    <XCircle className="w-4 h-4" /> Focus Areas
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {weak.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No critical gaps detected.</p>
                  ) : weak.map(d => (
                    <Badge key={d.domain} className="bg-rose-500/15 text-rose-300 border-rose-500/20">
                      {d.domain} ({d.score})
                    </Badge>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* AI Learning Path */}
          {uniquePaths.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="border-orange-500/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-orange-400 flex items-center gap-2">
                    🧭 AI-Generated Learning Path
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {uniquePaths.map((item, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <div className="shrink-0 w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-xs font-bold mt-0.5">{i + 1}</div>
                      <p className="text-sm leading-relaxed text-orange-100/90">{item}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Curated Resources */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Card className="border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  📚 Curated Resources
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Prioritise weak first, then improving */}
                {[...weak, ...improving, ...strong].map(d => {
                  const resource = LEARNING_RESOURCES[d.domain]
                  if (!resource) return null
                  return (
                    <a
                      key={d.domain}
                      href={resource.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-xl border border-border/40 hover:border-primary/30 hover:bg-muted/30 transition-all group"
                    >
                      <div>
                        <p className="text-sm font-medium group-hover:text-primary transition-colors">{resource.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{d.domain} · Score: {d.score}/10</p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 ml-3" />
                    </a>
                  )
                })}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  )
}
