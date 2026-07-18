import { Search, Sliders, RotateCcw } from "lucide-react";

interface GroupStats {
  count: number;
  mastered: number;
}

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedGroup: string;
  onGroupChange: (group: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  onResetProgress: () => void;
  groups: string[];
  getGroupStats: (group: string) => GroupStats;
}

export default function FilterBar({
  searchTerm,
  onSearchChange,
  selectedGroup,
  onGroupChange,
  selectedStatus,
  onStatusChange,
  onResetProgress,
  groups,
  getGroupStats,
}: FilterBarProps) {
  return (
    <div className="theme-card p-6 rounded-3xl border-2 theme-border-main mb-8 theme-shadow-main">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">

        <div className="relative w-full md:w-96">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-black" />
          <input
            type="text"
            placeholder="Search by case #, name, or keywords..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search cases"
            className="w-full bg-gray-50 text-black rounded-xl pl-11 pr-4 py-2.5 text-sm border-2 theme-border-main focus:outline-none focus:bg-white transition-all placeholder:text-gray-400 font-bold theme-shadow-small"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black text-xs font-mono font-bold active:scale-95"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex gap-3 w-full md:w-auto self-stretch md:self-auto">

          <div className="flex-1 md:flex-none flex items-center theme-muted-bg rounded-xl border-2 theme-border-main px-3 relative theme-shadow-small">
            <Sliders className="w-4 h-4 text-black mr-2 shrink-0" />
            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="bg-transparent text-black text-xs font-bold focus:outline-none pr-6 py-2.5 cursor-pointer w-full"
            >
              <option value="All" className="bg-white text-black">All Statuses</option>
              <option value="Mastered" className="bg-white text-green-600 font-bold">Mastered</option>
              <option value="Learning" className="bg-white text-blue-600 font-bold">Learning</option>
              <option value="Not Started" className="bg-white text-gray-500 font-bold">Not Started</option>
            </select>
          </div>

          <button
            onClick={onResetProgress}
            title="Reset learning progress and timer stats"
            className="px-4 py-2 bg-red-500 hover:bg-red-400 text-white text-xs font-black rounded-xl border-2 theme-border-main transition-all flex items-center gap-1.5 font-mono theme-shadow-small active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Progress
          </button>
        </div>

      </div>

      <div className="mt-6 pt-5 border-t border-gray-200">
        <span className="text-xs font-black text-gray-500 uppercase tracking-widest font-sans block mb-3">Categories:</span>
        <div className="flex flex-wrap gap-2">
          {groups.map(groupName => {
            const stats = groupName !== "All" ? getGroupStats(groupName) : null;
            const isSelected = selectedGroup === groupName;
            return (
              <button
                key={groupName}
                onClick={() => onGroupChange(groupName)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 ${
                  isSelected
                    ? "bg-blue-600 text-white border-2 theme-border-main theme-shadow-small font-black"
                    : "bg-white text-black hover:bg-gray-100 border-2 theme-border-main theme-shadow-small font-bold"
                }`}
              >
                {groupName}
                {stats && stats.count > 0 && (
                  <span className={`text-[10px] rounded-full px-1.5 py-0.2 font-mono ${
                    isSelected ? "bg-white text-black border theme-border-main" : "bg-gray-200 text-gray-700 border border-gray-300"
                  }`}>
                    {stats.mastered}/{stats.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
