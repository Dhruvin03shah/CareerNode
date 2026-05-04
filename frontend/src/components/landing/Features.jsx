import { motion } from "framer-motion"
import { BrainCircuit, Activity, TrendingUp, BarChart, Crosshair, Award } from "lucide-react"

const features = [
  {
    title: "Adaptive Interview Engine",
    description: "Questions dynamically adapt in difficulty and depth based on your real-time performance.",
    icon: BrainCircuit,
    color: "text-blue-400"
  },
  {
    title: "Real-Time AI Evaluation",
    description: "Get immediate, strict scoring and detailed feedback on accuracy, clarity, and depth.",
    icon: Activity,
    color: "text-purple-400"
  },
  {
    title: "Personalized Learning Path",
    description: "AI generates a custom study roadmap targeting your specific weak areas discovered during the interview.",
    icon: TrendingUp,
    color: "text-emerald-400"
  },
  {
    title: "Skill Gap Analysis",
    description: "Visual radar charts map out your technical strengths and pinpoint exact areas for improvement.",
    icon: BarChart,
    color: "text-orange-400"
  },
  {
    title: "FAANG-Level Questioning",
    description: "Experience advanced, scenario-based questions designed to test depth, not just textbook definitions.",
    icon: Crosshair,
    color: "text-red-400"
  },
  {
    title: "Performance Tracking",
    description: "Earn XP, unlock badges, and track your interview readiness over time with comprehensive history logs.",
    icon: Award,
    color: "text-amber-400"
  }
]

export default function Features() {
  return (
    <section className="py-24 relative" id="features">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Intelligent features to land your dream job</h2>
          <p className="text-muted-foreground text-lg">
            A comprehensive suite of tools designed to simulate high-pressure technical interviews.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:border-blue-500/50 transition-colors group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 border border-white/10 ${feat.color}`}>
                <feat.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feat.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feat.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
