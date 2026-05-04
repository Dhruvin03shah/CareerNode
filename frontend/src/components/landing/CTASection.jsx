import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Button } from "../ui/Button"
import { useNavigate } from "react-router-dom"

export default function CTASection() {
  const navigate = useNavigate()

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-[400px] bg-gradient-to-r from-blue-600/30 to-purple-600/30 blur-[100px] rounded-full pointer-events-none -z-10" />
      
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-10 md:p-16 text-center shadow-2xl relative overflow-hidden"
        >
          {/* Subtle grid pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20" />

          <h2 className="text-4xl md:text-5xl font-bold mb-6 relative z-10 text-white">
            Ready to ace your next technical interview?
          </h2>
          <p className="text-xl text-blue-100/70 mb-10 max-w-2xl mx-auto relative z-10">
            Join thousands of engineers who used CareerNode AI to identify their weak spots and land offers at top tech companies.
          </p>
          
          <Button 
            size="lg" 
            className="h-14 px-10 bg-white text-black hover:bg-gray-200 text-lg font-semibold rounded-full shadow-[0_0_40px_-10px_rgba(255,255,255,0.5)] transition-all hover:scale-105 active:scale-95 relative z-10"
            onClick={() => navigate("/interview")}
          >
            Start Your First AI Interview Today <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
