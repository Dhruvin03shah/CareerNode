import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import { useInterview } from "../context/InterviewContext"
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import { Settings, LogOut, Trash2, User, Mail, Shield, Moon } from "lucide-react"
import { useState } from "react"

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const { history, clearHistory } = useInterview()
  const navigate = useNavigate()
  const [darkMode] = useState(true) // always dark for now

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear all interview history? This cannot be undone.")) {
      clearHistory?.()
    }
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Settings className="w-7 h-7 text-muted-foreground" />
          Settings
        </h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences.</p>
      </div>

      {/* Profile */}
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <User className="w-4 h-4 text-blue-400" /> Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-blue-500/20">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-lg">{user?.name}</p>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> {user?.email}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-muted/30 border border-border/30 text-center">
              <p className="text-2xl font-bold text-blue-400">{history.length}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Total Interviews</p>
            </div>
            <div className="p-3 rounded-xl bg-muted/30 border border-border/30 text-center">
              <p className="text-2xl font-bold text-emerald-400">
                {history.length
                  ? (history.reduce((s, h) => s + parseFloat(h.avgScore || 0), 0) / history.length).toFixed(1)
                  : "—"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Avg Score</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Moon className="w-4 h-4 text-indigo-400" /> Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium">Dark Mode</p>
              <p className="text-xs text-muted-foreground">Currently enabled — keep the dark theme active</p>
            </div>
            <div className="w-10 h-6 bg-primary/80 rounded-full flex items-center px-1 cursor-default">
              <div className="w-4 h-4 bg-white rounded-full ml-auto shadow-sm" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-rose-500/20 bg-rose-500/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2 text-rose-400">
            <Shield className="w-4 h-4" /> Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Clear Interview History</p>
              <p className="text-xs text-muted-foreground">Permanently delete all past sessions and analytics data.</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearHistory}
              className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10 shrink-0 ml-4"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Clear
            </Button>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-rose-500/10">
            <div>
              <p className="text-sm font-medium">Logout</p>
              <p className="text-xs text-muted-foreground">Sign out of your CareerNode session.</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10 shrink-0 ml-4"
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5" /> Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
