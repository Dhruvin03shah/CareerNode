import { motion } from "framer-motion"
import { BrainCircuit, User } from "lucide-react"

export default function DemoPreview() {
  return (
    <section className="py-24 overflow-hidden" id="demo">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          
          <div className="lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-sm font-medium mb-6 border border-blue-500/20">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" /> Live Interaction
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Conversational AI that pushes back</h2>
              <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                Forget static questionnaires. Our agent evaluates your answers in real-time. If you give a vague or shallow answer, the AI detects it and immediately prompts a deep-dive follow-up question.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  "Dynamic difficulty scaling",
                  "Detects evasive or short answers",
                  "Follow-up probes up to 2 levels deep"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-medium">
                    <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs border border-blue-500/30">✓</div>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          <div className="lg:w-1/2 w-full">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl p-6"
            >
              {/* Glowing backplate */}
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-blue-600/20 to-purple-600/20 blur-xl -z-10" />

              <div className="space-y-6">
                {/* AI Msg */}
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 border border-blue-500/30">
                    <BrainCircuit className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="bg-white/5 rounded-2xl rounded-tl-none p-4 text-sm leading-relaxed border border-white/5">
                    Can you walk me through how you optimized the database queries in your recent microservices project?
                  </div>
                </div>

                {/* User Msg */}
                <div className="flex gap-4 flex-row-reverse">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 border border-indigo-500/30">
                    <User className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="bg-indigo-500/10 rounded-2xl rounded-tr-none p-4 text-sm leading-relaxed border border-indigo-500/20 text-indigo-100">
                    I added some indexes to the tables and used caching. It sped things up quite a bit.
                  </div>
                </div>

                {/* AI Followup */}
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0 border border-orange-500/30">
                    <BrainCircuit className="w-4 h-4 text-orange-400" />
                  </div>
                  <div className="bg-orange-500/10 rounded-2xl rounded-tl-none p-4 text-sm leading-relaxed border border-orange-500/20 relative overflow-hidden">
                    <span className="text-orange-200">That's a good start, but quite high-level. Can you specify <span className="font-semibold text-orange-400">which caching strategy</span> (e.g. Write-through vs Cache-aside) you used, and how you handled cache invalidation?</span>
                    {/* Simulated cursor */}
                    <motion.span 
                      animate={{ opacity: [1, 0] }} 
                      transition={{ duration: 0.8, repeat: Infinity }}
                      className="inline-block w-1.5 h-4 bg-orange-400 ml-1 align-middle" 
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  )
}
