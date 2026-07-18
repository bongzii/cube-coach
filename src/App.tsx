import { useState, useEffect, useRef, useMemo } from "react";
import {
  Copy,
  Check,
  BookOpen,
  Timer,
  HelpCircle,
  Layers,
  RefreshCw
} from "lucide-react";
import { ollCases, OLLCase } from "./data/ollCases";
import { pllCases, PLLCase } from "./data/pllCases";
import { ollSetups, pllSetups } from "./data/originalSetups";
import { ollAlgs } from "./data/ollAlgs";
import { pllAlgs } from "./data/pllAlgs";

import { themes, applyTheme } from "./themes";
import CaseImage from "./components/CaseImage";
import StatsCards from "./components/StatsCards";
import ImageModal from "./components/ImageModal";
import NotationLegend from "./components/NotationLegend";
import Toast from "./components/Toast";
import AlgorithmSelector from "./components/AlgorithmSelector";
import FilterBar from "./components/FilterBar";
import TrainerControls from "./components/TrainerControls";
import TrainerTimer from "./components/TrainerTimer";

export type CaseItem = OLLCase | PLLCase;

export default function App() {
  // Case type toggle
  const [caseType, setCaseType] = useState<"oll" | "pll">(() => {
    return (localStorage.getItem("ll-case-type") as "oll" | "pll") || "oll";
  });

  useEffect(() => {
    localStorage.setItem("ll-case-type", caseType);
  }, [caseType]);

  const cases: CaseItem[] = useMemo(() => caseType === "oll" ? ollCases : pllCases, [caseType]);
  const labelPrefix = useMemo(() => caseType === "oll" ? "OLL" : "PLL", [caseType]);
  // Dynamic groups based on case type
  const groups = useMemo(() => {
    if (caseType === "oll") {
      return [
        "All", "Dot", "Square Shape", "Small Lightning Bolt", "Fish Shape",
        "Knight Move Shape", "Corners Oriented", "Cross", "Awkward Shape",
        "P Shape", "T Shape", "C Shape", "W Shape", "Big Lightning Bolt",
        "Small L Shape", "I Shape"
      ];
    }
    return ["All", "U", "H", "Z", "A", "E", "F", "G", "J", "N", "R", "T", "V", "Y"];
  }, [caseType]);

  const GROUP_COLORS: Record<string, string> = {
    "Dot": "#6b7280",
    "Square Shape": "#f59e0b",
    "Small Lightning Bolt": "#a855f7",
    "Fish Shape": "#10b981",
    "Knight Move Shape": "#f97316",
    "Corners Oriented": "#06b6d4",
    "Cross": "#3b82f6",
    "Awkward Shape": "#ec4899",
    "P Shape": "#8b5cf6",
    "T Shape": "#14b8a6",
    "C Shape": "#f43f5e",
    "W Shape": "#6366f1",
    "Big Lightning Bolt": "#eab308",
    "Small L Shape": "#84cc16",
    "I Shape": "#0ea5e9",
  };

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"grid" | "trainer">("grid");

  // User study progress (saved in localStorage, keyed by caseType)
  const storageKey = (key: string) => `${key}-${caseType}`;

  const [masteryData, setMasteryData] = useState<Record<number, "Mastered" | "Learning" | "Not Started">>(() => {
    try {
      const saved = localStorage.getItem(storageKey("ll-mastery"));
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    const initial: Record<number, "Mastered" | "Learning" | "Not Started"> = {};
    cases.forEach(c => {
      initial[c.id] = "Not Started";
    });
    return initial;
  });

  const [solveHistory, setSolveHistory] = useState<Record<number, { date: string; time: number }[]>>(() => {
    try {
      const saved = localStorage.getItem(storageKey("ll-solve-history"));
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return {};
  });

  // Custom scrambles (overrides saved to localStorage)
  const [customScrambles, setCustomScrambles] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem("ll-custom-scrambles");
      if (saved) return JSON.parse(saved);
    } catch (e) { console.error(e); }
    return {};
  });

  // Toast / notification state
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [copiedScramble, setCopiedScramble] = useState<string | null>(null);

  // Scramble cycling index (for both OLL and PLL)
  const [cycleIdx, setCycleIdx] = useState<Record<number, number>>({});
  const [toast, setToast] = useState<{ message: string; id: number } | null>(null);

  const showToast = (message: string, id: number) => {
    setToast({ message, id });
    setTimeout(() => setToast(null), 2000);
  };

  // Image enlargement modal state
  const [enlargedImageId, setEnlargedImageId] = useState<number | null>(null);

  // Active theme state
  const [activeTheme, setActiveTheme] = useState<string>(() => {
    return localStorage.getItem("ll-theme") || "default";
  });

  useEffect(() => {
    localStorage.setItem("ll-theme", activeTheme);
    applyTheme(activeTheme);
  }, [activeTheme]);

  // Active algorithm variant per case
  const [activeAlgVariant, setActiveAlgVariant] = useState<Record<number, "primary" | "alt1" | "alt2" | "alt3" | "alt4" | "alt5">>({});

  // Rotations state
  const [showNotationLegend, setShowNotationLegend] = useState(false);

  // Trainer state
  const [trainerGroups, setTrainerGroups] = useState<string[]>(() => [groups[1]]);
  const [activeTrainerCase, setActiveTrainerCase] = useState<CaseItem | null>(null);
  const [trainerReveal, setTrainerReveal] = useState(false);
  const [trainerLog, setTrainerLog] = useState<{ id: number; name: string; time?: number; status: string }[]>([]);

  // Timer states
  const [timerTime, setTimerTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerReadyState, setTimerReadyState] = useState<"idle" | "ready" | "running">("idle");
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerStartRef = useRef<number>(0);

  // Close enlarged image on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setEnlargedImageId(null);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  // Save progress
  useEffect(() => {
    localStorage.setItem(storageKey("ll-mastery"), JSON.stringify(masteryData));
  }, [masteryData, caseType]);

  useEffect(() => {
    localStorage.setItem(storageKey("ll-solve-history"), JSON.stringify(solveHistory));
  }, [solveHistory, caseType]);

  // Save custom scrambles
  useEffect(() => {
    localStorage.setItem("ll-custom-scrambles", JSON.stringify(customScrambles));
  }, [customScrambles]);

  // Default scrambles lookup for current case type
  const defaultScrambles = useMemo(() => {
    const map: Record<number, string> = {};
    cases.forEach(c => { map[c.id] = c.setup; });
    return map;
  }, [cases]);

  const getScramble = (id: number) => customScrambles[`${caseType}-${id}`] ?? defaultScrambles[id] ?? "";

  const handleCopy = (scramble: string, id: number) => {
    navigator.clipboard.writeText(scramble);
    setCopiedId(id);
    showToast("Copied!", id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleCopyTrainer = (scramble: string) => {
    navigator.clipboard.writeText(scramble);
    setCopiedScramble(scramble);
    setTimeout(() => setCopiedScramble(null), 1500);
  };

  const updateStatus = (id: number, status: "Mastered" | "Learning" | "Not Started") => {
    setMasteryData(prev => ({
      ...prev,
      [id]: status
    }));
  };

  function generateScramble(id: number): string {
    const setups = caseType === "pll" ? pllSetups[id] : ollSetups[id];
    if (!setups || setups.length === 0) return "";
    const idx = (cycleIdx[id] ?? 0) % setups.length;
    setCycleIdx(prev => ({ ...prev, [id]: idx + 1 }));
    return setups[idx];
  }

  const handleGenerate = (id: number) => {
    const key = `${caseType}-${id}`;
    const scramble = generateScramble(id);
    if (scramble) {
      setCustomScrambles(prev => ({ ...prev, [key]: scramble }));
      navigator.clipboard.writeText(scramble);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    }
  };

  // Filtered cases
  const filteredCases = cases.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          `${labelPrefix.toLowerCase()} ${c.id}`.includes(searchTerm.toLowerCase()) ||
                          c.id.toString() === searchTerm.trim();
    const matchesGroup = selectedGroup === "All" || c.group === selectedGroup;
    const matchesStatus = selectedStatus === "All" || masteryData[c.id] === selectedStatus;
    return matchesSearch && matchesGroup && matchesStatus;
  });

  // Calculate statistics
  const totalCases = cases.length;
  const masteredCount = Object.values(masteryData).filter(v => v === "Mastered").length;
  const learningCount = Object.values(masteryData).filter(v => v === "Learning").length;
  const notStartedCount = Object.values(masteryData).filter(v => v === "Not Started").length;

  // Group-wise progress
  const getGroupStats = (groupName: string) => {
    const casesInGroup = cases.filter(c => c.group === groupName);
    const count = casesInGroup.length;
    const mastered = casesInGroup.filter(c => masteryData[c.id] === "Mastered").length;
    return { count, mastered, percentage: count > 0 ? Math.round((mastered / count) * 100) : 0 };
  };

  // Trainer trigger
  const handleStartTrainer = () => {
    if (trainerGroups.length === 0) {
      alert("Please select at least one category to train!");
      return;
    }
    const eligibleCases = cases.filter(c => trainerGroups.includes(c.group));
    if (eligibleCases.length === 0) {
      alert("No cases found in selected categories!");
      return;
    }
    const randomCase = eligibleCases[Math.floor(Math.random() * eligibleCases.length)];
    setActiveTrainerCase(randomCase);
    setTrainerReveal(false);
    setTimerTime(0);
    setIsTimerRunning(false);
    setTimerReadyState("idle");
  };

  const handleToggleTrainerGroup = (group: string) => {
    setTrainerGroups(prev => {
      if (prev.includes(group)) {
        if (prev.length === 1) return prev;
        return prev.filter(g => g !== group);
      } else {
        return [...prev, group];
      }
    });
  };

  const handleSelectAllTrainerGroups = () => {
    setTrainerGroups(groups.filter(g => g !== "All"));
  };

  const handleClearTrainerGroups = () => {
    setTrainerGroups([groups[1]]);
  };

  // Stopwatch Logic
  useEffect(() => {
    if (isTimerRunning) {
      timerStartRef.current = Date.now() - timerTime;
      timerIntervalRef.current = setInterval(() => {
        setTimerTime(Date.now() - timerStartRef.current);
      }, 10);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerRunning]);

  // Handle keyboard timer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewMode !== "trainer" || !activeTrainerCase) return;
      if (e.code === "Space") {
        e.preventDefault();
        if (isTimerRunning) {
          setIsTimerRunning(false);
          setTimerReadyState("idle");
          if (activeTrainerCase) {
            handleSaveTime(activeTrainerCase.id, timerTime);
          }
        } else if (timerReadyState === "idle") {
          setTimerReadyState("ready");
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (viewMode !== "trainer" || !activeTrainerCase) return;
      if (e.code === "Space") {
        e.preventDefault();
        if (timerReadyState === "ready") {
          setTimerTime(0);
          setIsTimerRunning(true);
          setTimerReadyState("running");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [viewMode, activeTrainerCase, isTimerRunning, timerReadyState, timerTime]);

  const handleTimerAction = () => {
    if (isTimerRunning) {
      setIsTimerRunning(false);
      setTimerReadyState("idle");
      if (activeTrainerCase) {
        handleSaveTime(activeTrainerCase.id, timerTime);
      }
    } else {
      setTimerTime(0);
      setIsTimerRunning(true);
      setTimerReadyState("running");
    }
  };

  const handleResetTimer = () => {
    setIsTimerRunning(false);
    setTimerTime(0);
    setTimerReadyState("idle");
  };

  const handleSaveTime = (caseId: number, timeMs: number) => {
    const timeSec = parseFloat((timeMs / 1000).toFixed(2));
    const newRecord = {
      date: new Date().toLocaleDateString(),
      time: timeSec
    };
    setSolveHistory(prev => {
      const records = prev[caseId] || [];
      return {
        ...prev,
        [caseId]: [newRecord, ...records].slice(0, 50)
      };
    });
  };

  const getCaseStats = (caseId: number) => {
    const records = solveHistory[caseId] || [];
    if (records.length === 0) return { best: null, avg: null, count: 0 };
    const best = Math.min(...records.map(r => r.time));
    const avg = parseFloat((records.reduce((sum, r) => sum + r.time, 0) / records.length).toFixed(2));
    return { best, avg, count: records.length };
  };

  const handleTrainerResult = (status: "Mastered" | "Learning") => {
    if (!activeTrainerCase) return;
    updateStatus(activeTrainerCase.id, status);
    setTrainerLog(prev => [
      {
        id: activeTrainerCase.id,
        name: activeTrainerCase.name,
        time: timerTime > 0 ? parseFloat((timerTime / 1000).toFixed(2)) : undefined,
        status
      },
      ...prev
    ]);
    handleStartTrainer();
  };

  const handleResetProgress = () => {
    if (confirm("Are you sure you want to reset your learning stats and solve times? This cannot be undone.")) {
      const initial: Record<number, "Mastered" | "Learning" | "Not Started"> = {};
      cases.forEach(c => {
        initial[c.id] = "Not Started";
      });
      setMasteryData(initial);
      setSolveHistory({});
      setTrainerLog([]);
      setActiveTrainerCase(null);
    }
  };

  const formatTime = (ms: number) => {
    const totalSeconds = ms / 1000;
    return totalSeconds.toFixed(2) + "s";
  };

  // When caseType changes, reset trainer state
  useEffect(() => {
    setActiveTrainerCase(null);
    setTrainerLog([]);
    setTrainerGroups([groups[1]]);
    setSelectedGroup("All");
    setSelectedStatus("All");
    setSearchTerm("");
  }, [caseType]);

  return (
    <div id="ll-app-container" className="min-h-screen theme-bg-main theme-text-main font-sans selection:bg-blue-600 selection:text-white pb-12 transition-colors duration-300">
      {/* Top Professional Header Bar */}
      <header id="ll-header" className="sticky top-0 z-40 theme-card border-b-2 theme-border-main theme-shadow-small mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4">

          {/* Logo & Coach Badge */}
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Cube Coach" className="h-10 w-auto" />
            <h1 className="text-2xl md:text-3xl font-black tracking-tighter theme-card-text uppercase font-display">Cube Coach</h1>
          </div>

          {/* Controls: Mode switching & Theme selection */}
          <div className="flex flex-wrap items-center gap-3 self-stretch md:self-auto justify-end">
            {/* OLL/PLL Toggle */}
            <div className="flex bg-white text-black p-0.5 rounded-xl border-2 theme-border-main theme-shadow-small">
              <button
                onClick={() => setCaseType("oll")}
                className={`px-3 py-1.5 rounded-lg font-black text-xs uppercase transition-all active:scale-95 ${
                  caseType === "oll"
                    ? "bg-blue-600 text-white border-2 theme-border-main theme-shadow-tiny"
                    : "text-black hover:bg-gray-100"
                }`}
              >
                <span className="flex items-center gap-1">
                  <Layers className="w-3 h-3" />
                  OLL
                </span>
              </button>
              <button
                onClick={() => setCaseType("pll")}
                className={`px-3 py-1.5 rounded-lg font-black text-xs uppercase transition-all active:scale-95 ${
                  caseType === "pll"
                    ? "bg-blue-600 text-white border-2 theme-border-main theme-shadow-tiny"
                    : "text-black hover:bg-gray-100"
                }`}
              >
                <span className="flex items-center gap-1">
                  <Layers className="w-3 h-3" />
                  PLL
                </span>
              </button>
            </div>

            {/* Theme Selector */}
            <div className="flex items-center bg-white text-black rounded-xl border-2 theme-border-main px-3 py-1 theme-shadow-small">
              <span className="text-xs font-black uppercase font-mono mr-1.5">Theme:</span>
              <select
                value={activeTheme}
                onChange={(e) => setActiveTheme(e.target.value)}
                aria-label="Select theme"
                className="bg-transparent text-xs font-black uppercase focus:outline-none cursor-pointer py-1"
              >
                {Object.entries(themes).map(([key, theme]) => (
                  <option key={key} value={key}>{theme.label}</option>
                ))}
              </select>
            </div>

            {/* Notation Legend Trigger */}
            <button
              onClick={() => setShowNotationLegend(true)}
              className="flex items-center justify-center w-9 h-9 bg-white text-black rounded-xl border-2 theme-border-main theme-shadow-small hover:bg-gray-100 transition-all active:scale-95"
              title="Cube notation reference"
              aria-label="Open notation legend"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Mode Switching Tabs */}
            <div className="flex bg-white text-black p-1 rounded-xl border-2 theme-border-main theme-shadow-small">
              <button
                id="tab-grid"
                onClick={() => setViewMode("grid")}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-black text-sm uppercase transition-all duration-200 active:scale-95 ${
                  viewMode === "grid"
                    ? "bg-yellow-400 text-black border-2 theme-border-main theme-shadow-small"
                    : "text-black hover:bg-gray-100"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Reference Guide
              </button>
              <button
                id="tab-trainer"
                onClick={() => {
                  setViewMode("trainer");
                  if (!activeTrainerCase) {
                    handleStartTrainer();
                  }
                }}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-black text-sm uppercase transition-all duration-200 active:scale-95 ${
                  viewMode === "trainer"
                    ? "bg-yellow-400 text-black border-2 theme-border-main theme-shadow-small"
                    : "text-black hover:bg-gray-100"
                }`}
              >
                <Timer className="w-4 h-4" />
                Active Trainer
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">

        <StatsCards
          masteredCount={masteredCount}
          learningCount={learningCount}
          notStartedCount={notStartedCount}
          totalCases={totalCases}
          bestSolve={solveHistory && Object.keys(solveHistory).length > 0 ? {
            time: Math.min(...(Object.values(solveHistory) as { date: string; time: number }[][]).flatMap(h => h.map(r => r.time))),
            count: (Object.values(solveHistory) as { date: string; time: number }[][]).reduce((sum, h) => sum + h.length, 0)
          } : null}
        />


        {/* Main Interface Content Switcher */}
        {viewMode === "grid" ? (
          /* ========================================================= */
          /* VIEW 1: INTERACTIVE REFERENCE GRID                        */
          /* ========================================================= */
          <div id="grid-view-section">

            <FilterBar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              selectedGroup={selectedGroup}
              onGroupChange={setSelectedGroup}
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
              onResetProgress={handleResetProgress}
              groups={groups}
              getGroupStats={getGroupStats}
            />

            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-display font-black text-black uppercase tracking-tight flex items-center gap-2">
                <span className="bg-white text-black px-4 py-1.5 rounded-xl border-2 theme-border-main text-xs font-mono font-bold theme-shadow-small">
                  {filteredCases.length} Cases Match Filters
                </span>
              </h2>
              {selectedGroup !== "All" && (
                <div className="text-sm font-black text-black uppercase tracking-tight">
                  Category Progress: <span className="text-blue-600 bg-white px-2 py-0.5 rounded border theme-border-main">{getGroupStats(selectedGroup).percentage}% mastered</span>
                </div>
              )}
            </div>

            {/* Cards Grid */}
            {filteredCases.length > 0 ? (
              <div id="ll-cards-grid" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredCases.map((llCase, cardIndex) => {
                  const currentStatus = masteryData[llCase.id] || "Not Started";
                  const caseStats = getCaseStats(llCase.id);

                  return (
                    <div
                      key={`${caseType}-${llCase.id}`}
                      id={`ll-card-${llCase.id}`}
                      className="theme-card rounded-3xl border-2 theme-border-main flex flex-col overflow-hidden group theme-shadow-main h-full theme-card-glow opacity-0 animate-fade-in-up"
                      style={{ animationDelay: `${cardIndex * 50}ms` }}>
                      {/* Group color stripe */}
                      <div className="h-1 shrink-0" style={{ backgroundColor: GROUP_COLORS[llCase.group] || "#ccc" }}></div>
                      {/* Top Header details */}
                      <div className="p-4 flex items-start justify-between gap-2 border-b theme-border-main theme-muted-bg">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black font-mono bg-yellow-400 text-black px-2 py-0.5 rounded border theme-border-main theme-shadow-tiny">
                            {labelPrefix} #{String(llCase.id).padStart(2, '0')}
                          </span>
                          <span className="text-[10px] font-mono text-gray-600 font-bold px-2 py-0.5 bg-white border border-gray-300 rounded uppercase">
                            {llCase.category}
                          </span>
                          {(() => {
                            const gStats = getGroupStats(llCase.group);
                            const pct = gStats.count > 0 ? Math.round((gStats.mastered / gStats.count) * 100) : 0;
                            const r = 7;
                            const circ = 2 * Math.PI * r;
                            const offset = circ - (pct / 100) * circ;
                            return (
                              <svg width="18" height="18" viewBox="0 0 20 20" className="shrink-0">
                                <circle cx="10" cy="10" r={r} fill="none" stroke="currentColor" strokeWidth="2" opacity="0.15" />
                                <circle cx="10" cy="10" r={r} fill="none" stroke={pct === 100 ? "#16a34a" : "#3b82f6"} strokeWidth="2" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" transform="rotate(-90 10 10)" />
                              </svg>
                            );
                          })()}
                        </div>

                        <select
                          value={currentStatus}
                          onChange={(e) => updateStatus(llCase.id, e.target.value as "Mastered" | "Learning" | "Not Started")}
                          className="text-[9px] font-mono font-bold px-2 py-1 rounded-xl border-2 theme-border-main bg-white cursor-pointer"
                          style={{ color: currentStatus === "Mastered" ? "#16a34a" : currentStatus === "Learning" ? "#2563eb" : "#dc2626" }}
                        >
                          <option value="Not Started" className="text-red-600">🫩 Not Started</option>
                          <option value="Learning" className="text-blue-600">📚 Learning</option>
                          <option value="Mastered" className="text-green-600">🦾 Mastered</option>
                        </select>
                      </div>

                      {/* Case Name & Group */}
                      <div className="px-4 pt-3 pb-2">
                        <h4 className="text-base font-black uppercase tracking-tight">
                          {llCase.name}
                        </h4>
                        <span className="text-[11px] font-mono text-gray-500 font-semibold uppercase tracking-wider block mt-0.5 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full inline-block shrink-0" style={{ backgroundColor: GROUP_COLORS[llCase.group] || "#999" }}></span>
                          {llCase.group}
                        </span>
                      </div>

                      {/* Visual Cube Representation Container */}
                      <div
                        className="p-4 theme-accent-bg flex items-center justify-center border-b theme-border-main relative overflow-hidden h-44"
                        style={{ backgroundColor: GROUP_COLORS[llCase.group] ? `${GROUP_COLORS[llCase.group]}15` : undefined }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-b from-yellow-100/10 to-yellow-50/50"></div>
                        <button
                          onClick={() => setEnlargedImageId(llCase.id)}
                          className="cursor-pointer z-10 transition-transform duration-300 hover:scale-105"
                          title="Click to enlarge"
                        >
                          <CaseImage
                            id={llCase.id}
                            name={llCase.name}
                            type={caseType}
                            className="w-32 h-32 object-contain select-none pointer-events-none"
                          />
                        </button>
                      </div>

                      {/* Study details & Setup Scramble */}
                      <div className="p-4 flex-1 flex flex-col justify-between gap-4">

                        {/* Scramble Setup display */}
                        <div className="theme-accent-bg p-3 rounded-xl border theme-border-main flex items-center justify-between gap-2 theme-shadow-small">
                          <div className="flex-1 py-0.5 min-w-0">
                            <span className="text-[9px] font-bold text-gray-400 uppercase mb-0.5 flex items-center gap-1.5 flex-wrap">
                              Setup Scramble
                            </span>
                            <div className="overflow-x-auto scrollbar-none">
                              <span className="text-xs font-black font-mono block whitespace-normal break-words">
                                {getScramble(llCase.id)}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <button
                              onClick={() => {
                                handleGenerate(llCase.id);
                                handleCopy(getScramble(llCase.id), llCase.id);
                              }}
                              className="p-2 text-black hover:bg-green-200 bg-white rounded-lg border-2 theme-border-main transition-all theme-shadow-tiny hover:shadow-none active:scale-95"
                              title="Generate new scramble"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleCopy(getScramble(llCase.id), llCase.id)}
                              className="p-2 text-black hover:bg-yellow-400 bg-white rounded-lg border-2 theme-border-main transition-all theme-shadow-tiny hover:shadow-none active:scale-95"
                              title="Copy Setup Scramble"
                            >
                              {copiedId === llCase.id ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        <AlgorithmSelector
                          llCase={llCase}
                          caseType={caseType}
                          activeVariant={activeAlgVariant[llCase.id] || "primary"}
                          copiedId={copiedId}
                          onSelectVariant={(id, variant) => setActiveAlgVariant(prev => ({...prev, [id]: variant as "primary" | "alt1" | "alt2" | "alt3" | "alt4" | "alt5"}))}
                          onCopy={(alg, id) => {
                            navigator.clipboard.writeText(alg);
                            setCopiedId(id);
                            showToast("Copied!", id);
                            setTimeout(() => setCopiedId(null), 1500);
                          }}
                        />

                        {/* Best / Solve Speeds if available */}
                        {caseStats.count > 0 && (
                          <div className="pt-2 border-t theme-border-main flex items-center justify-between text-[10px] font-bold font-mono uppercase">
                            <span>Solves: <span className="text-blue-600 font-bold">{caseStats.count}</span></span>
                            <span>PB: <span className="text-green-600 font-bold">{caseStats.best}s</span></span>
                            <span>Avg: <span className="text-blue-600 font-bold">{caseStats.avg}s</span></span>
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            ) : (
              /* No matching results */
              <div className="theme-card text-center py-16 px-4 rounded-3xl border-2 theme-border-main max-w-xl mx-auto mt-6 theme-shadow-main">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl theme-accent-bg border-2 theme-border-main flex items-center justify-center">
                  <svg className="w-8 h-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
                  </svg>
                </div>
                <h3 className="text-base font-black uppercase tracking-tight">No cases matched</h3>
                <p className="text-gray-500 text-sm mt-1 leading-relaxed">
                  Try adjusting your search or filter to find what you're looking for.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedGroup("All");
                    setSelectedStatus("All");
                  }}
                  className="mt-4 px-6 py-2 bg-yellow-400 text-black border-2 theme-border-main font-black uppercase text-xs rounded-xl transition-all theme-shadow-small hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] active:scale-95"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        ) : (
          /* ========================================================= */
          /* VIEW 2: INTERACTIVE ACTIVE TRAINER (QUIZ & STOPWATCH)    */
          /* ========================================================= */
          <div id="trainer-view-section" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 flex flex-col gap-6">
              <TrainerControls
                groups={groups}
                trainerGroups={trainerGroups}
                trainerLog={trainerLog}
                getGroupStats={getGroupStats}
                onToggleGroup={handleToggleTrainerGroup}
                onSelectAll={handleSelectAllTrainerGroups}
                onClear={handleClearTrainerGroups}
                onStart={handleStartTrainer}
              />
            </div>
            <div className="lg:col-span-8 flex flex-col gap-6">
              <TrainerTimer
                activeCase={activeTrainerCase}
                caseType={caseType}
                trainerReveal={trainerReveal}
                copiedScramble={copiedScramble}
                timerTime={timerTime}
                isTimerRunning={isTimerRunning}
                timerReadyState={timerReadyState}
                formatTime={formatTime}
                getScramble={getScramble}
                onNewScramble={(id) => { handleGenerate(id); }}
                onCopyScramble={handleCopyTrainer}
                onTimerAction={handleTimerAction}
                onResetTimer={handleResetTimer}
                onReveal={() => setTrainerReveal(true)}
                onMastered={() => handleTrainerResult("Mastered")}
                onNeedsPractice={() => handleTrainerResult("Learning")}
                onEnlarge={(id) => setEnlargedImageId(id)}
              />
            </div>
          </div>
        )}

      </main>

      <ImageModal
        enlargedImageId={enlargedImageId}
        onClose={() => setEnlargedImageId(null)}
        cases={cases}
        caseType={caseType}
        labelPrefix={labelPrefix}
      />

      <NotationLegend
        isOpen={showNotationLegend}
        onClose={() => setShowNotationLegend(false)}
      />

      <Toast message={toast?.message ?? null} />

    </div>
  );
}
