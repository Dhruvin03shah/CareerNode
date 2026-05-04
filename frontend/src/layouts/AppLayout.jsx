import { lazy, Suspense } from "react"
import { Outlet } from "react-router-dom"
import Sidebar from "../components/Sidebar"

const Scene3D = lazy(() => import("../components/three/Scene3D"))

export default function AppLayout() {
  return (
    <div className="flex min-h-screen relative overflow-hidden">

      {/* ─── Real Three.js 3D background ─── */}
      <Suspense fallback={null}>
        <Scene3D />
      </Suspense>

      {/* Subtle accent glow on top of 3D canvas */}
      <div className="fixed top-0 left-0 w-[400px] h-[400px] bg-blue-600/8 blur-[100px] rounded-full pointer-events-none z-1" />
      <div className="fixed bottom-0 right-0 w-[400px] h-[400px] bg-purple-600/8 blur-[100px] rounded-full pointer-events-none z-1" />

      <Sidebar />
      <main className="flex-1 ml-64 min-h-screen overflow-y-auto relative z-10">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
