import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function Arena() {
  const gridRef = useRef<THREE.GridHelper>(null);

  useFrame((_, delta) => {
    if (gridRef.current) {
      gridRef.current.position.z += delta * 2;
      if (gridRef.current.position.z > 2) {
        gridRef.current.position.z = 0;
      }
    }
  });

  return (
    <>
      {/* Scrolling grid floor */}
      <gridHelper
        ref={gridRef}
        args={[40, 40, "#003344", "#001122"]}
        position={[0, -0.5, 0]}
        rotation={[0, 0, 0]}
      />
      {/* Side walls glow */}
      <mesh position={[-9.5, 0, 0]} rotation={[0, 0, 0]}>
        <planeGeometry args={[0.02, 20]} />
        <meshStandardMaterial color="#00aaff" emissive="#00aaff" emissiveIntensity={2} transparent opacity={0.4} />
      </mesh>
      <mesh position={[9.5, 0, 0]}>
        <planeGeometry args={[0.02, 20]} />
        <meshStandardMaterial color="#00aaff" emissive="#00aaff" emissiveIntensity={2} transparent opacity={0.4} />
      </mesh>
    </>
  );
}
