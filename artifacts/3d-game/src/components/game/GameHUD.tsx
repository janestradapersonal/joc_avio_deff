import { GameState } from "@/pages/Game";

type Props = {
  gameState: GameState;
};

export function GameHUD({ gameState }: Props) {
  return (
    <div className="absolute top-0 left-0 right-0 z-10 p-4 flex justify-between items-start pointer-events-none">
      <div className="bg-black/70 border border-cyan-800 rounded-lg px-4 py-2">
        <div className="text-xs text-cyan-400 font-mono uppercase tracking-widest mb-1">Score</div>
        <div className="text-2xl font-bold text-white font-mono">{gameState.score.toString().padStart(6, "0")}</div>
      </div>
      <div className="bg-black/70 border border-cyan-800 rounded-lg px-4 py-2 text-center">
        <div className="text-xs text-cyan-400 font-mono uppercase tracking-widest mb-1">Wave</div>
        <div className="text-2xl font-bold text-white font-mono">{gameState.wave}</div>
      </div>
      <div className="bg-black/70 border border-cyan-800 rounded-lg px-4 py-2">
        <div className="text-xs text-cyan-400 font-mono uppercase tracking-widest mb-1">Lives</div>
        <div className="flex gap-1 mt-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <span
              key={i}
              className={`text-xl ${i < gameState.lives ? "text-red-400" : "text-gray-700"}`}
            >
              ♥
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
