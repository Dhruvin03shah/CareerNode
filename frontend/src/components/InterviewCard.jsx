import { useState, useEffect, useRef } from "react"
import axios from "axios"
import { Card, CardHeader, CardTitle, CardContent } from "./ui/Card"
import { Input } from "./ui/Input"
import { Button } from "./ui/Button"
import { Bot, User, Send, Loader2 } from "lucide-react"
import { motion } from "framer-motion"

export default function InterviewCard({ data, onStateUpdate, onComplete }) {
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const scrollRef = useRef(null)

  // Sync messages with the global state whenever data changes
  useEffect(() => {
    if (!data || !data.questions) return

    const newMessages = []
    for (let i = 0; i < data.questions.length; i++) {
      newMessages.push({ role: "ai", content: data.questions[i] })
      if (data.answers && data.answers[i]) {
        newMessages.push({ role: "user", content: data.answers[i] })
      }
    }
    setMessages(newMessages)

    // Check if interview is complete (learning_path exists)
    if (data.learning_path && data.learning_path.length > 0) {
      setTimeout(() => onComplete(), 1500)
    }
  }, [data, onComplete])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async (e) => {
    e?.preventDefault()
    if (!inputValue.trim() || isSubmitting) return

    const userText = inputValue.trim()
    setInputValue("")
    setIsSubmitting(true)

    // Optimistically add user message to UI
    setMessages(prev => [...prev, { role: "user", content: userText }])

    try {
      const response = await axios.post("http://127.0.0.1:8000/answer", {
        state: data,
        answer: userText
      })
      onStateUpdate(response.data)
    } catch (err) {
      console.error(err)
      // Optionally handle error visually
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto h-[600px] flex flex-col shadow-2xl border-primary/20">
      <CardHeader className="border-b border-border/50 bg-card/50 rounded-t-2xl pb-4">
        <CardTitle className="text-xl flex items-center gap-2">
          <Bot className="text-blue-400" /> AI Interviewer
        </CardTitle>
      </CardHeader>
      
      <CardContent ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-lg ${msg.role === "user" ? "bg-indigo-500/20 text-indigo-300" : "bg-blue-500/20 text-blue-300"}`}>
              {msg.role === "user" ? <User size={20} /> : <Bot size={20} />}
            </div>
            <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${msg.role === "user" ? "bg-indigo-500/10 text-indigo-50 rounded-tr-sm" : "bg-card border border-border text-card-foreground rounded-tl-sm"}`}>
              <p className="text-sm leading-relaxed">{msg.content}</p>
            </div>
          </motion.div>
        ))}
        {isSubmitting && (
          <div className="flex gap-4 opacity-50">
             <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-card border border-border">
              <Bot size={20} />
             </div>
             <div className="flex items-center gap-1 p-4">
               <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" />
               <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "0.2s" }} />
               <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "0.4s" }} />
             </div>
          </div>
        )}
      </CardContent>

      <div className="p-4 bg-card/50 border-t border-border/50 rounded-b-2xl">
        <form onSubmit={handleSend} className="flex gap-2">
          <Input 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your answer here..."
            className="flex-1"
            disabled={isSubmitting}
          />
          <Button type="submit" disabled={!inputValue.trim() || isSubmitting} size="icon">
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </form>
      </div>
    </Card>
  )
}
