import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

const NODE_COUNT = 30
const SPREAD = 12
const MAX_CONNECTIONS = 22
const MAX_DISTANCE = 4.5

// Reuse same node positions as FloatingNodes by seeding with same RNG pattern
function buildNodes(seed) {
  const rng = (() => {
    let s = seed
    return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646 }
  })()
  return Array.from({ length: NODE_COUNT }, () => new THREE.Vector3(
    (rng() - 0.5) * SPREAD,
    (rng() - 0.5) * SPREAD * 0.8,
    (rng() - 0.5) * SPREAD * 0.5
  ))
}

export default function NeuralLines() {
  const linesRef = useRef([])

  const { connections, basePositions } = useMemo(() => {
    // Fixed base positions (matched by FloatingNodes phase bobs above these)
    const pts = Array.from({ length: NODE_COUNT }, (_, i) => new THREE.Vector3(
      (Math.sin(i * 2.3) * 0.5) * SPREAD,
      (Math.cos(i * 1.7) * 0.5) * SPREAD * 0.8,
      (Math.sin(i * 3.1) * 0.5) * SPREAD * 0.5
    ))

    // Find nearest pairs
    const pairs = []
    for (let a = 0; a < NODE_COUNT; a++) {
      for (let b = a + 1; b < NODE_COUNT; b++) {
        const dist = pts[a].distanceTo(pts[b])
        if (dist < MAX_DISTANCE) {
          pairs.push({ a, b, dist, phase: Math.random() * Math.PI * 2 })
        }
      }
    }
    // Sort by distance, take closest
    pairs.sort((x, y) => x.dist - y.dist)
    return { connections: pairs.slice(0, MAX_CONNECTIONS), basePositions: pts }
  }, [])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    linesRef.current.forEach((line, i) => {
      if (!line) return
      const conn = connections[i]
      if (!conn) return
      // Pulse opacity between 0.04 and 0.25
      const pulse = 0.04 + (Math.sin(t * 1.2 + conn.phase) * 0.5 + 0.5) * 0.21
      if (line.material) line.material.opacity = pulse
    })
  })

  return (
    <group>
      {connections.map((conn, i) => {
        const start = basePositions[conn.a]
        const end   = basePositions[conn.b]
        const mid   = new THREE.Vector3().lerpVectors(start, end, 0.5)
        const dir   = new THREE.Vector3().subVectors(end, start)
        const len   = dir.length()
        const quat  = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          dir.clone().normalize()
        )

        return (
          <mesh
            key={i}
            ref={el => (linesRef.current[i] = el)}
            position={mid}
            quaternion={quat}
          >
            <cylinderGeometry args={[0.004, 0.004, len, 4]} />
            <meshBasicMaterial
              color="#6366f1"
              transparent
              opacity={0.12}
            />
          </mesh>
        )
      })}
    </group>
  )
}
