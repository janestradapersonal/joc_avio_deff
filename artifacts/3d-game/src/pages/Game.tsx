import { Canvas } from "@react-three/fiber";
import { KeyboardControls, Stars } from "@react-three/drei";
import { Suspense, useState } from "react";
import { GameScene } from "@/components/game/GameScene";
import { GameHUD } from "@/components/game/GameHUD";

enum Controls {
  forward = "forward",
  back = "back",
  left = "left",
  right = "right",
  shoot = "shoot",
}

const keyMap = [
  { name: Controls.forward, keys: ["ArrowUp", "KeyW"] },
  { name: Controls.back, keys: ["ArrowDown", "KeyS"] },
  { name: Controls.left, keys: ["ArrowLeft", "KeyA"] },
  { name: Controls.right, keys: ["ArrowRight", "KeyD"] },
  { name: Controls.shoot, keys: ["Space"] },
];

export type GameState = {
  score: number;
  lives: number;
  wave: number;
  gameStatus: "menu" | "playing" | "gameover" | "win";
};

export default function Game() {
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    lives: 3,
    wave: 1,
    gameStatus: "menu",
  });

  const startGame = () => {
    setGameState({ score: 0, lives: 3, wave: 1, gameStatus: "playing" });
  };

  const restartGame = () => {
    setGameState({ score: 0, lives: 3, wave: 1, gameStatus: "playing" });
  };

  const canvasActive = gameState.gameStatus !== "menu";

  return (
    <div className="w-full h-screen bg-black relative overflow-hidden">
      {/* Menu */}
      {gameState.gameStatus === "menu" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20"
          style={{ background: "radial-gradient(ellipse at center, #0a1628 0%, #000005 100%)" }}>
          {/* Stars background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 80 }).map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white"
                style={{
                  width: Math.random() * 2 + 1 + "px",
                  height: Math.random() * 2 + 1 + "px",
                  top: Math.random() * 100 + "%",
                  left: Math.random() * 100 + "%",
                  opacity: Math.random() * 0.7 + 0.3,
                }}
              />
            ))}
          </div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="text-cyan-500 text-sm font-mono tracking-widest mb-3 opacity-80">
              ✦ INTERGALACTIC DEFENSE FORCE ✦
            </div>
            <h1 className="text-6xl font-bold text-transparent bg-clip-text mb-2 tracking-widest"
              style={{ backgroundImage: "linear-gradient(135deg, #00ffff 0%, #0088ff 50%, #00ffaa 100%)" }}>
              STAR DEFENDER
            </h1>
            <div className="h-0.5 w-64 mb-6"
              style={{ background: "linear-gradient(to right, transparent, #00ccff, transparent)" }} />
            <p className="text-gray-300 mb-8 text-lg">
              Defend the galaxy from 5 waves of alien invaders!
            </p>
            <div className="text-gray-500 text-sm mb-10 text-center space-y-1.5 bg-black/40 border border-cyan-900 rounded-lg px-8 py-4">
              <p><span className="text-cyan-400">W A S D</span> or <span className="text-cyan-400">Arrow Keys</span> — Move</p>
              <p><span className="text-cyan-400">Space</span> — Fire Lasers</p>
              <p className="text-xs text-gray-600 mt-2">Destroy all enemies to advance waves · +50 bonus per wave</p>
            </div>
            <button
              onClick={startGame}
              className="px-12 py-4 text-black font-bold text-xl rounded-lg transition-all hover:scale-105 active:scale-95"
              style={{ background: "linear-gradient(135deg, #00ffff, #0088ff)" }}
            >
              🚀 LAUNCH MISSION
            </button>
            <div className="mt-6 text-xs text-gray-600">
              Enemies: <span className="text-red-400">■ Basic (25pts)</span> · <span className="text-green-400">■ Fast (50pts)</span> · <span className="text-purple-400">■ Tank (100pts)</span> · <span className="text-cyan-400">Wave bonus +200pts</span>
            </div>
          </div>
        </div>
      )}

      {/* Game Over */}
      {gameState.gameStatus === "gameover" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/75">
          <h1 className="text-6xl font-bold text-red-500 mb-4 tracking-wide">GAME OVER</h1>
          <p className="text-gray-300 text-2xl mb-1">
            Score: <span className="text-yellow-400 font-bold">{gameState.score.toString().padStart(6, "0")}</span>
          </p>
          <p className="text-gray-500 mb-8 text-lg">Wave reached: {gameState.wave}</p>
          <button
            onClick={restartGame}
            className="px-10 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xl rounded-lg transition-colors"
          >
            TRY AGAIN
          </button>
        </div>
      )}

      {/* Victory */}
      {gameState.gameStatus === "win" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/75">
          <h1 className="text-6xl font-bold text-green-400 mb-4 tracking-wide">VICTORY!</h1>
          <p className="text-gray-300 text-2xl mb-1">
            Final Score: <span className="text-yellow-400 font-bold">{gameState.score.toString().padStart(6, "0")}</span>
          </p>
          <p className="text-gray-400 mb-8">All 5 waves defeated!</p>
          <button
            onClick={restartGame}
            className="px-10 py-3 bg-green-500 hover:bg-green-400 text-black font-bold text-xl rounded-lg transition-colors"
          >
            PLAY AGAIN
          </button>
        </div>
      )}

      {/* HUD */}
      {canvasActive && <GameHUD gameState={gameState} />}

      {/* 3D Canvas — only mounted after starting */}
      {canvasActive && (
        <KeyboardControls map={keyMap}>
          <Canvas
            camera={{ position: [0, 8, 16], fov: 60 }}
            gl={{ antialias: true }}
          >
            <Suspense fallback={null}>
              <Stars radius={100} depth={50} count={3000} factor={4} fade speed={1} />
              <ambientLight intensity={0.3} />
              <directionalLight position={[5, 10, 5]} intensity={1} color="#88ccff" />
              <pointLight position={[0, 5, 0]} intensity={0.5} color="#ffffff" />
              {gameState.gameStatus === "playing" && (
                <GameScene setGameState={setGameState} />
              )}
            </Suspense>
          </Canvas>
        </KeyboardControls>
      )}
    </div>
  );
}
