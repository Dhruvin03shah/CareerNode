import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bot, Mic, Loader2, ChevronRight } from "lucide-react"

/** Load voices, waiting for the voiceschanged event if needed (async-safe). */
function getVoicesAsync() {
  return new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices()
    if (voices.length > 0) { resolve(voices); return }
    // Chrome loads voices asynchronously
    window.speechSynthesis.onvoiceschanged = () => {
      resolve(window.speechSynthesis.getVoices())
    }
    // Fallback after 1s
    setTimeout(() => resolve(window.speechSynthesis.getVoices()), 1000)
  })
}

/** Speak the text using Web Speech API, return Promise that resolves when done. */
export async function speakText(text, onStart, onEnd) {
  if (!window.speechSynthesis) { onEnd?.(); return }

  const voices    = await getVoicesAsync()
  const preferred = voices.find(v =>
    /Google US English|Microsoft Aria|Samantha|Alex/i.test(v.name)
  )

  return new Promise((resolve) => {
    // Cancel just before speaking to prevent React StrictMode double-queuing after the async await
    window.speechSynthesis.cancel()

    const utterance   = new SpeechSynthesisUtterance(text)
    utterance.rate    = 0.95
    utterance.pitch   = 1.0
    if (preferred) utterance.voice = preferred

    utterance.onstart = () => onStart?.()
    utterance.onend   = () => { onEnd?.(); resolve() }
    utterance.onerror = () => { onEnd?.(); resolve() }
    
    window.speechSynthesis.speak(utterance)
  })
}

export function cancelSpeech() {
  if (window.speechSynthesis) window.speechSynthesis.cancel()
}

