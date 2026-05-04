import { useState, useRef, useEffect, useCallback } from "react"
import Webcam from "react-webcam"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, MicOff, Loader2, Video, VideoOff, AlertCircle } from "lucide-react"

// ── Confidence Gauge ─────────────────────────────────────────────────────────
function ConfidenceGauge({ score, level, signals }) {
  const color =
    level === "High" ? "#10b981" :
    level === "Medium" ? "#f59e0b" : "#ef4444"

  const trackColor =
    level === "High" ? "rgba(16,185,129,0.15)" :
    level === "Medium" ? "rgba(245,158,11,0.15)" : "rgba(239,68,68,0.15)"

  const circumference = 2 * Math.PI * 36
  const offset = circumference - (score / 100) * circumference

  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      className="bg-slate-900/90 border border-slate-700/60 rounded-2xl p-4 space-y-3 shadow-xl backdrop-blur-sm">
      <div className="flex items-center gap-3">
        {/* Circular gauge */}
        <div className="relative w-20 h-20 shrink-0">
          <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
            <circle cx="40" cy="40" r="36" fill="none" stroke={trackColor} strokeWidth="7" />
            <motion.circle cx="40" cy="40" r="36" fill="none"
              stroke={color} strokeWidth="7" strokeLinecap="round"
              strokeDasharray={circumference}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-black leading-none" style={{ color }}>{score}</span>
            <span className="text-[9px] text-slate-400 font-medium uppercase tracking-wide">Score</span>
          </div>
        </div>

        {/* Level + top signal */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{
              background: trackColor, color
            }}>{level} Confidence</span>
          </div>
          {signals?.slice(0, 2).map((sig, i) => (
            <p key={i} className="text-[11px] text-slate-400 leading-snug truncate">{sig}</p>
          ))}
        </div>
      </div>

      {/* Bar breakdown */}
      {signals?.length > 2 && (
        <div className="space-y-1 pt-1 border-t border-slate-700/50">
          {signals.slice(2).map((sig, i) => (
            <p key={i} className="text-[10px] text-slate-500 leading-snug">• {sig}</p>
          ))}
        </div>
      )}
    </motion.div>
  )
}

// ── Recording timer ───────────────────────────────────────────────────────────
function RecordingTimer({ isRecording, maxSeconds = 60 }) {
  const [elapsed, setElapsed] = useState(0)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (isRecording) {
      setElapsed(0)
      intervalRef.current = setInterval(() => setElapsed(s => s + 1), 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [isRecording])

  const pct = Math.min(elapsed / maxSeconds, 1) * 100
  const overLimit = elapsed >= maxSeconds

  const fmt = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className={`font-mono font-bold ${overLimit ? "text-rose-400 animate-pulse" : "text-white"}`}>
          {fmt(elapsed)}
        </span>
        <span className="text-slate-500">{fmt(maxSeconds)} max</span>
      </div>
      <div className="h-1 rounded-full bg-slate-700 overflow-hidden">
        <motion.div className={`h-full rounded-full ${overLimit ? "bg-rose-500" : "bg-emerald-500"}`}
          animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }} />
      </div>
    </div>
  )
}

