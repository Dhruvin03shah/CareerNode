import { motion } from "framer-motion"
import { CheckCircle2, AlertTriangle, Lightbulb, XCircle, ArrowRight, FileText } from "lucide-react"

function CircularScore({ score, label, colorClass, trackColor }) {
  const circumference = 2 * Math.PI * 36
  const offset = circumference - (score / 100) * circumference
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24">
        <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
          <circle cx="40" cy="40" r="36" fill="none" stroke={trackColor} strokeWidth="8" />
          <motion.circle cx="40" cy="40" r="36" fill="none"
            className={colorClass} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black text-white">{score}</span>
        </div>
      </div>
      <span className="text-xs font-semibold text-slate-400 mt-3 uppercase tracking-wider">{label}</span>
    </div>
  )
}

export default function ATSReviewPhase({ atsData, role, onContinue }) {
  if (!atsData) {
    return (
      <div className="min-h-screen bg-[#080b14] flex flex-col items-center justify-center">
        <p className="text-slate-400">Loading ATS Review...</p>
      </div>
    )
  }

  const atsScore = atsData.ats_score || 0
  const kwScore = atsData.keyword_match_score || 0
  
  const scoreColor = atsScore > 80 ? "stroke-emerald-500" : atsScore > 60 ? "stroke-amber-500" : "stroke-rose-500"
  const kwColor = kwScore > 80 ? "stroke-emerald-500" : kwScore > 60 ? "stroke-amber-500" : "stroke-rose-500"

  return (
    <div className="min-h-screen bg-[#080b14] p-8 overflow-y-auto" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="max-w-4xl mx-auto space-y-8 pb-20">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium">
            <FileText size={16} /> Resume ATS Evaluation
          </div>
          <h1 className="text-3xl font-black text-white">Target Role: <span className="text-violet-400">{role}</span></h1>
          <p className="text-slate-400 max-w-2xl mx-auto">We scanned your resume exactly how an Applicant Tracking System (ATS) would. Here is what recruiters and hiring managers will see.</p>
        </motion.div>

        {/* Scores */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-6 bg-slate-900/60 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-sm max-w-2xl mx-auto">
          <CircularScore score={atsScore} label="Overall ATS Score" colorClass={scoreColor} trackColor="rgba(255,255,255,0.05)" />
          <CircularScore score={kwScore} label="Keyword Match" colorClass={kwColor} trackColor="rgba(255,255,255,0.05)" />
        </motion.div>

        {/* Strengths & Weaknesses */}
        <div className="grid md:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6 space-y-4">
            <h3 className="text-emerald-400 font-bold flex items-center gap-2"><CheckCircle2 size={18} /> Strengths</h3>
            <ul className="space-y-3">
              {atsData.strengths?.map((s, i) => (
                <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                  <span className="text-emerald-500 mt-1">•</span> {s}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
            className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-6 space-y-4">
            <h3 className="text-rose-400 font-bold flex items-center gap-2"><AlertTriangle size={18} /> Critical Gaps</h3>
            <ul className="space-y-3">
              {atsData.weaknesses?.map((w, i) => (
                <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                  <span className="text-rose-500 mt-1">•</span> {w}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Missing Keywords */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-slate-200 font-bold flex items-center gap-2"><XCircle size={18} className="text-amber-500" /> Missing Role Keywords</h3>
          <div className="flex flex-wrap gap-2">
            {atsData.missing_keywords?.map((kw, i) => (
              <span key={i} className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold rounded-lg">
                {kw}
              </span>
            ))}
            {(!atsData.missing_keywords || atsData.missing_keywords.length === 0) && (
              <span className="text-sm text-slate-500">Your resume covers all major keywords!</span>
            )}
          </div>
        </motion.div>

        {/* Improved Bullets */}
        {atsData.improved_bullets?.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-5">
            <h3 className="text-slate-200 font-bold flex items-center gap-2"><Lightbulb size={18} className="text-violet-400" /> AI Bullet Improvements</h3>
            <p className="text-sm text-slate-400">Here is how you can rewrite your experience to include metrics and impact.</p>
            
            <div className="space-y-4">
              {atsData.improved_bullets.map((bullet, i) => (
                <div key={i} className="bg-black/40 rounded-xl p-4 border border-slate-800/50 space-y-3">
                  <div>
                    <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider mb-1 block">Original (Weak)</span>
                    <p className="text-sm text-slate-400 line-through decoration-rose-500/30">{bullet.original}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1 block">Improved (Impact-Driven)</span>
                    <p className="text-sm text-slate-200 font-medium">{bullet.improved}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Action Button */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="pt-8 flex justify-center">
          <button onClick={onContinue} className="group relative px-8 py-4 bg-violet-600 hover:bg-violet-500 text-white rounded-full font-bold text-lg shadow-xl shadow-violet-600/20 transition-all flex items-center gap-3">
            Enter Live Interview
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            <div className="absolute inset-0 rounded-full border-2 border-white/20 scale-105 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all" />
          </button>
        </motion.div>

      </div>
    </div>
  )
}
