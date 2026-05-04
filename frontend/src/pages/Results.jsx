import { useLocation, useNavigate } from "react-router-dom"
import { useInterview } from "../context/InterviewContext"
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card"
import { Badge } from "../components/ui/Badge"
import { Button } from "../components/ui/Button"
import { Trophy, Target, BookOpen, FileCheck2, ArrowRight, ChevronDown, Wand2, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import axios from "axios"
import { SkillRadarChart, SkillGapAnalyzer } from "../components/Analytics"

function ImproveAnswerModal({ question, answer, onClose }) {
  const [improved, setImproved] = useState(null)
  const [loading, setLoading] = useState(false)

  const generateImprovement = async () => {
    setLoading(true)
    try {
      // Call the /answer endpoint with a special "improve" instruction
      const res = await axios.post("http://127.0.0.1:8000/answer", {
        state: {
          questions: [question],
          answers: [],
          skills: [],
          role: "candidate",
          company: "N/A",
          scores: [],
          feedback: [],
          learning_path: [],
          resume_text: "",
          current_question: `Please provide an improved, model answer for this interview question: "${question}". Then list the key points that were missing from this candidate's answer: "${answer}". Format: IMPROVED_ANSWER: ... MISSING_POINTS: ...`,
          current_answer: `Improve this answer: ${answer}`,
        },
        answer: `Please write a model answer for the question: "${question}". The candidate said: "${answer}". Provide: 1) A sample strong answer, 2) What was missing, 3) How to structure the answer better.`
      })
      // Just show the AI's next response as the improvement
      const nextQ = res.data.questions?.[res.data.questions.length - 1]
      setImproved(nextQ || "Could not generate improvement. Try again.")
    } catch {
      setImproved("Failed to generate improvement. Please check if the backend is running.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-3 p-4 rounded-xl border border-purple-500/20 bg-purple-500/5 space-y-3"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-purple-400 flex items-center gap-2"><Wand2 className="w-4 h-4" /> Answer Improvement</p>
        <button onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground">✕ Close</button>
      </div>
      {!improved ? (
        <Button size="sm" variant="outline" onClick={generateImprovement} disabled={loading} className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10">
          {loading ? <><Loader2 className="w-3 h-3 mr-2 animate-spin" /> Generating...</> : "✨ Generate Model Answer"}
        </Button>
      ) : (
        <div className="text-sm leading-relaxed whitespace-pre-line text-foreground/80">{improved}</div>
      )}
    </motion.div>
  )
}

export default function Results() {
  const location = useLocation()
  const navigate = useNavigate()
  const { interviewData } = useInterview()
  const [expandedIdx, setExpandedIdx] = useState(null)
  const [improvingIdx, setImprovingIdx] = useState(null)

  const data = location.state?.data || interviewData
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center space-y-4">
        <p className="text-muted-foreground text-lg">No results found.</p>
        <Button onClick={() => navigate("/interview")}>Start an Interview</Button>
      </div>
    )
  }

  const avgScore = data.scores?.length
    ? (data.scores.reduce((a, b) => a + b, 0) / data.scores.length).toFixed(1)
    : "N/A"

  const scoreColor = (s) => s >= 8 ? "text-emerald-400" : s >= 6 ? "text-yellow-400" : "text-rose-400"

  // Build a mock history entry for radar/gap from this session
  const sessionHistory = [{ id: "current", data, avgScore, role: data.role || "", company: data.company || "" }]

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Interview Complete
          </h1>
          <p className="text-muted-foreground mt-1">Comprehensive evaluation with personalised insights.</p>
        </div>
        <Button variant="outline" onClick={() => navigate("/interview")}>
          New Interview <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Score + Skills */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="col-span-1 border-emerald-500/20 bg-emerald-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Trophy className="w-4 h-4 text-emerald-400" /> Average Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-5xl font-bold ${scoreColor(parseFloat(avgScore))}`}>
              {avgScore}<span className="text-2xl opacity-40">/10</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {parseFloat(avgScore) >= 8 ? "🔥 Excellent performance!" : parseFloat(avgScore) >= 6 ? "👍 Good, keep improving" : "💪 Keep practising"}
            </p>
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-2 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-400" /> Detected Skills
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {(data.skills || []).map((skill, i) => (
              <Badge key={i} className="bg-blue-500/10 text-blue-300 border-blue-500/20 hover:bg-blue-500/20">{skill}</Badge>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Radar + Gap for this session */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <SkillRadarChart history={sessionHistory} />
        <SkillGapAnalyzer history={sessionHistory} />
      </div>

      {/* Resume Feedback */}
      {data.resume_feedback && (
        <Card className="border-indigo-500/20">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-indigo-400">
              <FileCheck2 className="w-4 h-4" /> Resume Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-indigo-100/90">{data.resume_feedback}</p>
          </CardContent>
        </Card>
      )}

      {/* Learning Path */}
      {data.learning_path?.length > 0 && (
        <Card className="border-orange-500/20">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-orange-400">
              <BookOpen className="w-4 h-4" /> Personalised Learning Path
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.learning_path.map((item, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="shrink-0 w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-xs font-bold">{i + 1}</div>
                <p className="text-sm text-orange-100/90 leading-relaxed">{item}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Question Breakdown */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Detailed Question Breakdown</h2>
        <div className="space-y-4">
          {(data.questions || []).map((q, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.07 }}>
              <Card className="border-border/50 hover:border-primary/20 transition-all">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start gap-4 cursor-pointer" onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}>
                    <div className="flex-1">
                      <Badge variant="outline" className="mb-2 text-xs border-primary/20 text-primary/60">Q{idx + 1}</Badge>
                      <p className="text-sm font-medium leading-relaxed">{q}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${scoreColor(data.scores?.[idx])}`}>
                          {data.scores?.[idx]?.toFixed(1)}
                        </div>
                        <div className="text-xs text-muted-foreground">/10</div>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expandedIdx === idx ? "rotate-180" : ""}`} />
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedIdx === idx && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                        <div className="mt-4 space-y-3">
                          <div className="bg-muted/30 rounded-xl p-4 border border-border/30">
                            <p className="text-xs text-muted-foreground italic mb-2">Your Answer:</p>
                            <p className="text-sm leading-relaxed">{data.answers?.[idx]}</p>
                          </div>
                          <div className="bg-rose-500/5 rounded-xl p-4 border border-rose-500/10">
                            <p className="text-xs font-semibold text-rose-400 mb-2">AI Feedback</p>
                            <div className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">{data.feedback?.[idx]}</div>
                          </div>

                          {/* Improve My Answer Button */}
                          {improvingIdx !== idx ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
                              onClick={() => setImprovingIdx(idx)}
                            >
                              <Wand2 className="w-3.5 h-3.5 mr-2" /> Improve My Answer
                            </Button>
                          ) : (
                            <ImproveAnswerModal
                              question={q}
                              answer={data.answers?.[idx]}
                              onClose={() => setImprovingIdx(null)}
                            />
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
