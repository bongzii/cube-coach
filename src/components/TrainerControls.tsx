import { Sliders, Clock, Play } from "lucide-react";

interface GroupStats {
  count: number;
  mastered: number;
}

interface TrainerControlsProps {
  groups: string[];
  trainerGroups: string[];
  trainerLog: { id: number; name: string; time?: number; status: string }[];
  getGroupStats: (group: string) => GroupStats;
  onToggleGroup: (group: string) => void;
  onSelectAll: () => void;
  onClear: () => void;
  onStart: () => void;
}

export default function TrainerControls({
  groups,
  trainerGroups,
  trainerLog,
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
          <Sliders className="w-4.5 h-4.5 text-blue-600" />
          Isolate Study Focus
        </h3>

        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={onSelectAll}
            className="text-[10px] font-mono font-black uppercase bg-gray-100 border-2 theme-border-main hover:bg-gray-200 text-black px-2.5 py-1 rounded-md theme-shadow-tiny active:scale-95"
          >
            Select All
          </button>
          <button
            onClick={onClear}
            className="text-[10px] font-mono font-black uppercase bg-gray-100 border-2 theme-border-main hover:bg-gray-200 text-black px-2.5 py-1 rounded-md theme-shadow-tiny active:scale-95"
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
                    ? "bg-yellow-100 text-black theme-border-main theme-shadow-small"
                    : "theme-muted-bg theme-text-main border-transparent hover:theme-border-main"
                }`}
              >
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    readOnly
                    className="accent-black w-4 h-4"
                  />
                  {gName}
                </span>
                <span className="text-[10px] font-bold text-black px-1.5 py-0.5 bg-white rounded border theme-border-main theme-shadow-tiny">
                  {stats.mastered}/{stats.count}
                </span>
              </button>
            );
          })}
        </div>

        <button
          onClick={onStart}
          className="w-full mt-5 bg-yellow-400 hover:bg-yellow-300 text-black font-black uppercase text-sm py-3 rounded-xl border-2 theme-border-main transition-all theme-shadow-small hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] flex items-center justify-center gap-2 italic active:scale-95"
        >
          <Play className="w-4.5 h-4.5 fill-current" />
          Next Scramble
        </button>
      </div>

      <div className="theme-card p-6 rounded-3xl border-2 theme-border-main theme-shadow-main flex-1">
        <h3 className="font-display font-black text-lg uppercase tracking-tight mb-4 flex items-center gap-2">
          <Clock className="w-4.5 h-4.5 text-blue-600" />
          Session Solve Log
        </h3>

        {trainerLog.length > 0 ? (
          <div className="space-y-2 max-h-72 overflow-y-auto scrollbar-thin">
            {trainerLog.map((log, index) => (
              <div key={index} className="flex items-center justify-between p-2.5 theme-muted-bg rounded-lg text-xs font-mono border-2 theme-border-main font-bold mb-2 theme-shadow-small">
                <div className="flex items-center gap-2">
                  <span className="font-black bg-yellow-400 px-1 rounded">#{log.id}</span>
                  <span className="font-bold">{log.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {log.time && <span className="text-blue-600 font-bold">{log.time}s</span>}
                  <span className={`text-[9px] px-1.5 py-0.5 rounded border theme-border-main font-black uppercase theme-shadow-tiny ${
                    log.status === "Mastered" ? "bg-green-500 text-white" : "bg-blue-600 text-white"
                  }`}>
                    {log.status === "Mastered" ? "Mastered" : "Learning"} {log.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 border-2 border-dashed theme-border-main rounded-xl theme-muted-bg">
            <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-white border-2 theme-border-main flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-xs font-bold uppercase text-gray-400">No solves yet</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Start the timer to log your first solve.</p>
          </div>
        )}
      </div>
    </div>
  );
}
