import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type Props = {
  position: THREE.Vector3;
  color: string;
};

export function Explosion({ position, color }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);
  const particles = useRef(
    Array.from({ length: 8 }, (_, i) => ({
      dir: new THREE.Vector3(
        Math.cos((i / 8) * Math.PI * 2),
        (Math.random() - 0.5) * 0.5,
        Math.sin((i / 8) * Math.PI * 2)
      ).multiplyScalar(3 + Math.random() * 2),
      offset: new THREE.Vector3(),
    }))
  );

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    timeRef.current += delta;
    const t = timeRef.current;
    groupRef.current.position.copy(position);

    groupRef.current.children.forEach((child, i) => {
      if (i < particles.current.length) {
        const p = particles.current[i];
        p.offset.addScaledVector(p.dir, delta);
        child.position.copy(p.offset);
        const s = Math.max(0, 1 - t * 2);
        child.scale.setScalar(s);
        (child as THREE.Mesh).material &&
          ((child as THREE.Mesh).material as THREE.MeshStandardMaterial) &&
          (((child as THREE.Mesh).material as THREE.MeshStandardMaterial).opacity = s);
      }
    });

    // Core flash
    const coreMesh = groupRef.current.children[particles.current.length];
    if (coreMesh) {
      const s = Math.max(0, 1 - t * 3) * 2;
      coreMesh.scale.setScalar(s);
    }
  });

  return (
    <group ref={groupRef}>
      {particles.current.map((_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.2, 6, 6]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={2}
            transparent
            opacity={1}
          />
        </mesh>
      ))}
      {/* Core flash */}
      <mesh>
        <sphereGeometry args={[0.5, 8, 8]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={5}
          transparent
          opacity={1}
        />
      </mesh>
      <pointLight color={color} intensity={5} distance={5} />
    </group>
  );
}
