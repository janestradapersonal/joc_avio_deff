import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type Props = {
  positionRef: React.MutableRefObject<THREE.Vector3>;
  visible: boolean;
};

export function PlayerShip({ positionRef, visible }: Props) {
  const meshRef = useRef<THREE.Group>(null);
  const engineGlow = useRef<THREE.PointLight>(null);
  const glowTime = useRef(0);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    meshRef.current.position.copy(positionRef.current);
    meshRef.current.visible = visible;

    glowTime.current += delta * 3;
    if (engineGlow.current) {
      engineGlow.current.intensity = 1.5 + Math.sin(glowTime.current) * 0.5;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Main body */}
      <mesh castShadow>
        <boxGeometry args={[1.2, 0.3, 2]} />
        <meshStandardMaterial color="#00ccff" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Left wing */}
      <mesh position={[-1.2, 0, 0.2]} castShadow>
        <boxGeometry args={[1, 0.15, 1.2]} />
        <meshStandardMaterial color="#0088cc" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Right wing */}
      <mesh position={[1.2, 0, 0.2]} castShadow>
        <boxGeometry args={[1, 0.15, 1.2]} />
        <meshStandardMaterial color="#0088cc" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Cockpit */}
      <mesh position={[0, 0.25, -0.3]} castShadow>
        <boxGeometry args={[0.5, 0.2, 0.6]} />
        <meshStandardMaterial color="#88eeff" metalness={0.9} roughness={0.1} emissive="#00aaff" emissiveIntensity={0.3} />
      </mesh>
      {/* Engine glow */}
      <pointLight ref={engineGlow} position={[0, 0, 1.2]} color="#00aaff" intensity={1.5} distance={3} />
      {/* Engine particles */}
      <mesh position={[-0.5, 0, 1]} >
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={2} />
      </mesh>
      <mesh position={[0.5, 0, 1]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={2} />
      </mesh>
    </group>
  );
}
