import { RefreshCw, Copy, Check, CheckCircle, Circle, Info, HelpCircle } from "lucide-react";
import CaseImage from "./CaseImage";
import type { CaseItem } from "../App";
import type { Penalty, TimerPhase, TimerSettings } from "../types";

interface TrainerTimerProps {
  activeCase: CaseItem | null;
  caseType: "oll" | "pll" | "f2l";
  trainerReveal: boolean;
  copiedScramble: string | null;
  timerPhase: TimerPhase;
  timerTime: number;
  inspectionLeft: number;
  pendingPenalty: Penalty;
  timerSettings: TimerSettings;
  formatTime: (ms: number) => string;
  getScramble: (id: number) => string;
  onNewScramble: (id: number) => void;
  onCopyScramble: (scramble: string) => void;
  onPressStart: () => void;
  onReleaseStart: () => void;
  onResetTimer: () => void;
  onReveal: () => void;
  onMastered: () => void;
  onNeedsPractice: () => void;
  onEnlarge: (id: number) => void;
  onTogglePenalty: (p: Penalty) => void;
}

export default function TrainerTimer({
  activeCase,
  caseType,
  trainerReveal,
  copiedScramble,
  timerPhase,
  timerTime,
  inspectionLeft,
  pendingPenalty,
  timerSettings,
  formatTime,
  getScramble,
  onNewScramble,
  onCopyScramble,
  onPressStart,
  onReleaseStart,
  onResetTimer,
  onReveal,
  onMastered,
  onNeedsPractice,
  onEnlarge,
  onTogglePenalty,
}: TrainerTimerProps) {
  const isRunning = timerPhase === "running";
  const isReady = timerPhase === "ready" || timerPhase === "holding";
  const showInspection = timerPhase === "inspection";

  const timerColor = isRunning
    ? "text-blue-600 theme-pill-accent-soft"
    : isReady
    ? "text-green-600 theme-pill-accent-soft"
    : showInspection
    ? "text-orange-600 theme-pill-accent-soft"
    : "theme-text-main theme-muted-bg";

  return (
    <div className="lg:col-span-8 theme-card p-8 rounded-3xl border-2 theme-border-main flex flex-col justify-between gap-6 min-h-[500px] relative theme-shadow-main">
      {activeCase ? (
        <>
          <div className="flex items-center justify-between border-b-2 theme-border-main pb-4">
            <div>
              <span className="text-xs font-black font-sans uppercase tracking-widest text-red-600">ACTIVE STUDY FOCUS</span>
              <h3 className="text-2xl font-display font-black uppercase tracking-tight mt-0.5">
                {trainerReveal ? activeCase.name : "Study & Retrieve"}
              </h3>
            </div>
            <div>
              <span className="text-xs font-black font-mono px-3 py-1.5 theme-pill-accent border-2 theme-border-main rounded-lg theme-shadow-small">
                {trainerReveal ? activeCase.group : "???"}
              </span>
            </div>
          </div>

          <div className="text-center theme-accent-bg p-6 rounded-3xl border-2 theme-border-main relative overflow-hidden theme-shadow-small">
            <span className="text-xs font-black theme-muted-text tracking-wider block mb-3 uppercase">APPLY THIS SETUP SCRAMBLE FROM SOLVED:</span>
            <span className="text-xl md:text-3xl font-mono font-black theme-card-text block tracking-wide select-all whitespace-normal leading-normal theme-control-surface p-4 rounded-xl border-2 theme-border-main theme-shadow-small">
              {getScramble(activeCase.id)}
            </span>
            <div className="mt-4 flex gap-2 justify-center">
              <button
                onClick={() => onNewScramble(activeCase.id)}
                className="px-4 py-2 theme-control-surface font-black uppercase border-2 theme-border-main text-xs font-mono rounded-xl transition-all inline-flex items-center gap-1.5 theme-shadow-small hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                New Scramble
              </button>
              <button
                onClick={() => onCopyScramble(getScramble(activeCase.id))}
                className="px-4 py-2 theme-control-surface font-black uppercase border-2 theme-border-main text-xs font-mono rounded-xl transition-all inline-flex items-center gap-1.5 theme-shadow-small hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] active:scale-95"
              >
                {copiedScramble === getScramble(activeCase.id) ? (
                  <><Check className="w-3.5 h-3.5 text-green-600" />Scramble Copied!</>
                ) : (
                  <><Copy className="w-3.5 h-3.5" />Copy Scramble</>
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div
              id="speed-timer"
              role="timer"
              aria-live="polite"
              onPointerDown={(e) => {
                e.preventDefault();
                e.currentTarget.setPointerCapture?.(e.pointerId);
                onPressStart();
              }}
              onPointerUp={(e) => { e.preventDefault(); onReleaseStart(); }}
              onPointerCancel={() => onReleaseStart()}
              onPointerLeave={(e) => { if (timerPhase === "holding") onReleaseStart(); }}
              className={`text-5xl md:text-8xl font-mono font-black tracking-tighter select-none mb-4 px-6 py-4 rounded-2xl border-2 theme-border-main theme-shadow-small cursor-pointer touch-none transition-colors ${timerColor}`}
            >
              {showInspection
                ? `${inspectionLeft}s`
                : formatTime(timerTime)}
            </div>

            <p className="text-xs font-black uppercase tracking-wider theme-muted-text max-w-xs mb-5 font-sans">
              {showInspection
                ? "Inspect! Hold to prepare, release to start solving."
                : isReady
                ? "Release to start solving!"
                : isRunning
                ? "Solve, then press Space / click to stop."
                : "Hold Spacebar or click & hold the timer to get ready, then release to start."}
            </p>

            {/* Penalty toggles + reset */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-black uppercase theme-muted-text">Penalty:</span>
              {(["none", "+2", "DNF"] as Penalty[]).map(p => (
                <button
                  key={p}
                  onClick={() => onTogglePenalty(p)}
                  className={`px-2.5 py-1 rounded-lg border-2 font-black text-[10px] uppercase transition-all active:scale-95 ${
                    pendingPenalty === p
                      ? p === "DNF" ? "bg-red-600 text-white border-2 theme-border-main"
                        : p === "+2" ? "bg-yellow-500 text-black border-2 theme-border-main"
                        : "bg-blue-600 text-white border-2 theme-border-main"
                      : "theme-btn-ghost border-2 theme-border-main"
                  }`}
                >
                  {p === "none" ? "" : p}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={onResetTimer}
                className="px-4 py-3 theme-control-surface border-2 theme-border-main font-black text-xs font-mono rounded-xl transition-all theme-shadow-small hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] active:scale-95"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="border-t-2 theme-border-main pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 theme-accent-bg p-5 rounded-2xl border theme-border-main theme-shadow-small">
              <div className="flex-1">
                <h4 className="font-display font-black text-base uppercase tracking-tight">Verify Scramble / Pattern</h4>
                <p className="theme-muted-text text-xs mt-1 leading-relaxed font-semibold">
                  Once scrambled, the top face of your physical cube should perfectly match the layout pattern shown here.
                </p>

                {!trainerReveal ? (
                  <button
                    onClick={onReveal}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white hover:bg-blue-500 font-black text-xs rounded-xl border-2 theme-border-main transition-all inline-flex items-center gap-1.5 theme-shadow-small hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] active:scale-95"
                  >
                    <Info className="w-3.5 h-3.5" />
                    Reveal Target Pattern
                  </button>
                ) : (
                  <div className="mt-4 flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={onMastered}
                      className="px-4 py-2 bg-green-500 text-white hover:bg-green-400 font-black text-xs rounded-xl border-2 theme-border-main transition-all flex items-center gap-1.5 theme-shadow-small hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] active:scale-95"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Mastered! Next
                    </button>
                    <button
                      onClick={onNeedsPractice}
                      className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-500 font-black text-xs rounded-xl border-2 theme-border-main transition-all flex items-center gap-1.5 theme-shadow-small hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] active:scale-95"
                    >
                      <Circle className="w-3.5 h-3.5" />
                      Needs Practice
                    </button>
                  </div>
                )}
              </div>

              <div className="shrink-0 w-32 h-32 theme-control-surface rounded-2xl border-2 theme-border-main flex items-center justify-center relative overflow-hidden theme-shadow-small">
                {trainerReveal ? (
                  <button
                    onClick={() => onEnlarge(activeCase.id)}
                    className="cursor-pointer animate-fade-in"
                    title="Click to enlarge"
                  >
                    <CaseImage
                      id={activeCase.id}
                      name={activeCase.name}
                      type={caseType}
                      className="w-24 h-24 object-contain select-none pointer-events-none"
                    />
                  </button>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center">
                    <HelpCircle className="w-8 h-8 theme-card-text animate-bounce mb-1" />
                    <span className="text-[10px] font-mono theme-muted-text font-black uppercase">Hidden</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
          <div className="text-center py-20 border-2 border-dashed theme-border-main rounded-3xl theme-muted-bg">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl theme-control-surface border-2 theme-border-main flex items-center justify-center theme-shadow-small">
              <svg className="w-8 h-8 theme-card-text" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                <rect x="9" y="3" width="6" height="4" rx="1" />
                <path d="M12 12v4M12 16h.01" strokeLinecap="round" />
              </svg>
            </div>
            <h4 className="font-black uppercase tracking-tight">No case loaded</h4>
            <p className="theme-muted-text text-sm mt-1">Choose categories and click Next Scramble.</p>
        </div>
      )}
    </div>
  );
}
