import { Card, CardHeader, CardTitle, CardContent } from "./ui/Card"
import { Badge } from "./ui/Badge"
import { Trophy, Target, BookOpen, FileCheck2, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

export default function ResultCard({ data, onRestart }) {
  const avgScore = data.scores.length ? (data.scores.reduce((a,b) => a + b, 0) / data.scores.length).toFixed(1) : 0

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-12">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Interview Complete</h1>
        <p className="text-muted-foreground">Here is your comprehensive evaluation and learning path.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1 border-emerald-500/20 bg-emerald-500/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-emerald-400"><Trophy size={20} /> Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold text-emerald-300">{avgScore}<span className="text-2xl text-emerald-500/50">/10</span></div>
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-2 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-blue-400"><Target size={20} /> Extracted Skills</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {data.skills.map((skill, idx) => (
              <Badge key={idx} variant="secondary" className="px-3 py-1 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20">{skill}</Badge>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-indigo-500/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-indigo-400"><FileCheck2 size={20} /> Resume Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-indigo-100">{data.resume_feedback}</p>
        </CardContent>
      </Card>

      <Card className="border-orange-500/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-orange-400"><BookOpen size={20} /> Actionable Learning Path</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.learning_path.map((item, idx) => (
            <div key={idx} className="flex gap-3 items-start">
              <div className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-xs">{idx + 1}</div>
              <p className="text-sm text-orange-100/90 leading-relaxed">{item}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold pl-2 pt-4">Detailed Question Breakdown</h3>
        {data.questions.map((q, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
            <Card className="border-border/50">
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <Badge variant="outline" className="mb-2 border-primary/30 text-primary/70">Question {idx + 1}</Badge>
                    <p className="text-sm font-medium">{q}</p>
                  </div>
                  <div className="shrink-0 text-center px-4 py-2 rounded-xl bg-card border border-border">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Score</div>
                    <div className={`text-xl font-bold ${
                      data.scores[idx] >= 8 ? 'text-emerald-400' :
                      data.scores[idx] >= 6 ? 'text-yellow-400' : 'text-rose-400'
                    }`}>{data.scores[idx].toFixed(1)}</div>
                  </div>
                </div>
                <div className="bg-muted/30 p-4 rounded-xl border border-border/30">
                  <p className="text-sm text-muted-foreground italic mb-2">Your Answer:</p>
                  <p className="text-sm leading-relaxed">{data.answers[idx]}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-rose-400 flex items-center gap-1">AI Feedback</p>
                  <div className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line bg-rose-500/5 border border-rose-500/10 rounded-xl p-4">
                    {data.feedback[idx]}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-center pt-8">
        <button 
          onClick={onRestart}
          className="flex items-center gap-2 px-8 py-4 rounded-xl bg-card border border-border hover:bg-muted transition-colors text-sm font-medium"
        >
          Start New Simulation <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}
