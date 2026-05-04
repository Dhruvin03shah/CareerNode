import { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "./AuthContext"

const InterviewContext = createContext(null)

// Returns a per-user storage key so no two accounts share data
function historyKey(email) {
  return `careernode_history_${email ?? "guest"}`
}

export function InterviewProvider({ children }) {
  const { user } = useAuth()

  // Reload history from localStorage whenever the logged-in user changes
  const [history, setHistory] = useState([])

  useEffect(() => {
    if (user?.email) {
      let stored = localStorage.getItem(historyKey(user.email))
      let parsed = stored ? JSON.parse(stored) : []

      // --- SEED MOCK DATA FOR DHRUVIN ---
      if ((parsed.length < 10 || !parsed[0]?.data?.skills) && user.email === "dhruvin03shah@gmail.com") {
        const roles = ["Data Scientist", "Software Engineer", "ML Engineer", "Backend Developer", "Data Analyst"]
        const companies = ["Google", "Amazon", "Meta", "Microsoft", "Netflix"]
        
        const mockQuestions = [
          ["How do you tune a machine learning model?", "Explain the random forest algorithm."], // ML/AI
          ["Write a complex sql query with joins.", "How do you handle etl pipelines in postgresql?"], // SQL/Data
          ["Design a system architecture for a microservice.", "How does a load balancer work for scalability?"], // System Design
          ["Tell me about a time you showed leadership.", "How do you handle conflict in teamwork?"], // Behavioral
          ["Explain the time complexity of a sorting algorithm.", "How do you traverse a graph or tree data structure?"], // DSA
          ["How does a transformer model work in nlp?", "Explain word embedding in deep learning."] // NLP/DL
        ]

        const mockSkillsSets = [
          ["Machine Learning", "Python", "Scikit-Learn"],
          ["SQL", "Data Analysis", "Pandas"],
          ["System Design", "AWS", "Microservices"],
          ["Communication", "Leadership", "Agile"],
          ["Data Structures", "Algorithms", "Java"],
          ["Deep Learning", "NLP", "PyTorch"]
        ]

        parsed = Array.from({ length: 10 }).map((_, i) => {
          const baseScore = 9.2 - (i * 0.5)
          const jitter = (Math.random() - 0.5)
          const finalScore = Math.min(10, Math.max(1, baseScore + jitter)).toFixed(1)

          const d = new Date()
          d.setDate(d.getDate() - i)
          
          const domainIdx = i % 6

          return {
            id: Date.now() - i * 86400000,
            date: d.toISOString(),
            role: roles[i % roles.length],
            company: companies[i % companies.length],
            avgScore: finalScore,
            data: {
              scores: [parseFloat(finalScore), parseFloat(finalScore)],
              questions: mockQuestions[domainIdx],
              answers: ["Mock answer 1", "Mock answer 2"],
              feedback: ["Good start.", "Needs more detail."],
              skills: mockSkillsSets[domainIdx]
            }
          }
        })
        localStorage.setItem(historyKey(user.email), JSON.stringify(parsed))
      }
      // ----------------------------------

      setHistory(parsed)
    } else {
      // No user logged in — start clean
      setHistory([])
    }
  }, [user?.email])

  const [interviewData, setInterviewData] = useState(null)

  const saveToHistory = (data) => {
    if (!user?.email) return
    const entry = {
      id: Date.now(),
      date: new Date().toISOString(),
      role:     data.role     || "Unknown Role",
      company:  data.company  || "Unknown Company",
      avgScore: data.scores?.length
        ? (data.scores.reduce((a, b) => a + b, 0) / data.scores.length).toFixed(1)
        : "N/A",
      data,
    }
    const updated = [entry, ...history].slice(0, 10) // keep last 10
    setHistory(updated)
    localStorage.setItem(historyKey(user.email), JSON.stringify(updated))
  }

  const clearHistory = () => {
    if (!user?.email) return
    setHistory([])
    localStorage.removeItem(historyKey(user.email))
  }

  return (
    <InterviewContext.Provider value={{ interviewData, setInterviewData, history, saveToHistory, clearHistory }}>
      {children}
    </InterviewContext.Provider>
  )
}

export function useInterview() {
  return useContext(InterviewContext)
}
