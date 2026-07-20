import { Trash2 } from "lucide-react";
import { formatTime, effectiveTime, type Solve } from "../lib/solveStats";

interface Props {
  solves: Solve[];
  onDelete: (id: string) => void;
}

export default function TimeList({ solves, onDelete }: Props) {
  if (solves.length === 0) {
    return (
      <p className="text-center theme-muted-text text-sm font-bold uppercase tracking-wide py-8">
        No solves yet — hold Space to start
      </p>
    );
  }

  // newest first
  const sorted = [...solves].reverse();

  return (
    <div className="max-h-72 overflow-y-auto rounded-2xl border-2 theme-border-main divide-y theme-border-main">
      {sorted.map((s, i) => (
        <div key={s.id} className="flex items-center justify-between px-4 py-2.5 theme-card text-sm">
          <span className="font-mono font-bold text-xs theme-muted-text w-8">{solves.length - i}</span>
          <span className={`font-mono font-black flex-1 text-right ${
            s.penalty === "dnf" ? "text-red-500" : s.penalty === "plustwo" ? "text-amber-500" : ""
          }`}>
            {formatTime(effectiveTime(s))}
            {s.penalty === "plustwo" && <span className="text-xs ml-1">(+2)</span>}
          </span>
          <span className="text-[10px] theme-muted-text font-mono ml-3 truncate max-w-[120px]" title={s.scramble}>
            {s.scramble}
          </span>
          <button
            onClick={() => onDelete(s.id)}
            className="ml-3 theme-muted-text hover:text-red-500 transition-colors shrink-0"
            aria-label="Delete solve"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
