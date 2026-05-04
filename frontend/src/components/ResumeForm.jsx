import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/Card"
import { Input } from "./ui/Input"
import { Button } from "./ui/Button"
import { Briefcase, Building2, FileText, Loader2, CheckCircle2, Trash2 } from "lucide-react"

export default function ResumeForm({ onSubmit, isSubmitting, savedProfile, onClearCache }) {
  const [resumeFile, setResumeFile] = useState(null)
  const [role, setRole] = useState(savedProfile?.role || "")
  const [company, setCompany] = useState(savedProfile?.company || "")

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!role || !company) return

    const formData = new FormData()
    formData.append("role", role)
    formData.append("company", company)

    // If we have a saved profile but no new file, send the cached resume text
    if (savedProfile && !resumeFile) {
      formData.append("resume_text", savedProfile.resume_text)
    } else if (resumeFile) {
      formData.append("resume", resumeFile)
    } else {
      return // nothing to submit
    }

    onSubmit(formData)
  }

  const canSubmit = role && company && (savedProfile || resumeFile)

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-2xl border-primary/20">
      <CardHeader className="text-center pb-8">
        <CardTitle className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
          CareerNode AI
        </CardTitle>
        <CardDescription className="text-lg mt-2">
          Generate a hyper-realistic, dynamic interview tailored exactly to your profile.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Saved Profile Banner */}
          {savedProfile ? (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-300">Resume Saved & Ready!</p>
                    <p className="text-xs text-emerald-500 mt-0.5">
                      {role && company
                        ? "Your resume, role and company are cached. Click Start Interview directly!"
                        : "Resume cached! Please fill in your Target Role and Company below to continue."
                      }
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClearCache}
                  className="text-emerald-600 hover:text-rose-400 transition-colors ml-4 shrink-0"
                  title="Clear saved resume"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : null}

          {/* File Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2 text-primary/80">
              <FileText className="w-4 h-4" />
              {savedProfile ? "Upload a different resume (optional)" : "Upload your Resume (PDF or TXT)"}
            </label>
            <Input
              type="file"
              accept=".pdf,.txt"
              onChange={(e) => setResumeFile(e.target.files[0])}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30 py-2 h-auto"
              required={!savedProfile}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2 text-primary/80">
                <Briefcase className="w-4 h-4" />
                Target Role
              </label>
              <Input
                placeholder="e.g. Senior Data Analyst"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2 text-primary/80">
                <Building2 className="w-4 h-4" />
                Target Company
              </label>
              <Input
                placeholder="e.g. Amazon"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-lg shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
            disabled={isSubmitting || !canSubmit}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Analyzing Profile & Generating Interview...
              </>
            ) : (
              "Start Interview Simulation"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
