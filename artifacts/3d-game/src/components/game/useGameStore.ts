import { useRef } from "react";
import * as THREE from "three";

export type BulletData = {
  id: number;
  position: THREE.Vector3;
  direction: THREE.Vector3;
  isEnemy: boolean;
};

export type EnemyData = {
  id: number;
  position: THREE.Vector3;
  health: number;
  type: "basic" | "fast" | "tank";
  velocity: THREE.Vector3;
};

let bulletIdCounter = 0;
let enemyIdCounter = 0;

export function createBullet(
  position: THREE.Vector3,
  direction: THREE.Vector3,
  isEnemy: boolean
): BulletData {
  return {
    id: bulletIdCounter++,
    position: position.clone(),
    direction: direction.clone().normalize(),
    isEnemy,
  };
}

export function createEnemy(
  position: THREE.Vector3,
  type: "basic" | "fast" | "tank"
): EnemyData {
  return {
    id: enemyIdCounter++,
    position: position.clone(),
    health: type === "tank" ? 3 : type === "fast" ? 1 : 2,
    type,
    velocity: new THREE.Vector3(0, 0, 0),
  };
}
