import { motion } from "framer-motion"
import { FileUp, MessageSquareCode, GraduationCap } from "lucide-react"

const steps = [
  {
    number: "01",
    title: "Upload Your Resume",
    description: "Our AI extracts your core skills, recent experience, and projects to tailor the interview context.",
    icon: FileUp
  },
  {
    number: "02",
    title: "Take AI Interview",
    description: "Engage in a dynamic, conversational interview that pushes back on vague answers and probes deeply into your technical knowledge.",
    icon: MessageSquareCode
  },
  {
    number: "03",
    title: "Get Actionable Feedback",
    description: "Receive a strict 1-10 score, detailed strengths/weaknesses, and a generated learning path to close your skill gaps.",
    icon: GraduationCap
  }
]

export default function HowItWorks() {
  return (
    <section className="py-24 bg-black/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How it works</h2>
          <p className="text-muted-foreground text-lg">Three simple steps to interview mastery.</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="relative flex flex-col items-center text-center"
              >
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-b from-blue-500/20 to-purple-500/5 border border-white/10 flex items-center justify-center mb-6 relative z-10 backdrop-blur-md">
                  <step.icon className="w-10 h-10 text-blue-400" />
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm font-bold shadow-lg shadow-indigo-500/20 border border-indigo-400/50">
                    {step.number}
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed px-4">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
