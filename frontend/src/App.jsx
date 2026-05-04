import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import { InterviewProvider } from "./context/InterviewContext"
import { GamificationProvider } from "./context/GamificationContext"
import ProtectedRoute from "./components/ProtectedRoute"
import AppLayout from "./layouts/AppLayout"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import Interview from "./pages/Interview"
import Analytics from "./pages/Analytics"
import Learning from "./pages/Learning"
import Results from "./pages/Results"
import History from "./pages/History"
import Settings from "./pages/Settings"
import Landing from "./pages/Landing"
import Demo from "./components/ui/demo"

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <InterviewProvider>
          <GamificationProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/hero-demo" element={<Demo.DemoOne />} />

              {/* ─── Full-screen Interview (no sidebar/layout) ─── */}
              <Route
                path="/interview"
                element={
                  <ProtectedRoute>
                    <Interview />
                  </ProtectedRoute>
                }
              />

              {/* ─── All other app pages (with sidebar layout) ─── */}
              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/" element={<Landing />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/analytics"  element={<Analytics />} />
                <Route path="/learning"   element={<Learning />} />
                <Route path="/results"    element={<Results />} />
                <Route path="/history"    element={<History />} />
                <Route path="/settings"   element={<Settings />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </GamificationProvider>
        </InterviewProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