// ── Animated AI face ────────────────────────────────────────────────────────
function AIFace({ isSpeaking, isListening, isThinking }) {
  return (
    <div className="relative flex items-center justify-center">
      {/* Outer glow rings */}
      {isSpeaking && (
        <>
          <motion.div
            className="absolute rounded-full border border-violet-500/30"
            animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            style={{ width: 180, height: 180 }}
          />
          <motion.div
            className="absolute rounded-full border border-blue-500/20"
            animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
            style={{ width: 180, height: 180 }}
          />
        </>
      )}

      {/* Avatar circle */}
      <motion.div
        className="relative w-36 h-36 rounded-full flex items-center justify-center overflow-hidden border-2"
        style={{
          background: "radial-gradient(circle at 40% 35%, #312e81, #1e1b4b 60%, #0f0f1a)",
          borderColor: isSpeaking ? "#7c3aed" : isListening ? "#10b981" : "#334155",
          boxShadow: isSpeaking
            ? "0 0 40px rgba(124,58,237,0.5), inset 0 0 20px rgba(124,58,237,0.15)"
            : isListening
            ? "0 0 30px rgba(16,185,129,0.3)"
            : "0 0 20px rgba(0,0,0,0.5)",
        }}
        animate={isSpeaking ? { borderColor: ["#7c3aed", "#6366f1", "#7c3aed"] } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        {/* Neural network pattern overlay */}
        <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 144 144">
          <circle cx="72" cy="72" r="60" stroke="#818cf8" strokeWidth="0.5" fill="none" />
          <circle cx="72" cy="72" r="45" stroke="#818cf8" strokeWidth="0.5" fill="none" />
          <circle cx="72" cy="72" r="30" stroke="#818cf8" strokeWidth="0.5" fill="none" />
          {[0,60,120,180,240,300].map(angle => (
            <line key={angle}
              x1="72" y1="72"
              x2={72 + 55*Math.cos(angle*Math.PI/180)}
              y2={72 + 55*Math.sin(angle*Math.PI/180)}
              stroke="#818cf8" strokeWidth="0.5" />
          ))}
        </svg>

        {/* Bot icon */}
        <motion.div
          animate={isSpeaking
            ? { scale: [1, 1.08, 1], y: [0, -2, 0] }
            : isThinking
            ? { rotate: [0, 5, -5, 0] }
            : {}}
          transition={{ duration: 0.8, repeat: Infinity }}
        >
          <Bot size={52} className="text-violet-300 drop-shadow-lg" />
        </motion.div>

        {/* Speaking mouth pulse */}
        {isSpeaking && (
          <div className="absolute bottom-6 flex gap-0.5 items-end">
            {[3,6,4,7,3,5,4].map((h, i) => (
              <motion.div
                key={i}
                className="w-1 rounded-full bg-violet-400"
                animate={{ height: [h, h+8, h] }}
                transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.07 }}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* Status badge */}
      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
        <AnimatePresence mode="wait">
          {isSpeaking ? (
            <motion.div key="speaking" initial={{opacity:0,y:4}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-4}}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-violet-600/90 text-white shadow-lg">
              <Mic size={10} className="animate-pulse" /> Speaking…
            </motion.div>
          ) : isThinking ? (
            <motion.div key="thinking" initial={{opacity:0,y:4}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-4}}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-600/90 text-white shadow-lg">
              <Loader2 size={10} className="animate-spin" /> Evaluating…
            </motion.div>
          ) : isListening ? (
            <motion.div key="listening" initial={{opacity:0,y:4}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-4}}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-600/90 text-white shadow-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" /> Listening…
            </motion.div>
          ) : (
            <motion.div key="idle" initial={{opacity:0,y:4}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-4}}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-700/90 text-slate-300 shadow-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" /> Ready
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ── Progress indicators ──────────────────────────────────────────────────────
function QuestionProgress({ questionCount, difficulty }) {
  const total = 10
  const color = difficulty === "hard" ? "bg-rose-500" : difficulty === "medium" ? "bg-amber-500" : "bg-emerald-500"
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-slate-400">
        <span>Question {questionCount} of ~{total}</span>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
          difficulty === "hard" ? "bg-rose-500/20 text-rose-400" :
          difficulty === "medium" ? "bg-amber-500/20 text-amber-400" :
          "bg-emerald-500/20 text-emerald-400"
        }`}>{difficulty || "medium"}</span>
      </div>
      <div className="flex gap-1">
        {Array.from({length: total}).map((_, i) => (
          <motion.div key={i} className={`h-1 flex-1 rounded-full ${i < questionCount ? color : "bg-slate-700"}`}
            animate={i === questionCount - 1 ? {opacity:[0.5,1,0.5]} : {}}
            transition={{duration:1.5, repeat:Infinity}} />
        ))}
      </div>
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────
export default function AIAvatarPanel({
  currentQuestion,
  isSpeaking,
  isListening,
  isThinking,
  questionCount,
  difficulty,
  role,
  company,
}) {
  const [displayedWords, setDisplayedWords] = useState([])
  const wordsRef = useRef([])

  // Animate question words in one-by-one when question changes
  useEffect(() => {
    if (!currentQuestion) { setDisplayedWords([]); return }
    setDisplayedWords([])
    wordsRef.current = []
    const words = currentQuestion.split(" ")
    words.forEach((word, i) => {
      setTimeout(() => {
        wordsRef.current = [...wordsRef.current, word]
        setDisplayedWords([...wordsRef.current])
      }, i * 60)
    })
  }, [currentQuestion])

  return (
    <div className="h-full flex flex-col items-center justify-between py-8 px-6 select-none">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-300">
          <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
          AI Interviewer
        </div>
        <p className="text-xs text-slate-500">
          {role && company ? `${role} at ${company}` : "Configuring session…"}
        </p>
      </div>

      {/* Avatar */}
      <AIFace isSpeaking={isSpeaking} isListening={isListening} isThinking={isThinking} />

      {/* Question subtitle box */}
      <div className="w-full space-y-4">
        <QuestionProgress questionCount={questionCount || 0} difficulty={difficulty} />

        <AnimatePresence mode="wait">
          {currentQuestion && (
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="relative rounded-2xl border border-violet-500/20 bg-slate-900/80 backdrop-blur-sm p-4 shadow-xl shadow-black/40"
            >
              {/* Accent line */}
              <div className="absolute left-0 top-4 bottom-4 w-0.5 rounded-full bg-gradient-to-b from-violet-500 to-blue-500" />
              <div className="pl-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <ChevronRight size={12} className="text-violet-400" />
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-violet-400">Current Question</span>
                </div>
                <p className="text-sm leading-relaxed text-slate-100 font-medium">
                  {displayedWords.map((word, i) => (
                    <motion.span key={`${currentQuestion}-${i}`} initial={{opacity:0}} animate={{opacity:1}}
                      transition={{duration:0.2}} className="inline-block mr-[0.25em]">
                      {word}
                    </motion.span>
                  ))}
                  {isSpeaking && <span className="inline-block w-[2px] h-[0.9em] bg-violet-400 align-middle ml-0.5 animate-pulse" />}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
