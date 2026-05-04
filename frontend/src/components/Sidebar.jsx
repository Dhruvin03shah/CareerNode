import { NavLink, Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import {
  LayoutDashboard, Mic, BarChart3, BookOpen,
  Clock, Settings, LogOut, BrainCircuit, Home
} from "lucide-react"

const NAV_GROUPS = [
  {
    label: "Main",
    items: [
      { to: "/",           icon: Home,            label: "Home"      },
      { to: "/dashboard",  icon: LayoutDashboard, label: "Dashboard" },
      { to: "/interview",  icon: Mic,             label: "Interview"  },
      { to: "/analytics",  icon: BarChart3,        label: "Analytics"  },
    ],
  },
  {
    label: "Growth",
    items: [
      { to: "/learning", icon: BookOpen, label: "Learning Hub" },
      { to: "/history",  icon: Clock,    label: "History"      },
    ],
  },
  {
    label: "System",
    items: [
      { to: "/settings", icon: Settings, label: "Settings" },
    ],
  },
]

const navLinkClass = ({ isActive }) =>
  `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 group ${
    isActive
      ? "bg-white/10 text-white shadow-lg shadow-black/20 border border-white/5 backdrop-blur-md translate-x-1"
      : "text-muted-foreground hover:bg-white/5 hover:text-foreground hover:translate-x-0.5"
  }`

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 flex flex-col bg-gradient-to-b from-[#020617] to-[#0f172a] shadow-inner border-r border-white/5 z-50">

      {/* Logo */}
      <Link to="/" className="flex items-center gap-2.5 px-6 py-5 border-b border-border/50 hover:bg-white/5 transition-colors cursor-pointer">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
          <BrainCircuit className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
          CareerNode
        </span>
      </Link>

      {/* Nav groups */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {NAV_GROUPS.map(group => (
          <div key={group.label}>
            <p className="px-4 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map(({ to, icon: Icon, label }) => (
                <NavLink key={to} to={to} className={navLinkClass}>
                  {({ isActive }) => (
                    <>
                      <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
                      {label}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="px-3 pb-4 border-t border-border/50 pt-4 space-y-2">
        {user && (
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-md shadow-blue-500/20">
              {user.name?.[0]?.toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-rose-500/10 hover:text-rose-400 transition-all"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Logout
        </button>
      </div>
    </aside>
  )
}
