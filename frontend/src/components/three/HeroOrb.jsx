import { motion } from "framer-motion"

export default function HeroOrb() {
  return (
    <div className="relative w-full h-full flex items-center justify-center" style={{ perspective: "800px" }}>
      
      {/* 3D Container - This is crucial for rings to pass behind the sphere */}
      <div className="relative w-full h-full flex items-center justify-center" style={{ transformStyle: "preserve-3d" }}>
        
        {/* Outer Glow - pushed back slightly so it doesn't bleed over the front rings */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-32 h-32 rounded-full bg-indigo-500 blur-2xl"
          style={{ transform: "translateZ(-1px)" }}
        />
        
        {/* Core Sphere - Removed z-10 so true 3D Z-sorting takes over */}
        <div 
          className="absolute w-24 h-24 rounded-full bg-gradient-to-br from-indigo-400 via-indigo-700 to-[#1e1b4b] shadow-[inset_-10px_-10px_20px_rgba(0,0,0,0.6),_0_0_25px_rgba(99,102,241,0.6)]" 
          style={{ transform: "translateZ(0px)" }}
        />

        {/* Ring 1 - Saturn style */}
        <div
          className="absolute w-40 h-40 rounded-full border-[1.5px] border-indigo-400/40 shadow-[0_0_10px_rgba(99,102,241,0.3)]"
          style={{ animation: "orb-spin1 5s linear infinite", transformStyle: "preserve-3d" }}
        >
          <div className="absolute top-0 left-1/2 w-1.5 h-1.5 -ml-[3px] -mt-[3px] bg-indigo-200 rounded-full shadow-[0_0_8px_#c7d2fe]" />
        </div>
        
        {/* Ring 2 - Angled */}
        <div
          className="absolute w-48 h-48 rounded-full border-[1.5px] border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.2)]"
          style={{ animation: "orb-spin2 7s linear infinite", transformStyle: "preserve-3d" }}
        >
          <div className="absolute bottom-0 left-1/2 w-2 h-2 -ml-[4px] -mb-[4px] bg-indigo-300 rounded-full shadow-[0_0_10px_#a5b4fc]" />
        </div>

        {/* Ring 3 - Outer thin ring */}
        <div
          className="absolute w-56 h-56 rounded-full border border-indigo-300/20"
          style={{ animation: "orb-spin3 10s linear infinite", transformStyle: "preserve-3d" }}
        >
          <div className="absolute top-1/2 left-0 w-1 h-1 -ml-[2px] -mt-[2px] bg-indigo-100 rounded-full shadow-[0_0_6px_#e0e7ff]" />
        </div>

      </div>

      {/* Inject CSS Keyframes directly */}
      <style>{`
        @keyframes orb-spin1 {
          0% { transform: rotateX(70deg) rotateY(15deg) rotateZ(0deg); }
          100% { transform: rotateX(70deg) rotateY(15deg) rotateZ(360deg); }
        }
        @keyframes orb-spin2 {
          0% { transform: rotateX(60deg) rotateY(45deg) rotateZ(0deg); }
          100% { transform: rotateX(60deg) rotateY(45deg) rotateZ(-360deg); }
        }
        @keyframes orb-spin3 {
          0% { transform: rotateX(75deg) rotateY(-35deg) rotateZ(0deg); }
          100% { transform: rotateX(75deg) rotateY(-35deg) rotateZ(360deg); }
        }
      `}</style>
    </div>
  )
}
