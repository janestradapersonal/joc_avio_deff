import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { BulletData } from "./useGameStore";

type Props = {
  bullet: BulletData;
};

export function Bullet({ bullet }: Props) {
  const meshRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!meshRef.current) return;
    meshRef.current.position.copy(bullet.position);
  });

  const color = bullet.isEnemy ? "#ff2200" : "#00ffff";
  const emissiveColor = bullet.isEnemy ? "#ff0000" : "#00ffff";

  return (
    <group ref={meshRef}>
      <mesh>
        <capsuleGeometry args={[0.07, 0.4, 4, 8]} />
        <meshStandardMaterial
          color={color}
          emissive={emissiveColor}
          emissiveIntensity={3}
          toneMapped={false}
        />
      </mesh>
      <pointLight color={emissiveColor} intensity={1.5} distance={2} />
    </group>
  );
}
