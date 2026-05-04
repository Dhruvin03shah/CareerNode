import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useInterview } from "../context/InterviewContext"
import { useGamification } from "../context/GamificationContext"
import { useAuth } from "../context/AuthContext"
import { Input } from "../components/ui/Input"
import { Button } from "../components/ui/Button"
import { Bot, FileText, Briefcase, Building2, CheckCircle2, Trash2, Building, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import AIAvatarPanel, { speakText, cancelSpeech } from "../components/AIAvatarPanel"
import VideoInterview from "../components/VideoInterview"
import ATSReviewPhase from "../components/ATSReviewPhase"

const CACHE_KEY = (email) => `careernode_profile_${email ?? "guest"}`

const COMPANY_LOGOS = {
  none: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
      <circle cx="12" cy="12" r="10"/>
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  ),
  amazon:    () => <img src="/logos/amazon.webp"   alt="Amazon"    className="w-7 h-7 object-contain" />,
  google:    () => <img src="/logos/google.jpg"    alt="Google"    className="w-7 h-7 object-contain" />,
  microsoft: () => (
    <svg viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor">
      <path d="M11.4 11.4H0V0h11.4v11.4z" fill="#F25022"/>
      <path d="M24 11.4H12.6V0H24v11.4z" fill="#7FBA00"/>
      <path d="M11.4 24H0V12.6h11.4V24z" fill="#00A4EF"/>
      <path d="M24 24H12.6V12.6H24V24z" fill="#FFB900"/>
    </svg>
  ),
  meta: () => <img src="/logos/meta.png" alt="Meta" className="w-7 h-7 object-contain" />,
}

const COMPANY_PRESETS = [
  { id: "none",      label: "Any",       hint: "Balanced mix of topics" },
  { id: "amazon",    label: "Amazon",    hint: "Leadership principles + practical systems" },
  { id: "google",    label: "Google",    hint: "Algorithms + depth of reasoning" },
  { id: "microsoft", label: "Microsoft", hint: "System design + product thinking" },
  { id: "meta",      label: "Meta",      hint: "Scale + ML/data focus" },
]

