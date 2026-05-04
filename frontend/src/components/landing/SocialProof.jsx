import { motion } from "framer-motion"

export default function SocialProof() {
  return (
    <section className="py-12 border-y border-white/5 bg-black/20 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <p className="text-center text-sm font-medium text-muted-foreground mb-8">
          Built for candidates targeting top tech companies
        </p>
        
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
          {/* Using text/SVGs as placeholders for logos */}
          <div className="text-xl font-bold font-sans tracking-tighter">amazon</div>
          <div className="text-xl font-bold font-sans tracking-tight">Google</div>
          <div className="text-xl font-bold font-serif tracking-tight">Meta</div>
          <div className="flex items-center gap-1">
             <div className="w-4 h-4 bg-white" />
             <div className="w-4 h-4 bg-white" />
             <span className="text-xl font-semibold ml-1">Microsoft</span>
          </div>
          <div className="text-xl font-bold italic tracking-tighter">Netflix</div>
        </div>
      </div>
    </section>
  )
}
