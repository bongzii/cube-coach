import { formatTime } from "../lib/solveStats";
import type { Stats } from "../lib/solveStats";

interface Props {
  stats: Stats;
}

const cards = [
  { label: "Best", key: "best" as const },
  { label: "Ao5", key: "ao5" as const },
  { label: "Ao12", key: "ao12" as const },
  { label: "Ao100", key: "ao100" as const },
  { label: "Mean", key: "mean" as const },
];

export default function TimerStats({ stats }: Props) {
  return (
    <div className="grid grid-cols-5 gap-3 mb-6">
      {cards.map(({ label, key }) => (
        <div key={key} className="theme-card rounded-2xl border-2 theme-border-main px-3 py-3 text-center theme-shadow-small">
          <span className="text-[10px] font-black uppercase tracking-widest theme-muted-text block">{label}</span>
          <span className="text-lg font-display font-black mt-0.5 block">{formatTime(stats[key])}</span>
        </div>
      ))}
    </div>
  );
}
