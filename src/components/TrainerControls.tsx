import { Sliders, Play } from "lucide-react";

interface GroupStats {
  count: number;
  mastered: number;
}

interface TrainerControlsProps {
  groups: string[];
  trainerGroups: string[];
  getGroupStats: (group: string) => GroupStats;
  onToggleGroup: (group: string) => void;
  onSelectAll: () => void;
  onClear: () => void;
  onStart: () => void;
}

export default function TrainerControls({
  groups,
  trainerGroups,
  getGroupStats,
  onToggleGroup,
  onSelectAll,
  onClear,
  onStart,
}: TrainerControlsProps) {
  return (
    <div className="lg:col-span-4 flex flex-col gap-6">
      <div className="theme-card p-6 rounded-3xl border-2 theme-border-main theme-shadow-main">
        <h3 className="font-display font-black text-lg uppercase tracking-tight mb-4 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-blue-600" />
          Isolate Study Focus
        </h3>

        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={onSelectAll}
            className="text-[10px] font-mono font-black uppercase theme-btn-ghost border-2 theme-border-main px-2.5 py-1 rounded-md theme-shadow-tiny active:scale-95"
          >
            Select All
          </button>
          <button
            onClick={onClear}
            className="text-[10px] font-mono font-black uppercase theme-btn-ghost border-2 theme-border-main px-2.5 py-1 rounded-md theme-shadow-tiny active:scale-95"
          >
            Clear (default)
          </button>
        </div>

        <div className="space-y-2 max-h-72 overflow-y-auto scrollbar-thin pr-1">
          {groups.filter(g => g !== "All").map(gName => {
            const isSelected = trainerGroups.includes(gName);
            const stats = getGroupStats(gName);
            return (
              <button
                key={gName}
                onClick={() => onToggleGroup(gName)}
                className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs font-black font-mono transition-all text-left border-2 active:scale-95 ${
                  isSelected
                    ? "theme-pill-accent theme-border-main theme-shadow-small"
                    : "theme-muted-bg theme-text-main border-transparent hover:theme-border-main"
                }`}
              >
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    readOnly
                    className="w-4 h-4"
                  />
                  {gName}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 theme-control-surface rounded border theme-border-main theme-shadow-tiny">
                  {stats.mastered}/{stats.count}
                </span>
              </button>
            );
          })}
        </div>

          <button
            onClick={onStart}
            className="w-full mt-5 theme-btn-primary font-black uppercase text-sm py-3 rounded-xl border-2 theme-border-main transition-all theme-shadow-small hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] flex items-center justify-center gap-2 italic active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" />
            Next Scramble
          </button>
      </div>
    </div>
  );
}
