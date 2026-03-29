import { useRef, useState, useEffect, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";
import { GameState } from "@/pages/Game";
import { BulletData, EnemyData, createBullet, createEnemy } from "./useGameStore";
import { PlayerShip } from "./PlayerShip";
import { EnemyShip } from "./EnemyShip";
import { Bullet } from "./Bullet";
import { Arena } from "./Arena";
import { Explosion } from "./Explosion";

const PLAYER_SPEED = 9;
const BULLET_SPEED = 30;
const ENEMY_BULLET_SPEED = 5;
const SHOOT_COOLDOWN = 0.18;
const ENEMY_SHOOT_COOLDOWN = 4.0;
const BOUNDS_X = 9;
const BOUNDS_Z = 6;
const INVINCIBILITY_DURATION = 3;
const TOTAL_WAVES = 5;

enum Controls {
  forward = "forward",
  back = "back",
  left = "left",
  right = "right",
  shoot = "shoot",
}

type ExplosionData = {
  id: number;
  position: THREE.Vector3;
  color: string;
};

let explosionIdCounter = 0;

function spawnWave(waveNumber: number): EnemyData[] {
  const enemies: EnemyData[] = [];
  const count = 4 + waveNumber * 2;

  for (let i = 0; i < count; i++) {
    const col = i % 6;
    const row = Math.floor(i / 6);
    const type =
      waveNumber >= 4 && i % 5 === 0
        ? "tank"
        : waveNumber >= 3 && i % 3 === 0
        ? "fast"
        : "basic";
    enemies.push(
      createEnemy(new THREE.Vector3(-7.5 + col * 3, 0, -10 - row * 3), type)
    );
  }
  return enemies;
}

type Props = {
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
};

export function GameScene({ setGameState }: Props) {
  const playerPos = useRef(new THREE.Vector3(0, 0, 4));
  const playerVel = useRef(new THREE.Vector3());
  const [, getKeys] = useKeyboardControls<Controls>();

  const bullets = useRef<BulletData[]>([]);
  const [bulletTick, setBulletTick] = useState(0);

  const enemies = useRef<EnemyData[]>(spawnWave(1));
  const [enemyTick, setEnemyTick] = useState(0);

  const explosions = useRef<ExplosionData[]>([]);
  const [explosionTick, setExplosionTick] = useState(0);

  const shootCooldown = useRef(0);
  const enemyShootTimers = useRef<Record<number, number>>({});

  const invincible = useRef(false);
  const invincibleTimer = useRef(0);
  const playerVisible = useRef(true);
  const blinkTimer = useRef(0);

  // Game state tracked purely as refs for use inside useFrame
  const waveRef = useRef(1);
  const livesRef = useRef(3);
  const scoreRef = useRef(0);
  const enemyMoveDir = useRef(1);
  const gameOver = useRef(false);

  const addExplosion = useCallback((pos: THREE.Vector3, color: string) => {
    explosions.current.push({
      id: explosionIdCounter++,
      position: pos.clone(),
      color,
    });
    setExplosionTick((t) => t + 1);
    setTimeout(() => {
      explosions.current.shift();
      setExplosionTick((t) => t + 1);
    }, 600);
  }, []);

  useEffect(() => {
    // Reset everything on mount
    enemies.current = spawnWave(1);
    enemyShootTimers.current = {};
    waveRef.current = 1;
    livesRef.current = 3;
    scoreRef.current = 0;
    gameOver.current = false;
    enemyMoveDir.current = 1;
    playerPos.current.set(0, 0, 4);
    bullets.current = [];
    explosions.current = [];
    setEnemyTick(0);
    setBulletTick(0);
    setExplosionTick(0);
    // Sync initial state to parent
    setGameState({ score: 0, lives: 3, wave: 1, gameStatus: "playing" });
  }, [setGameState]);

  useFrame((_, delta) => {
    if (gameOver.current) return;

    const keys = getKeys();

    // Player movement
    playerVel.current.set(0, 0, 0);
    if (keys.left) playerVel.current.x -= 1;
    if (keys.right) playerVel.current.x += 1;
    if (keys.forward) playerVel.current.z -= 1;
    if (keys.back) playerVel.current.z += 1;
    if (playerVel.current.lengthSq() > 0) playerVel.current.normalize();
    playerPos.current.addScaledVector(playerVel.current, PLAYER_SPEED * delta);
    playerPos.current.x = THREE.MathUtils.clamp(playerPos.current.x, -BOUNDS_X, BOUNDS_X);
    playerPos.current.z = THREE.MathUtils.clamp(playerPos.current.z, -BOUNDS_Z, 6);

    // Invincibility blink
    if (invincible.current) {
      invincibleTimer.current -= delta;
      blinkTimer.current -= delta;
      if (blinkTimer.current <= 0) {
        playerVisible.current = !playerVisible.current;
        blinkTimer.current = 0.15;
      }
      if (invincibleTimer.current <= 0) {
        invincible.current = false;
        playerVisible.current = true;
      }
    }

    // Player shooting
    shootCooldown.current -= delta;
    if (keys.shoot && shootCooldown.current <= 0) {
      bullets.current.push(
        createBullet(
          playerPos.current.clone().add(new THREE.Vector3(0, 0, -0.5)),
          new THREE.Vector3(0, 0, -1),
          false
        )
      );
      shootCooldown.current = SHOOT_COOLDOWN;
      setBulletTick((t) => t + 1);
    }

    // Move enemy formation
    const moveStep = 0.012 * (1 + waveRef.current * 0.1);
    if (enemies.current.length > 0) {
      enemies.current.forEach((e) => {
        e.position.x += enemyMoveDir.current * moveStep;
      });

      const leftMost = Math.min(...enemies.current.map((e) => e.position.x));
      const rightMost = Math.max(...enemies.current.map((e) => e.position.x));

      if (rightMost >= BOUNDS_X - 0.5 || leftMost <= -BOUNDS_X + 0.5) {
        enemyMoveDir.current *= -1;
        enemies.current.forEach((e) => {
          e.position.z += 0.8;
        });
        setEnemyTick((t) => t + 1);
      }
    }

    // Enemy shooting
    if (enemies.current.length > 0) {
      const frontEnemies = getFrontEnemies(enemies.current);
      frontEnemies.forEach((enemy) => {
        if (!(enemy.id in enemyShootTimers.current)) {
          enemyShootTimers.current[enemy.id] =
            ENEMY_SHOOT_COOLDOWN * (0.5 + Math.random());
        }
        enemyShootTimers.current[enemy.id] -= delta;
        if (enemyShootTimers.current[enemy.id] <= 0) {
          const dir = new THREE.Vector3(
            playerPos.current.x - enemy.position.x,
            0,
            playerPos.current.z - enemy.position.z
          ).normalize();
          bullets.current.push(createBullet(enemy.position.clone(), dir, true));
          enemyShootTimers.current[enemy.id] =
            (ENEMY_SHOOT_COOLDOWN * (0.7 + Math.random() * 0.6)) /
            Math.min(waveRef.current, 3);
          setBulletTick((t) => t + 1);
        }
      });
    }

    // Move bullets — remove out-of-bounds
    bullets.current = bullets.current.filter((b) => {
      b.position.addScaledVector(
        b.direction,
        (b.isEnemy ? ENEMY_BULLET_SPEED : BULLET_SPEED) * delta
      );
      return (
        Math.abs(b.position.z) <= 30 &&
        Math.abs(b.position.x) <= 20 &&
        b.position.z <= 10
      );
    });

    // Collision: player bullets vs enemies
    const toRemoveBullets = new Set<number>();
    const toRemoveEnemies = new Set<number>();
    let pointsEarned = 0;

    bullets.current.forEach((b) => {
      if (b.isEnemy) return;
      enemies.current.forEach((e) => {
        if (toRemoveEnemies.has(e.id)) return;
        const dx = b.position.x - e.position.x;
        const dz = b.position.z - e.position.z;
        if (Math.sqrt(dx * dx + dz * dz) < 1.6) {
          toRemoveBullets.add(b.id);
          e.health -= 1;
          if (e.health <= 0) {
            toRemoveEnemies.add(e.id);
            const pts = e.type === "tank" ? 100 : e.type === "fast" ? 50 : 25;
            pointsEarned += pts;
            addExplosion(
              e.position,
              e.type === "tank" ? "#ff4400" : e.type === "fast" ? "#00ffaa" : "#ffaa00"
            );
          }
        }
      });
    });

    // Collision: enemy bullets vs player
    let hitPlayer = false;
    if (!invincible.current) {
      bullets.current.forEach((b) => {
        if (!b.isEnemy || hitPlayer) return;
        const dx = b.position.x - playerPos.current.x;
        const dz = b.position.z - playerPos.current.z;
        if (Math.sqrt(dx * dx + dz * dz) < 1.0) {
          toRemoveBullets.add(b.id);
          hitPlayer = true;
        }
      });
    }

    // Enemy reaches player zone
    if (!invincible.current) {
      enemies.current.forEach((e) => {
        if (e.position.z >= playerPos.current.z - 0.5) {
          toRemoveEnemies.add(e.id);
          addExplosion(e.position, "#ff0000");
          hitPlayer = true;
        }
      });
    }

    // Apply removals
    if (toRemoveBullets.size > 0) {
      bullets.current = bullets.current.filter((b) => !toRemoveBullets.has(b.id));
      setBulletTick((t) => t + 1);
    }

    if (toRemoveEnemies.size > 0) {
      enemies.current = enemies.current.filter((e) => !toRemoveEnemies.has(e.id));
      toRemoveEnemies.forEach((id) => delete enemyShootTimers.current[id]);
      setEnemyTick((t) => t + 1);
    }

    // Apply score
    if (pointsEarned > 0) {
      scoreRef.current += pointsEarned;
      const newScore = scoreRef.current;
      setGameState((s) => ({ ...s, score: newScore }));
    }

    // Apply player hit
    if (hitPlayer) {
      invincible.current = true;
      invincibleTimer.current = INVINCIBILITY_DURATION;
      blinkTimer.current = 0.15;
      addExplosion(playerPos.current, "#ff0088");
      livesRef.current -= 1;
      const newLives = livesRef.current;
      if (newLives <= 0) {
        gameOver.current = true;
        const finalScore = scoreRef.current;
        setGameState({ score: finalScore, lives: 0, wave: waveRef.current, gameStatus: "gameover" });
        return;
      }
      setGameState((s) => ({ ...s, lives: newLives }));
    }

    // Check: all enemies defeated → next wave
    if (enemies.current.length === 0) {
      const nextWave = waveRef.current + 1;
      scoreRef.current += 200;
      const waveBonus = scoreRef.current;

      if (nextWave > TOTAL_WAVES) {
        gameOver.current = true;
        setGameState({ score: waveBonus, lives: livesRef.current, wave: waveRef.current, gameStatus: "win" });
        return;
      }

      waveRef.current = nextWave;
      enemies.current = spawnWave(nextWave);
      enemyShootTimers.current = {};
      enemyMoveDir.current = 1;
      setEnemyTick((t) => t + 1);
      setGameState((s) => ({ ...s, score: waveBonus, wave: nextWave }));
    }
  });

  return (
    <>
      <Arena />
      <PlayerShip positionRef={playerPos} visible={playerVisible.current} />
      {enemies.current.map((enemy) => (
        <EnemyShip key={enemy.id} enemy={enemy} />
      ))}
      {bullets.current.map((bullet) => (
        <Bullet key={bullet.id} bullet={bullet} />
      ))}
      {explosions.current.map((exp) => (
        <Explosion key={exp.id} position={exp.position} color={exp.color} />
      ))}
    </>
  );
}

function getFrontEnemies(enemies: EnemyData[]): EnemyData[] {
  const columns = new Map<number, EnemyData>();
  enemies.forEach((e) => {
    const col = Math.round(e.position.x);
    const existing = columns.get(col);
    if (!existing || e.position.z > existing.position.z) {
      columns.set(col, e);
    }
  });
  return Array.from(columns.values());
}