// ── Waveform visualizer ────────────────────────────────────────────────────────
function AudioWaveform({ isRecording }) {
  return (
    <div className="flex items-center gap-[3px] h-6">
      {Array.from({length: 12}).map((_, i) => (
        <motion.div key={i}
          className="w-[3px] rounded-full bg-emerald-400"
          animate={isRecording
            ? { height: ["6px", `${6 + Math.random()*16}px`, "6px"] }
            : { height: "3px" }}
          transition={{ duration: 0.3 + i*0.05, repeat: Infinity, repeatType: "reverse" }}
        />
      ))}
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────
export default function VideoInterview({
  onTranscript,
  isSubmitting,
  isListeningMode,          // true when AI finished speaking → user should speak
  confidenceData,           // {confidence_score, level, signals}
  onRecordingStart,
  onRecordingStop,          // called with speaking_duration_s
}) {
  const [isRecording, setIsRecording]     = useState(false)
  const [isProcessing, setIsProcessing]   = useState(false)
  const [videoEnabled, setVideoEnabled]   = useState(true)
  const [micError, setMicError]           = useState(null)
  const [showConfidence, setShowConfidence] = useState(false)

  const mediaRecorderRef = useRef(null)
  const audioChunksRef   = useRef([])
  const webcamRef        = useRef(null)
  const streamRef        = useRef(null)
  const startTimeRef     = useRef(null)
  const recognitionRef   = useRef(null)
  const browserTranscriptRef = useRef("")

  // Auto-start recording when it's the user's turn
  useEffect(() => {
    if (isListeningMode && !isRecording && !isProcessing && !isSubmitting) {
      startRecording()
    }
  }, [isListeningMode])

  // Show confidence panel whenever new data arrives
  useEffect(() => {
    if (confidenceData?.confidence_score !== undefined) {
      setShowConfidence(true)
    }
  }, [confidenceData])

  const startRecording = useCallback(async () => {
    setMicError(null)
    browserTranscriptRef.current = ""
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      // Start browser native SpeechRecognition as a fallback
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        // Cleanup old recognition if it exists to prevent Chrome instance conflicts
        if (recognitionRef.current) {
          recognitionRef.current.onend = null
          try { recognitionRef.current.abort() } catch (e) { /* ignore */ }
        }

        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = true
        recognitionRef.current.interimResults = true
        
        recognitionRef.current.onresult = (event) => {
          let finalTranscript = ""
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript + " "
            }
          }
          browserTranscriptRef.current += finalTranscript
        }

        // Keep it running if it stops early (e.g. user pauses)
        recognitionRef.current.onend = () => {
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            try { recognitionRef.current.start() } catch (e) { /* ignore */ }
          }
        }

        try { recognitionRef.current.start() } catch (e) { console.error("SpeechRec start error:", e) }
      }

      // Pick best supported mime type (Chrome prefers webm, Safari uses mp4)
      const mimeType = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/ogg;codecs=opus",
        "audio/mp4",
      ].find(m => MediaRecorder.isTypeSupported(m)) || ""

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {})
      mediaRecorderRef.current = recorder
      audioChunksRef.current   = []
      startTimeRef.current     = Date.now()

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data)
      }

      recorder.onstop = async () => {
        const durationS = (Date.now() - startTimeRef.current) / 1000
        onRecordingStop?.(durationS)
        
        if (recognitionRef.current) {
          recognitionRef.current.onend = null // Prevent auto-restart
          try { recognitionRef.current.stop() } catch (e) { /* ignore */ }
        }

        setIsProcessing(true)
        // Use the actual mime type for the filename extension
        const ext      = mimeType.includes("mp4") ? "mp4" : mimeType.includes("ogg") ? "ogg" : "webm"
        const filename = `recording.${ext}`
        const blob     = new Blob(audioChunksRef.current, { type: mimeType || "audio/webm" })
        const form     = new FormData()
        form.append("audio", blob, filename)

        try {
          const res = await fetch("http://127.0.0.1:8000/speech-to-text", { method: "POST", body: form })
          if (!res.ok) throw new Error("STT failed")
          const data = await res.json()
          
          if (data.transcript?.trim() && !data.transcript.includes("[STT Error")) {
            onTranscript(data.transcript, durationS)
          } else {
            throw new Error(data.transcript || "Invalid STT response")
          }
        } catch (err) {
          console.error("Sarvam STT error:", err)
          console.log("Browser Transcript currently holds:", browserTranscriptRef.current)
          // Fallback to browser STT if available
          if (browserTranscriptRef.current?.trim()) {
            console.log("Falling back to browser SpeechRecognition...")
            onTranscript(browserTranscriptRef.current.trim(), durationS)
          } else {
            setMicError("Could not hear you (no speech detected). Please speak louder and try again.")
          }
        } finally {
          setIsProcessing(false)
          stream.getTracks().forEach(t => t.stop())
        }
      }

      recorder.start(250)
      setIsRecording(true)
      onRecordingStart?.()
    } catch (err) {
      if (err.name === "NotAllowedError") {
        setMicError("Microphone access denied. Please allow microphone access to continue.")
      } else {
        setMicError("Could not access microphone. Check your browser settings.")
      }
      console.error("Mic error:", err)
    }
  }, [onTranscript, onRecordingStart, onRecordingStop])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }, [])

  const retryRecording = () => {
    setMicError(null)
    startRecording()
  }

  const btnLabel = isProcessing
    ? "Processing…"
    : isRecording
    ? "Stop & Submit Answer"
    : isSubmitting
    ? "AI is evaluating…"
    : "Start Speaking"

  const btnColor = isRecording
    ? "bg-rose-600 hover:bg-rose-500 border-rose-500 shadow-rose-500/30"
    : isProcessing || isSubmitting
    ? "bg-slate-700 border-slate-600 cursor-not-allowed"
    : "bg-emerald-600 hover:bg-emerald-500 border-emerald-500 shadow-emerald-500/30"

  return (
    <div className="h-full flex flex-col gap-4 p-4">
      {/* Webcam feed */}
      <div className="relative flex-1 rounded-2xl overflow-hidden bg-black border border-slate-700/60 shadow-2xl shadow-black/60 min-h-0">
        {videoEnabled ? (
          <Webcam
            ref={webcamRef}
            audio={false}
            mirrored={true}
            className="w-full h-full object-cover"
            style={{ minHeight: "100%" }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-slate-600 bg-slate-950">
            <VideoOff size={40} />
            <span className="text-sm">Camera off</span>
          </div>
        )}

        {/* REC indicator */}
        <AnimatePresence>
          {isRecording && (
            <motion.div initial={{opacity:0,scale:0.8}} animate={{opacity:1,scale:1}} exit={{opacity:0}}
              className="absolute top-3 left-3 flex items-center gap-2 bg-rose-600/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
              <motion.span className="w-2 h-2 rounded-full bg-white"
                animate={{opacity:[1,0,1]}} transition={{duration:1,repeat:Infinity}} />
              <span className="text-xs font-bold text-white tracking-wide">REC</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle camera */}
        <button
          type="button"
          onClick={() => setVideoEnabled(v => !v)}
          className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-black/80 rounded-full text-white backdrop-blur-sm transition-colors border border-white/10"
        >
          {videoEnabled ? <Video size={14} /> : <VideoOff size={14} />}
        </button>

        {/* Listening pulse overlay */}
        <AnimatePresence>
          {isListeningMode && !isRecording && !isProcessing && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
              className="absolute inset-0 border-2 border-emerald-500 rounded-2xl pointer-events-none"
              style={{ boxShadow: "0 0 30px rgba(16,185,129,0.3) inset" }}>
              <motion.div className="absolute inset-0 border-2 border-emerald-400 rounded-2xl"
                animate={{ opacity: [0.6, 0, 0.6] }} transition={{ duration: 1.5, repeat: Infinity }} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Waveform when recording */}
        <AnimatePresence>
          {isRecording && (
            <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:8}}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm px-4 py-2 rounded-full border border-emerald-500/30">
              <AudioWaveform isRecording={isRecording} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Timer (only when recording) */}
      <AnimatePresence>
        {isRecording && (
          <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}}>
            <RecordingTimer isRecording={isRecording} maxSeconds={60} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mic error */}
      <AnimatePresence>
        {micError && (
          <motion.div initial={{opacity:0,y:4}} animate={{opacity:1,y:0}} exit={{opacity:0,y:4}}
            className="flex items-start gap-2 bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2.5">
            <AlertCircle size={14} className="text-rose-400 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-rose-300 leading-snug">{micError}</p>
              <button onClick={retryRecording} className="mt-1 text-xs text-rose-400 hover:text-rose-300 underline underline-offset-2">
                Try again
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Control button */}
      <button
        type="button"
        disabled={isProcessing || isSubmitting}
        onClick={isRecording ? stopRecording : startRecording}
        className={`w-full py-3.5 rounded-2xl border font-semibold text-sm text-white transition-all shadow-lg flex items-center justify-center gap-2 ${btnColor}`}
      >
        {isProcessing ? (
          <><Loader2 size={16} className="animate-spin" /> Processing Audio…</>
        ) : isRecording ? (
          <><MicOff size={16} /> Stop &amp; Submit Answer</>
        ) : isSubmitting ? (
          <><Loader2 size={16} className="animate-spin" /> AI is evaluating…</>
        ) : (
          <><Mic size={16} /> Start Speaking</>
        )}
      </button>

      {/* Confidence meter */}
      <AnimatePresence>
        {showConfidence && confidenceData && (
          <ConfidenceGauge
            score={confidenceData.confidence_score ?? 0}
            level={confidenceData.level ?? "Low"}
            signals={confidenceData.signals ?? []}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
