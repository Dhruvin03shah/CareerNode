import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts"
import { Card, CardHeader, CardTitle, CardContent } from "./ui/Card"
import { TrendingUp, BarChart2, Activity } from "lucide-react"

const CUSTOM_TOOLTIP = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-card border border-border rounded-xl px-4 py-3 text-sm shadow-xl">
        <p className="text-muted-foreground mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="font-semibold">{p.name}: {p.value}</p>
        ))}
      </div>
    )
  }
  return null
}

export function ScoreLineChart({ history }) {
  const data = [...history].reverse().map((h, i) => ({
    session: `S${i + 1}`,
    score: parseFloat(h.avgScore),
    role: h.role,
  }))

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
          <TrendingUp className="w-4 h-4 text-blue-400" /> Score Trend
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length < 2 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Complete 2+ interviews to see trend.</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="session" tick={{ fill: "#6b7280", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 10]} tick={{ fill: "#6b7280", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CUSTOM_TOOLTIP />} />
              <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} fill="url(#scoreGrad)" name="Score" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}

export function SkillBarChart({ history }) {
  const skillMap = {}
  history.forEach(h => {
    (h.data?.skills || []).forEach(s => {
      skillMap[s] = (skillMap[s] || 0) + 1
    })
  })
  const data = Object.entries(skillMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([skill, count]) => ({ skill: skill.length > 12 ? skill.slice(0, 12) + "…" : skill, count }))

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
          <BarChart2 className="w-4 h-4 text-emerald-400" /> Top Skills
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No skill data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="skill" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CUSTOM_TOOLTIP />} />
              <Bar dataKey="count" fill="#10b981" name="Frequency" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}

const DOMAINS = ["ML/AI", "SQL/Data", "System Design", "Behavioral", "DSA", "NLP/DL"]
const DOMAIN_KEYWORDS = {
  "ML/AI": ["machine learning", "model", "sklearn", "neural", "regression", "classification", "xgboost", "random forest"],
  "SQL/Data": ["sql", "database", "query", "pandas", "data analysis", "etl", "postgresql"],
  "System Design": ["system design", "microservice", "api", "architecture", "scalability", "load balancer"],
  "Behavioral": ["behavioral", "teamwork", "leadership", "communication", "conflict", "stakeholder"],
  "DSA": ["algorithm", "data structure", "tree", "graph", "sorting", "complexity"],
  "NLP/DL": ["nlp", "deep learning", "transformer", "bert", "gpt", "lstm", "embedding"],
}

function computeDomainScores(history) {
  const domainScores = {}
  DOMAINS.forEach(d => { domainScores[d] = { total: 0, count: 0 } })

  history.forEach(h => {
    const questions = h.data?.questions || []
    const scores = h.data?.scores || []
    questions.forEach((q, i) => {
      const ql = q.toLowerCase()
      DOMAINS.forEach(d => {
        if (DOMAIN_KEYWORDS[d].some(kw => ql.includes(kw))) {
          domainScores[d].total += scores[i] || 0
          domainScores[d].count += 1
        }
      })
    })
  })

  return DOMAINS.map(d => ({
    domain: d,
    score: domainScores[d].count > 0
      ? parseFloat((domainScores[d].total / domainScores[d].count).toFixed(1))
      : 0
  }))
}

export function SkillRadarChart({ history }) {
  const data = computeDomainScores(history)

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
          <Activity className="w-4 h-4 text-purple-400" /> Skill Coverage Radar
        </CardTitle>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Complete interviews to see your radar.</p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={data}>
              <PolarGrid stroke="rgba(255,255,255,0.07)" />
              <PolarAngleAxis dataKey="domain" tick={{ fill: "#9ca3af", fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fill: "#6b7280", fontSize: 10 }} />
              <Radar name="Your Score" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} strokeWidth={2} />
              <Tooltip content={<CUSTOM_TOOLTIP />} />
            </RadarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}

export function SkillGapAnalyzer({ history }) {
  const domainData = computeDomainScores(history)
  const withScores = domainData.filter(d => d.score > 0)

  if (withScores.length === 0) return null

  const strong = withScores.filter(d => d.score >= 7.5)
  const mid = withScores.filter(d => d.score >= 5 && d.score < 7.5)
  const weak = withScores.filter(d => d.score < 5)

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">🧠 AI Skill Gap Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {strong.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">✅ Strong</p>
            <div className="flex flex-wrap gap-2">
              {strong.map(d => <span key={d.domain} className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">{d.domain} ({d.score})</span>)}
            </div>
          </div>
        )}
        {mid.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-yellow-400 uppercase tracking-wider mb-2">⚠️ Needs Practice</p>
            <div className="flex flex-wrap gap-2">
              {mid.map(d => <span key={d.domain} className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/15 text-yellow-300 border border-yellow-500/20">{d.domain} ({d.score})</span>)}
            </div>
          </div>
        )}
        {weak.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-rose-400 uppercase tracking-wider mb-2">❌ Weak — Focus Here</p>
            <div className="flex flex-wrap gap-2">
              {weak.map(d => <span key={d.domain} className="px-3 py-1 rounded-full text-xs font-medium bg-rose-500/15 text-rose-300 border border-rose-500/20">{d.domain} ({d.score})</span>)}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
