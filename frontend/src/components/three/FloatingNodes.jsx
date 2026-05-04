import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

const NODE_COUNT = 30
const SPREAD = 12

export default function FloatingNodes({ mouseRef }) {
  const meshRef = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])

  // Pre-compute random positions and animation seeds per node
  const nodes = useMemo(() => {
    return Array.from({ length: NODE_COUNT }, (_, i) => ({
      position: new THREE.Vector3(
        (Math.random() - 0.5) * SPREAD,
        (Math.random() - 0.5) * SPREAD * 0.8,
        (Math.random() - 0.5) * SPREAD * 0.5
      ),
      phase:   Math.random() * Math.PI * 2,
      speed:   0.2 + Math.random() * 0.3,
      rotSpeed: (Math.random() - 0.5) * 0.5,
      scale:   0.06 + Math.random() * 0.1,
    }))
  }, [])

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.elapsedTime

    nodes.forEach((node, i) => {
      // Bob up/down with sine wave
      dummy.position.set(
        node.position.x,
        node.position.y + Math.sin(t * node.speed + node.phase) * 0.3,
        node.position.z
      )
      // Slow rotation
      dummy.rotation.x = t * node.rotSpeed * 0.5
      dummy.rotation.y = t * node.rotSpeed
      dummy.scale.setScalar(node.scale)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[null, null, NODE_COUNT]}>
      <icosahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        color="#4f46e5"
        emissive="#3730a3"
        emissiveIntensity={0.6}
        roughness={0.4}
        metalness={0.8}
        transparent
        opacity={0.55}
        wireframe={false}
      />
    </instancedMesh>
  )
}
