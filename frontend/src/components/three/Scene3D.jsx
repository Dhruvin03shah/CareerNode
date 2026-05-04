import { Suspense, useRef, useEffect } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"
import FloatingNodes from "./FloatingNodes"
import NeuralLines   from "./NeuralLines"

// Inner scene group — handles mouse parallax rotation
function SceneGroup({ mouseRef }) {
  const groupRef = useRef()

  useFrame(() => {
    if (!groupRef.current || !mouseRef.current) return
    const { x, y } = mouseRef.current
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      x * 0.08,
      0.04
    )
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      -y * 0.05,
      0.04
    )
  })

  return (
    <group ref={groupRef}>
      <FloatingNodes />
      <NeuralLines />
    </group>
  )
}

// Animated starfield using Points
function StarField() {
  const ref = useRef()
  const count = 120

  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 24
    positions[i * 3 + 1] = (Math.random() - 0.5) * 20
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2
  }

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.elapsedTime * 0.008
    }
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial size={0.035} color="#a5b4fc" transparent opacity={0.55} sizeAttenuation />
    </points>
  )
}

export default function Scene3D() {
  const mouseRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const handler = (e) => {
      mouseRef.current = {
        x: (e.clientX / window.innerWidth  - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      }
    }
    window.addEventListener("mousemove", handler, { passive: true })
    return () => window.removeEventListener("mousemove", handler)
  }, [])

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 8], fov: 55 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: "low-power",
        }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]}   color="#3b82f6" intensity={1.2} />
        <pointLight position={[-5, -5, 2]}  color="#8b5cf6" intensity={0.8} />

        <Suspense fallback={null}>
          <StarField />
          <SceneGroup mouseRef={mouseRef} />
        </Suspense>
      </Canvas>
    </div>
  )
}
