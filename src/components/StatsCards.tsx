import { Award, BookMarked, Circle } from "lucide-react";

interface StatsCardsProps {
  masteredCount: number;
  learningCount: number;
  notStartedCount: number;
  totalCases: number;
}

export default function StatsCards({ masteredCount, learningCount, notStartedCount, totalCases }: StatsCardsProps) {
  const masteredPct = totalCases > 0 ? Math.round((masteredCount / totalCases) * 100) : 0;
  const learningPct = totalCases > 0 ? Math.round((learningCount / totalCases) * 100) : 0;
  const notStartedPct = totalCases > 0 ? Math.round((notStartedCount / totalCases) * 100) : 0;

  return (
    <section id="ll-statistics" className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="theme-card p-5 rounded-3xl border-2 theme-border-main flex items-center gap-4 relative overflow-hidden theme-shadow-small">
        <div className="p-2.5 theme-pill-accent-soft text-green-600 rounded-xl border-2 theme-border-main theme-shadow-tiny shrink-0">
          <Award className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <span className="text-xs theme-muted-text font-bold tracking-wider block uppercase">MASTERED CASES</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-display font-black">{masteredCount}</span>
            <span className="text-sm theme-muted-text font-mono font-bold">/ {totalCases}</span>
          </div>
          <div className="w-full theme-muted-bg h-3 rounded-full mt-3 overflow-hidden border theme-border-main">
            <div className="bg-green-500 h-full rounded-full transition-all duration-500" style={{ width: `${masteredPct}%` }}></div>
          </div>
        </div>
        <div className="text-right text-xs font-black font-mono text-green-600 self-start">{masteredPct}%</div>
      </div>

      <div className="theme-card p-5 rounded-3xl border-2 theme-border-main flex items-center gap-4 relative overflow-hidden theme-shadow-small">
        <div className="p-2.5 theme-pill-accent-soft text-blue-600 rounded-xl border-2 theme-border-main theme-shadow-tiny shrink-0">
          <BookMarked className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <span className="text-xs theme-muted-text font-bold tracking-wider block uppercase">LEARNING CASES</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-display font-black">{learningCount}</span>
            <span className="text-sm theme-muted-text font-mono font-bold">/ {totalCases}</span>
          </div>
          <div className="w-full theme-muted-bg h-3 rounded-full mt-3 overflow-hidden border theme-border-main">
            <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: `${learningPct}%` }}></div>
          </div>
        </div>
        <div className="text-right text-xs font-black font-mono text-blue-600 self-start">{learningPct}%</div>
      </div>

      <div className="theme-card p-5 rounded-3xl border-2 theme-border-main flex items-center gap-4 relative overflow-hidden theme-shadow-small">
        <div className="p-2.5 theme-pill-accent-soft text-red-600 rounded-xl border-2 theme-border-main theme-shadow-tiny shrink-0">
          <Circle className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <span className="text-xs theme-muted-text font-bold tracking-wider block uppercase">NOT STARTED</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-display font-black">{notStartedCount}</span>
            <span className="text-sm theme-muted-text font-mono font-bold">/ {totalCases}</span>
          </div>
          <div className="w-full theme-muted-bg h-3 rounded-full mt-3 overflow-hidden border theme-border-main">
            <div className="bg-red-500 h-full rounded-full transition-all duration-500" style={{ width: `${notStartedPct}%` }}></div>
          </div>
        </div>
        <div className="text-right text-xs font-black font-mono text-red-600 self-start">{notStartedPct}%</div>
      </div>

    </section>
  );
}
