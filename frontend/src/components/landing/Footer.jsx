import { BrainCircuit } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-black/40 backdrop-blur-sm pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <BrainCircuit className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">CareerNode AI</span>
            </div>
            <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
              The intelligent platform for software engineers to simulate, analyze, and master technical interviews.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Platform</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="/login" className="hover:text-blue-400 transition-colors">Dashboard</a></li>
              <li><a href="/login" className="hover:text-blue-400 transition-colors">AI Interview</a></li>
              <li><a href="/login" className="hover:text-blue-400 transition-colors">Skill Analytics</a></li>
              <li><a href="/login" className="hover:text-blue-400 transition-colors">Learning Hub</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Connect</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-blue-400 transition-colors">Twitter</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">LinkedIn</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">GitHub</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Contact Support</a></li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} CareerNode AI. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
