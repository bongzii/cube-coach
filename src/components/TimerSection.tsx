import { useState, useEffect } from "react";
import { RefreshCw, Settings, X } from "lucide-react";
import { generateScramble } from "../lib/scramble";
import { computeStats, formatTime, type Solve, type Penalty } from "../lib/solveStats";
import { useTimer, type TimerSettings, DEFAULT_SETTINGS } from "../lib/timer";
import TimerStats from "./TimerStats";
import TimeList from "./TimeList";

const STORAGE_KEY = "cube-coach-timer";

function loadSession(): Solve[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}
function loadSettings(): TimerSettings {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}-settings`);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch { return DEFAULT_SETTINGS; }
}

export default function TimerSection() {
  const [settings, setSettings] = useState<TimerSettings>(loadSettings);
  const [solves, setSolves] = useState<Solve[]>(loadSession);
  const [scramble, setScramble] = useState(() => generateScramble());
  const [pending, setPending] = useState<{ time: number; scramble: string } | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const timer = useTimer(settings);

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(solves)); }, [solves]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}-settings`, JSON.stringify(settings)); }, [settings]);

  useEffect(() => {
    // capture stop: when state transitions from running → idle with elapsed
    if (timer.state === "idle" && timer.elapsed > 0 && !pending) {
      setPending({ time: timer.elapsed, scramble });
      setScramble(generateScramble());
    }
  }, [timer.state, timer.elapsed, pending, scramble]);

  // also handle inspection DNF (state goes idle after 17s with 0 elapsed)
  useEffect(() => {
    if (timer.state === "idle" && timer.inspectionTime >= 17) {
      setPending({ time: 0, scramble });
      setScramble(generateScramble());
    }
  }, [timer.state, timer.inspectionTime, scramble]);

  const confirmSolve = (penalty: Penalty) => {
    if (!pending) return;
    if (penalty === "dnf") {
      setSolves((s) => [...s, { id: crypto.randomUUID(), time: 0, penalty: "dnf", scramble: pending.scramble, ts: Date.now() }]);
    } else {
      setSolves((s) => [...s, { id: crypto.randomUUID(), time: pending.time, penalty, scramble: pending.scramble, ts: Date.now() }]);
    }
    setPending(null);
  };

  const deleteSolve = (id: string) => setSolves((s) => s.filter((x) => x.id !== id));
  const clearSession = () => { if (confirm("Clear all solves?")) { setSolves([]); setPending(null); } };

  const stats = computeStats(solves);

  const inspectionLabel = timer.state === "inspecting"
    ? `INSPECT ${Math.min(Math.ceil(timer.inspectionTime), 17)}`
    : timer.state === "ready"
    ? "GO!"
    : timer.state === "running"
    ? "STOP"
    : "HOLD";

  const inspectColor = timer.state === "inspecting"
    ? timer.inspectionTime >= 17 ? "text-red-500"
      : timer.inspectionTime >= 15 ? "text-amber-500"
      : timer.inspectionTime >= 12 ? "text-amber-400"
      : "theme-card-text"
    : timer.state === "ready" ? "text-green-600"
    : "theme-card-text";

  return (
    <div className="max-w-3xl mx-auto">
      {/* Scramble */}
      <div className="theme-card rounded-2xl border-2 theme-border-main p-4 mb-4 flex items-center gap-3 theme-shadow-small">
        <span className="text-sm font-black font-mono theme-card-text leading-relaxed flex-1 select-none">{scramble}</span>
        <button
          onClick={() => setScramble(generateScramble())}
          className="theme-control-surface p-2 rounded-lg transition-all theme-shadow-tiny active:scale-95 shrink-0"
          title="New scramble"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Timer display */}
      <div
        onPointerDown={timer.state === "idle" || timer.state === "inspecting" ? timer.handleDown : undefined}
        onPointerUp={timer.state !== "idle" ? timer.handleUp : undefined}
        className={`select-none rounded-3xl border-2 theme-border-main p-12 mb-6 flex flex-col items-center justify-center transition-colors cursor-pointer theme-shadow-main ${
          timer.state === "ready"
            ? "bg-green-500/10 border-green-500"
            : timer.state === "running"
            ? "bg-red-500/5 border-red-400"
            : "theme-card"
        }`}
      >
        {timer.state === "running" ? (
          <span className="text-7xl md:text-8xl font-display font-black tabular-nums">{formatTime(timer.elapsed)}</span>
        ) : timer.state === "inspecting" ? (
          <>
            <span className={`text-7xl md:text-8xl font-display font-black tabular-nums ${inspectColor}`}>
              {Math.min(Math.ceil(timer.inspectionTime), 17)}
            </span>
            <span className="text-sm font-black uppercase tracking-widest theme-muted-text mt-2">Hold space...</span>
          </>
        ) : (
          <>
            <span className={`text-7xl md:text-8xl font-display font-black tabular-nums ${inspectColor}`}>
              {formatTime(0)}
            </span>
            <span className="text-sm font-black uppercase tracking-widest theme-muted-text mt-2">Hold space to start</span>
          </>
        )}
      </div>

      {/* Penalty row */}
      {pending && (
        <div className="flex items-center justify-center gap-3 mb-6 animate-fade-in-up">
          <span className="text-sm font-black theme-muted-text uppercase">Penalty:</span>
          <button onClick={() => confirmSolve("none")} className="px-4 py-2 rounded-xl font-black text-xs uppercase theme-btn-primary theme-shadow-small active:scale-95 transition-all">OK</button>
          <button onClick={() => confirmSolve("plustwo")} className="px-4 py-2 rounded-xl font-black text-xs uppercase theme-control-surface border-2 theme-border-main theme-shadow-small active:scale-95 transition-all">+2</button>
          <button onClick={() => confirmSolve("dnf")} className="px-4 py-2 rounded-xl font-black text-xs uppercase theme-control-surface border-2 theme-border-main theme-shadow-small active:scale-95 transition-all text-red-500">DNF</button>
        </div>
      )}

      {/* Stats */}
      <TimerStats stats={stats} />

      {/* Session header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-black uppercase text-sm tracking-wide theme-card-text">
          Session <span className="theme-muted-text">({stats.count})</span>
        </h3>
        <div className="flex gap-2">
          {solves.length > 0 && (
            <button onClick={clearSession} className="text-[10px] font-black uppercase theme-muted-text hover:text-red-500 transition-colors">Clear</button>
          )}
          <button onClick={() => setShowSettings(!showSettings)} className="theme-control-surface p-1.5 rounded-lg theme-shadow-tiny active:scale-95 transition-all">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Settings popover */}
      {showSettings && (
        <div className="theme-card rounded-2xl border-2 theme-border-main p-4 mb-4 theme-shadow-small animate-fade-in-up">
          <div className="flex items-center justify-between mb-3">
            <span className="font-black uppercase text-xs tracking-wide">Timer Settings</span>
            <button onClick={() => setShowSettings(false)} className="theme-muted-text hover:theme-card-text"><X className="w-4 h-4" /></button>
          </div>
          <label className="flex items-center justify-between py-2 border-b theme-border-main">
            <span className="text-sm font-bold">Inspection</span>
            <button
              onClick={() => setSettings((s) => ({ ...s, inspection: !s.inspection }))}
              className={`w-10 h-6 rounded-full transition-colors relative ${settings.inspection ? "bg-green-500" : "bg-gray-400"}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${settings.inspection ? "left-4.5" : "left-0.5"}`} />
            </button>
          </label>
          <label className="flex items-center justify-between py-2">
            <span className="text-sm font-bold">Hold (ms)</span>
            <select
              value={settings.holdTime}
              onChange={(e) => setSettings((s) => ({ ...s, holdTime: Number(e.target.value) }))}
              className="theme-control-surface rounded-lg px-2 py-1 text-sm font-mono font-bold border theme-border-main"
            >
              {[0, 150, 200, 300, 500].map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </label>
        </div>
      )}

      {/* Solve list */}
      <TimeList solves={solves} onDelete={deleteSolve} />
    </div>
  );
}
