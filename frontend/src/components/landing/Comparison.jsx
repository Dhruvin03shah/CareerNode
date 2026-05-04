import { motion } from "framer-motion"
import { CheckCircle2, XCircle } from "lucide-react"

export default function Comparison() {
  const traditional = [
    "Static, pre-written question banks",
    "No feedback on your specific answers",
    "No follow-up questions",
    "Generic textbook scenarios",
    "You don't know what you don't know"
  ]

  const careernode = [
    "Dynamic, context-aware question generation",
    "Strict 1-10 scoring & detailed feedback",
    "Depth-aware follow-up probes",
    "Real-world, role-specific scenarios",
    "Actionable, personalized learning paths"
  ]

  return (
    <section className="py-24">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why CareerNode AI?</h2>
          <p className="text-muted-foreground text-lg">See how we stack up against traditional prep methods.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Traditional Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm"
          >
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-foreground/80">
              Traditional Platforms
            </h3>
            <ul className="space-y-4">
              {traditional.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-muted-foreground">
                  <XCircle className="w-5 h-5 text-rose-500/70 shrink-0 mt-0.5" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* CareerNode Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="p-8 rounded-3xl bg-gradient-to-b from-blue-500/10 to-indigo-500/5 border border-blue-500/30 backdrop-blur-sm relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 blur-[50px] rounded-full" />
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-blue-100">
              CareerNode AI <span className="px-2 py-0.5 rounded text-xs bg-blue-500/20 text-blue-400 ml-2">PRO</span>
            </h3>
            <ul className="space-y-4 relative z-10">
              {careernode.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-blue-50">
                  <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <span className="text-sm font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
