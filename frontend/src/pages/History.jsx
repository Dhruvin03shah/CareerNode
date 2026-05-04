import { useNavigate } from "react-router-dom"
import { useInterview } from "../context/InterviewContext"
import { Card, CardContent } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import { Calendar, Building2, Briefcase } from "lucide-react"

export default function History() {
  const { history } = useInterview()
  const navigate = useNavigate()

  const scoreColor = (s) => parseFloat(s) >= 8 ? "text-emerald-400" : parseFloat(s) >= 6 ? "text-yellow-400" : "text-rose-400"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Interview History</h1>
        <p className="text-muted-foreground mt-1">All your past interview sessions.</p>
      </div>

      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-72 text-center space-y-4 border border-dashed border-border rounded-2xl">
          <p className="text-muted-foreground">You haven't completed any interviews yet.</p>
          <Button onClick={() => navigate("/interview")}>Start Your First Interview</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((h, idx) => (
            <Card
              key={h.id}
              className="border-border/50 hover:border-primary/30 cursor-pointer transition-all"
              onClick={() => navigate("/results", { state: { data: h.data } })}
            >
              <CardContent className="flex items-center justify-between p-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                    <span className="font-semibold">{h.role}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {h.company}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(h.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                </div>
                <div className={`text-3xl font-bold ${scoreColor(h.avgScore)}`}>
                  {h.avgScore}
                  <span className="text-sm text-muted-foreground font-normal">/10</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
