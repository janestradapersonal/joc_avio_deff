import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { EnemyData } from "./useGameStore";

type Props = {
  enemy: EnemyData;
};

const COLORS = {
  basic: "#ff4422",
  fast: "#00ff88",
  tank: "#cc00ff",
};

export function EnemyShip({ enemy }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const time = useRef(Math.random() * Math.PI * 2);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.position.copy(enemy.position);
    time.current += delta * (enemy.type === "fast" ? 3 : 1.5);
    groupRef.current.rotation.y = Math.sin(time.current) * 0.3;
    groupRef.current.position.y = Math.sin(time.current * 0.8) * 0.15;
  });

  const color = COLORS[enemy.type];
  const scale = enemy.type === "tank" ? 1.5 : enemy.type === "fast" ? 0.7 : 1;

  return (
    <group ref={groupRef} scale={scale}>
      {/* Body */}
      <mesh castShadow>
        <boxGeometry args={[1, 0.25, 1.2]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.4} emissive={color} emissiveIntensity={0.2} />
      </mesh>
      {/* Wings */}
      <mesh position={[-0.9, 0, 0]} castShadow>
        <boxGeometry args={[0.7, 0.1, 0.8]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[0.9, 0, 0]} castShadow>
        <boxGeometry args={[0.7, 0.1, 0.8]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.5} />
      </mesh>
      {/* Core glow */}
      <mesh position={[0, 0.2, 0]}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={3} />
      </mesh>
      <pointLight position={[0, 0.5, 0]} color={color} intensity={1} distance={3} />
    </group>
  );
}
