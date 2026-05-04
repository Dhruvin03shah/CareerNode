import { motion } from "framer-motion"
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts"

const radarData = [
  { subject: 'System Design', A: 85, fullMark: 100 },
  { subject: 'Algorithms', A: 65, fullMark: 100 },
  { subject: 'React/UI', A: 90, fullMark: 100 },
  { subject: 'Databases', A: 70, fullMark: 100 },
  { subject: 'Communication', A: 95, fullMark: 100 },
  { subject: 'DevOps', A: 40, fullMark: 100 },
];

const progressData = [
  { name: 'S1', score: 4.5 },
  { name: 'S2', score: 5.2 },
  { name: 'S3', score: 6.8 },
  { name: 'S4', score: 7.5 },
  { name: 'S5', score: 8.2 },
  { name: 'S6', score: 8.9 },
];

export default function AnalyticsPreview() {
  return (
    <section className="py-24 bg-black/20 border-y border-white/5">
      <div className="container mx-auto px-4">
        
        <div className="flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-20">
          
          <div className="lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Visualise your growth</h2>
              <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                CareerNode doesn't just score you—it builds a comprehensive skill profile. Identify your blind spots before the real interview and track your progress session over session.
              </p>
              
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6">
                <h4 className="text-sm font-semibold text-emerald-400 mb-2">Generated Learning Path</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Deep dive into caching strategies (Redis/Memcached)</li>
                  <li>• Review Big-O time complexity for graph algorithms</li>
                  <li>• Practice system design scale-out scenarios</li>
                </ul>
              </div>
            </motion.div>
          </div>

          <div className="lg:w-1/2 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Radar Chart Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 p-4 h-[300px] flex flex-col"
            >
              <h3 className="text-sm font-medium text-foreground/80 mb-2">Skill Gap Radar</h3>
              <div className="flex-grow w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="#333" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 10 }} />
                    <Radar name="Candidate" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Progress Chart Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 p-4 h-[300px] flex flex-col"
            >
              <h3 className="text-sm font-medium text-foreground/80 mb-2">Average Score Trend</h3>
              <div className="flex-grow w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={progressData}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.5}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" tick={{ fill: '#666', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333', fontSize: '12px' }} />
                    <Area type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  )
}