// ────────────────────────────────────────────────────────────────────────────
// SETUP PHASE
// ────────────────────────────────────────────────────────────────────────────
function SetupPhase({ onStart }) {
  const { user } = useAuth()
  const [savedProfile, setSavedProfile]       = useState(null)
  const [resumeFile, setResumeFile]           = useState(null)
  const [role, setRole]                       = useState("")
  const [company, setCompany]                 = useState("")
  const [selectedCompany, setSelectedCompany] = useState("none")
  const [isStarting, setIsStarting]           = useState(false)
  const [error, setError]                     = useState(null)

  useEffect(() => {
    if (!user?.email) return
    const cached = localStorage.getItem(CACHE_KEY(user.email))
    if (cached) {
      const parsed = JSON.parse(cached)
      if (parsed.role && parsed.company) {
        setSavedProfile(parsed); setRole(parsed.role); setCompany(parsed.company)
      } else {
        localStorage.removeItem(CACHE_KEY(user.email))
      }
    }
  }, [user?.email])

  const handleStart = async (e) => {
    e.preventDefault()
    if (!role || !company || (!savedProfile && !resumeFile)) return
    setIsStarting(true); setError(null)

    const preset = COMPANY_PRESETS.find(p => p.id === selectedCompany)
    const companyHint = preset?.id !== "none" ? preset.label : company

    const formData = new FormData()
    formData.append("role", role)
    formData.append("company", companyHint)
    if (resumeFile) formData.append("resume", resumeFile)
    else formData.append("resume_text", savedProfile.resume_text)

    try {
      const res = await fetch("http://127.0.0.1:8000/run", { method: "POST", body: formData })
      if (!res.ok) throw new Error("Backend error")
      const data = await res.json()
      if (data.resume_text && user?.email) {
        localStorage.setItem(CACHE_KEY(user.email), JSON.stringify({ resume_text: data.resume_text, role, company }))
      }
      onStart(data, role, companyHint)
    } catch {
      setError("Cannot connect to backend. Is the FastAPI server running on port 8000?")
    } finally {
      setIsStarting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#080b14] flex items-center justify-center p-6">
      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}
        className="w-full max-w-xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium mb-2">
            <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
            Video Interview Mode
          </div>
          <h1 className="text-3xl font-black text-white">Configure Your Session</h1>
          <p className="text-slate-400">Voice-only · Full-screen · AI adaptive interviewing</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">{error}</div>
        )}

        <div className="bg-slate-900/80 border border-slate-700/60 rounded-2xl p-6 space-y-5 backdrop-blur-sm shadow-2xl">
          <form onSubmit={handleStart} className="space-y-5">
            {/* Resume */}
            {savedProfile ? (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-300">Resume Cached &amp; Ready</p>
                    <p className="text-xs text-emerald-600 mt-0.5">
                      {role && company ? "All set — click Start Interview!" : "Fill in Role & Company to continue."}
                    </p>
                  </div>
                </div>
                <button type="button"
                  onClick={() => { localStorage.removeItem(CACHE_KEY(user?.email)); setSavedProfile(null); setRole(""); setCompany("") }}
                  className="text-emerald-600 hover:text-rose-400 transition-colors ml-4">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2 text-slate-300">
                  <FileText className="w-4 h-4" /> Upload Resume (PDF or TXT)
                </label>
                <Input type="file" accept=".pdf,.txt" onChange={e => setResumeFile(e.target.files[0])}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-500/20 file:text-violet-400 hover:file:bg-violet-500/30 py-2 h-auto" required />
              </div>
            )}

            {/* Role + Company */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium flex items-center gap-1.5 text-slate-400">
                  <Briefcase className="w-3.5 h-3.5" /> Target Role
                </label>
                <Input placeholder="e.g. Data Scientist" value={role} onChange={e => setRole(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium flex items-center gap-1.5 text-slate-400">
                  <Building2 className="w-3.5 h-3.5" /> Your Company
                </label>
                <Input placeholder="e.g. Startup" value={company} onChange={e => setCompany(e.target.value)} required />
              </div>
            </div>

            {/* Company preset */}
            <div className="space-y-2">
              <label className="text-xs font-medium flex items-center gap-1.5 text-slate-400">
                <Building className="w-3.5 h-3.5 text-yellow-400" /> Interview Style
              </label>
              <div className="grid grid-cols-5 gap-2">
                {COMPANY_PRESETS.map(p => {
                  const Logo = COMPANY_LOGOS[p.id]
                  return (
                    <motion.button whileHover={{scale:1.05}} whileTap={{scale:0.95}}
                      key={p.id} type="button" onClick={() => setSelectedCompany(p.id)}
                      className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-center transition-all text-xs ${
                        selectedCompany === p.id
                          ? "border-violet-500/50 bg-violet-500/10 text-violet-300"
                          : "border-slate-700/60 bg-slate-800/50 text-slate-500 hover:border-slate-600 hover:text-slate-300"
                      }`}>
                      <Logo />
                      <span className="font-medium">{p.label}</span>
                    </motion.button>
                  )
                })}
              </div>
            </div>

            <Button type="submit" className="w-full h-12 text-base font-bold"
              disabled={isStarting || !role || !company || (!savedProfile && !resumeFile)}>
              {isStarting
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing profile…</>
                : "Enter Interview Room →"}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// LIVE INTERVIEW PHASE — 50/50 split screen
// ────────────────────────────────────────────────────────────────────────────
function LiveInterviewPhase({ initialData, role, company }) {
  const navigate = useNavigate()
  const { setInterviewData, saveToHistory } = useInterview()
  const { updateAfterInterview }            = useGamification()

  const [interviewState, setInterviewState] = useState(initialData)
  const [messages, setMessages]             = useState([])
  const [isSubmitting, setIsSubmitting]     = useState(false)
  const [isSpeaking, setIsSpeaking]         = useState(false)
  const [isListening, setIsListening]       = useState(false)
  const [confidenceData, setConfidenceData] = useState(null)
  const [questionCount, setQuestionCount]   = useState(initialData?.questions?.length || 0)
  const [difficulty, setDifficulty]         = useState(initialData?.difficulty || "medium")
  const [currentQuestion, setCurrentQuestion] = useState("")
  const [speakingDurationS, setSpeakingDurationS] = useState(30)

  const prevStateRef = useRef(null)

  // Speak the first question on mount
  useEffect(() => {
    const q = initialData?.questions?.[initialData.questions.length - 1]
    if (q) {
      setCurrentQuestion(q)
      speakQuestion(q)
    }
  }, [])

  const speakQuestion = async (text) => {
    setIsSpeaking(true)
    setIsListening(false)
    await speakText(
      text,
      () => setIsSpeaking(true),
      () => {
        setIsSpeaking(false)
        setIsListening(true) // auto-start mic after AI finishes
      }
    )
  }

  const handleTranscript = async (transcript, durationS) => {
    if (!transcript || isSubmitting) return
    setIsListening(false)
    setIsSubmitting(true)
    setSpeakingDurationS(durationS ?? 30)

    // Log user message
    setMessages(prev => [...prev, { role: "user", content: transcript }])

    try {
      const res = await fetch("http://127.0.0.1:8000/stream-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          state: interviewState,
          answer: transcript,
          speaking_duration_s: durationS ?? 30,
        }),
      })
      if (!res.ok) throw new Error("Backend error")

      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = "", newState = null, aiText = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

        const parts = buffer.split("\n\n")
        buffer = parts.pop() ?? ""

        for (const part of parts) {
          const lines     = part.split("\n")
          const eventLine = lines.find(l => l.startsWith("event:"))
          const dataLine  = lines.find(l => l.startsWith("data:"))
          if (!eventLine || !dataLine) continue

          const eventType = eventLine.replace("event:", "").trim()
          const data      = JSON.parse(dataLine.replace("data:", "").trim())

          if (eventType === "meta") {
            newState = { ...interviewState, ...data }
            setInterviewState(newState)
            setQuestionCount(data.questions?.length || 0)
            setDifficulty(data.difficulty || "medium")

            // Extract confidence data returned by backend
            if (data.confidence_data && Object.keys(data.confidence_data).length) {
              setConfidenceData(data.confidence_data)
            }

            if (data.complete) {
              cancelSpeech()
              const avgScore = data.scores?.reduce((a,b) => a+b, 0) / (data.scores?.length || 1)
              updateAfterInterview([], avgScore)
              saveToHistory({ ...newState, role, company })
              setInterviewData(newState)
              setTimeout(() => navigate("/results"), 2500)
              return
            }
          }

          if (eventType === "token") {
            aiText += data
          }

          if (eventType === "done") {
            if (aiText) {
              setCurrentQuestion(aiText)
              setMessages(prev => [...prev, { role: "ai", content: aiText }])
              speakQuestion(aiText)
              aiText = ""
            }
          }
        }
      }
    } catch (err) {
      console.error("Interview error:", err)
      setMessages(prev => [...prev, { role: "system", content: "⚠️ Connection error. Please check backend." }])
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 flex bg-[#060810] overflow-hidden"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* ── LEFT PANEL — AI Interviewer ────────────────────────────── */}
      <div className="w-1/2 h-full border-r border-slate-800/60 relative"
        style={{ background: "radial-gradient(ellipse at 50% 30%, #0d0f1e 0%, #060810 100%)" }}>

        {/* Ambient background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)" }} />
        </div>

        <AIAvatarPanel
          currentQuestion={currentQuestion}
          isSpeaking={isSpeaking}
          isListening={isListening}
          isThinking={isSubmitting}
          questionCount={questionCount}
          difficulty={difficulty}
          role={role}
          company={company}
        />
      </div>

      {/* ── RIGHT PANEL — User Webcam ───────────────────────────────── */}
      <div className="w-1/2 h-full relative"
        style={{ background: "radial-gradient(ellipse at 50% 70%, #0b0e1a 0%, #060810 100%)" }}>

        {/* Ambient glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)" }} />
        </div>

        {/* User label */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 text-sm font-semibold text-slate-300 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-700/50">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          You
        </div>

        <VideoInterview
          onTranscript={handleTranscript}
          isSubmitting={isSubmitting}
          isListeningMode={isListening}
          confidenceData={confidenceData}
          onRecordingStart={() => setIsListening(true)}
          onRecordingStop={(d) => { setSpeakingDurationS(d); setIsListening(false) }}
        />
      </div>

      {/* ── Top bar — session info ───────────────────────────────────── */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-3 border-b border-slate-800/60 bg-black/30 backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
            <Bot size={14} className="text-white" />
          </div>
          <div>
            <span className="text-xs font-bold text-white">CareerNode</span>
            <span className="text-xs text-slate-500 ml-2">AI Interview Simulation</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span>{role}</span>
          <span className="text-slate-700">·</span>
          <span>{company}</span>
          <span className="text-slate-700">·</span>
          <span className={`font-semibold px-2 py-0.5 rounded-full ${
            difficulty === "hard" ? "text-rose-400 bg-rose-500/10" :
            difficulty === "medium" ? "text-amber-400 bg-amber-500/10" :
            "text-emerald-400 bg-emerald-500/10"
          }`}>{(difficulty || "medium").toUpperCase()}</span>
          <span className="text-slate-700">·</span>
          <span>Q{questionCount}</span>
        </div>

        {/* Status indicator */}
        <div className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full border ${
          isSpeaking ? "border-violet-500/30 bg-violet-500/10 text-violet-400" :
          isListening ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" :
          isSubmitting ? "border-blue-500/30 bg-blue-500/10 text-blue-400" :
          "border-slate-700 bg-slate-800/50 text-slate-500"
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${
            isSpeaking ? "bg-violet-400 animate-pulse" :
            isListening ? "bg-emerald-400 animate-ping" :
            isSubmitting ? "bg-blue-400 animate-spin" :
            "bg-slate-600"
          }`} />
          {isSpeaking ? "AI Speaking" : isListening ? "Listening" : isSubmitting ? "Evaluating" : "Ready"}
        </div>
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// ROOT EXPORT
// ────────────────────────────────────────────────────────────────────────────
export default function Interview() {
  const [phase, setPhase]   = useState("setup")
  const [initData, setInitData] = useState(null)
  const [role, setRole]     = useState("")
  const [company, setCompany] = useState("")

  const handleStart = (data, r, c) => {
    setInitData(data)
    setRole(r)
    setCompany(c)
    // Show ATS review if ATS data is available
    if (data?.ats_data && Object.keys(data.ats_data).length > 0) {
      setPhase("ats_review")
    } else {
      setPhase("live")
    }
  }

  if (phase === "setup") {
    return <SetupPhase onStart={handleStart} />
  }

  if (phase === "ats_review") {
    return (
      <ATSReviewPhase 
        atsData={initData.ats_data} 
        role={role} 
        onContinue={() => setPhase("live")} 
      />
    )
  }

  return <LiveInterviewPhase initialData={initData} role={role} company={company} />
}
