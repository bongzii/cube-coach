import { useState, useEffect, useMemo } from "react";
import { Copy, Check, RefreshCw, HelpCircle, Boxes, Grid3x3, Shapes, Timer, BookOpen } from "lucide-react";
import { ollCases, OLLCase } from "./data/ollCases";
import { pllCases, PLLCase } from "./data/pllCases";
import { f2lCases, F2LCase } from "./data/f2lCases";
import { ollSetups, pllSetups } from "./data/originalSetups";
import { themes, applyTheme } from "./themes";
import CaseImage from "./components/CaseImage";
import F2LSlotIndicator from "./components/F2LSlotIndicator";
import StatsCards from "./components/StatsCards";
import ImageModal from "./components/ImageModal";
import NotationLegend from "./components/NotationLegend";
import Toast from "./components/Toast";
import AlgorithmSelector from "./components/AlgorithmSelector";
import FilterBar from "./components/FilterBar";
import TimerSection from "./components/TimerSection";
import type { CaseType } from "./types";
import { registerSW } from "virtual:pwa-register";

export type CaseItem = OLLCase | PLLCase | F2LCase;
type MasteryStatus = "Mastered" | "Learning" | "Not Started";
type MasteryByCaseType = Record<CaseType, Record<number, MasteryStatus>>;
const CASE_TYPES: CaseType[] = ["f2l", "oll", "pll"];

const caseKey = (type: CaseType, id: number) => `${type}-${id}`;

function defaultMastery(cases: CaseItem[]): Record<number, MasteryStatus> {
  return Object.fromEntries(cases.map((c) => [c.id, "Not Started"] as const));
}

function loadMastery(): MasteryByCaseType {
  const casesByType: Record<CaseType, CaseItem[]> = { f2l: f2lCases, oll: ollCases, pll: pllCases };
  const defaults = Object.fromEntries(
    CASE_TYPES.map((type) => [type, defaultMastery(casesByType[type])])
  ) as MasteryByCaseType;

  try {
    const saved = localStorage.getItem("cube-coach-mastery-v2");
    if (saved) {
      const parsed = JSON.parse(saved) as Partial<MasteryByCaseType>;
      return CASE_TYPES.reduce((all, type) => ({
        ...all,
        [type]: { ...defaults[type], ...parsed[type] },
      }), {} as MasteryByCaseType);
    }
  } catch (e) {
    console.error(e);
  }
  return defaults;
}

export default function App() {
  const [viewMode, setViewMode] = useState<"library" | "timer">(() => {
    return (localStorage.getItem("cube-coach-view") as "library" | "timer") || "library";
  });
  useEffect(() => { localStorage.setItem("cube-coach-view", viewMode); }, [viewMode]);

  const [caseType, setCaseType] = useState<"oll" | "pll" | "f2l">(() => {
    return (localStorage.getItem("ll-case-type") as "oll" | "pll" | "f2l") || "f2l";
  });

  useEffect(() => {
    localStorage.setItem("ll-case-type", caseType);
  }, [caseType]);

  const cases: CaseItem[] = useMemo(() => {
    switch (caseType) {
      case "oll": return ollCases;
      case "pll": return pllCases;
      default: return f2lCases;
    }
  }, [caseType]);

  const labelPrefix = useMemo(() => {
    switch (caseType) {
      case "oll": return "OLL";
      case "pll": return "PLL";
      default: return "F2L";
    }
  }, [caseType]);

  const groups = useMemo(() => {
    if (caseType === "oll") {
      return [
        "All", "Dot", "Square Shape", "Small Lightning Bolt", "Fish Shape",
        "Knight Move Shape", "Corners Oriented", "Cross", "Awkward Shape",
        "P Shape", "T Shape", "C Shape", "W Shape", "Big Lightning Bolt",
        "Small L Shape", "I Shape"
      ];
    }
    if (caseType === "pll") {
      return ["All", "U", "H", "Z", "A", "E", "F", "G", "J", "N", "R", "T", "V", "Y"];
    }
    if (caseType === "f2l") {
      return ["All", "basic", "basicBack", "advanced", "expert"];
    }
    return ["All"];
  }, [caseType]);

  const GROUP_COLORS: Record<string, string> = {
    "Dot": "#ec4899",
    "Square Shape": "#6ff0bd",
    "Corners Oriented": "#1868e6",
    "Awkward Shape": "#a2634b",
    "P Shape": "#e1a2ff",
    "T Shape": "#ff943f",
    "C Shape": "#2e8489",
    "W Shape": "#c9cf78",
    "Big Lightning Bolt": "#66ddff",
    "Small L Shape": "#119121",
    "I Shape": "#875da0",
    "Fish Shape": "#ad5437",
    "Knight Move Shape": "#f9abdb",
    "Small Lightning Bolt": "#8db0f7",
    "Cross": "#feac50",
    "A": "#678cd5",
    "E": "#6fdf55",
    "F": "#52d0d6",
    "G": "#7d842d",
    "H": "#6da074",
    "J": "#ff869e",
    "N": "#8a62f1",
    "R": "#a7ab4b",
    "T": "#c656d1",
    "U": "#e29c65",
    "V": "#e16243",
    "Y": "#81c0d0",
    "Z": "#9abaff",
    "Advanced F2L": "#4eb67c",
    "Basic Backslot": "#eb424d",
    "Basic Cases / Free Slot": "#ff8fff",
    "Basic F2L": "#437ab6",
    "Basic Inserts": "#c36d8e",
    "Corner in Opposite Slot": "#08abff",
    "Corner is solved": "#ba8de7",
    "Corner on Bottom / Edge on Top / Edge oriented": "#1dade6",
    "Corner on Bottom / Edge on Top / Edge unoriented": "#b17617",
    "Edge flipped": "#6e7c40",
    "Edge in Opposite Slot": "#ffa39f",
    "Edge solved": "#738cff",
    "Expert F2L": "#b03f8d",
    "Flipped edge & corner in adjacent slot": "#cb302b",
    "Other easy cases": "#338453",
    "Pair in wrong slot": "#6c8f95",
    "Pieces on Top / White facing Back / Edge oriented": "#f37344",
    "Pieces on Top / White facing Back / Edge unoriented": "#56c673",
    "Pieces on Top / White facing Front / Edge oriented": "#c7a500",
    "Pieces on Top / White facing Front / Edge unoriented": "#48b1a2",
    "Pieces on Top / White facing Side / Edge oriented": "#ff84c2",
    "Pieces on Top / White facing Side / Edge unoriented": "#72b02f",
    "Pieces on Top / White facing Up / Edge oriented": "#6663c3",
    "Pieces on Top / White facing Up / Edge unoriented": "#68e6ff",
    "Slot in Back / Corner in Adjacent Front Slot": "#bc3c5f",
    "Slot in Back / Edge in Adjacent Front Slot": "#de7ccc",
    "Slot in Front / Corner in Adjacent Slot": "#c3b7ff",
    "Slot in Front / White facing Front": "#5ce3b6",
    "Slot in Front / White facing Side": "#62d1ff",
    "Slot in Front / White facing Up": "#b9d736",
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");

  const [masteryByCaseType, setMasteryByCaseType] = useState<MasteryByCaseType>(loadMastery);
  const masteryData = masteryByCaseType[caseType];

  const [customScrambles, setCustomScrambles] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem("ll-custom-scrambles");
      if (saved) return JSON.parse(saved);
    } catch (e) { console.error(e); }
    return {};
  });

  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; id: number } | null>(null);

  const showToast = (message: string, id: number) => {
    setToast({ message, id });
    setTimeout(() => setToast(null), 2000);
  };

  const [enlargedImageId, setEnlargedImageId] = useState<number | null>(null);
  const [f2lViews, setF2lViews] = useState<Record<number, "fr" | "fl" | "br" | "bl">>({});
  const getF2LView = (id: number) => f2lViews[id] ?? "fr";

  const [activeTheme, setActiveTheme] = useState<string>(() => {
    return localStorage.getItem("ll-theme") || "default";
  });
  useEffect(() => {
    localStorage.setItem("ll-theme", activeTheme);
    applyTheme(activeTheme);
  }, [activeTheme]);

  const [swUpdateAvailable, setSwUpdateAvailable] = useState(false);
  useEffect(() => {
    const updateSW = registerSW({
      onNeedRefresh() { setSwUpdateAvailable(true); },
      onOfflineReady() {},
    });
    (window as unknown as { __cubeCoachReloadSW?: () => void }).__cubeCoachReloadSW = () => updateSW(true);
  }, []);

  const [activeAlgVariant, setActiveAlgVariant] = useState<Record<number, string>>({});
  const [showNotationLegend, setShowNotationLegend] = useState(false);
  const [cycleIdx, setCycleIdx] = useState<Record<number, number>>({});

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setEnlargedImageId(null);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  useEffect(() => {
    localStorage.setItem("cube-coach-mastery-v2", JSON.stringify(masteryByCaseType));
  }, [masteryByCaseType]);

  useEffect(() => {
    localStorage.setItem("ll-custom-scrambles", JSON.stringify(customScrambles));
  }, [customScrambles]);

  const defaultScrambles = useMemo(() => {
    const map: Record<number, string> = {};
    cases.forEach(c => { map[c.id] = c.setup; });
    return map;
  }, [cases]);

  const getScramble = (id: number) => customScrambles[`${caseType}-${id}`] ?? defaultScrambles[id] ?? "";

  const copyText = (text: string) => navigator.clipboard.writeText(text);

  const handleCopy = (scramble: string, id: number) => {
    copyText(scramble);
    setCopiedId(id);
    showToast("Copied!", id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const updateStatus = (id: number, status: MasteryStatus) => {
    setMasteryByCaseType(prev => ({
      ...prev,
      [caseType]: { ...prev[caseType], [id]: status },
    }));
  };

  function generateScramble(id: number): string {
    let setups: string[] | undefined;
    if (caseType === "pll") setups = pllSetups[id];
    else if (caseType === "oll") setups = ollSetups[id];
    else {
      const fCase = f2lCases.find(c => c.id === id);
      setups = fCase?.setups ?? [];
    }
    if (!setups || setups.length === 0) return "";
    const idx = (cycleIdx[id] ?? 0) % setups.length;
    setCycleIdx(prev => ({ ...prev, [id]: idx + 1 }));
    return setups[idx];
  }

  const handleGenerate = (id: number): string => {
    const key = `${caseType}-${id}`;
    const scramble = generateScramble(id);
    if (scramble) setCustomScrambles(prev => ({ ...prev, [key]: scramble }));
    return scramble;
  };

  const filteredCases = cases.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          `${labelPrefix.toLowerCase()} ${c.id}`.includes(searchTerm.toLowerCase()) ||
                          c.id.toString() === searchTerm.trim();
    const matchesGroup = selectedGroup === "All" || c.group === selectedGroup;
    const matchesStatus = selectedStatus === "All" || masteryData[c.id] === selectedStatus;
    return matchesSearch && matchesGroup && matchesStatus;
  });

  const totalCases = cases.length;
  const masteredCount = Object.values(masteryData).filter(v => v === "Mastered").length;
  const learningCount = Object.values(masteryData).filter(v => v === "Learning").length;
  const notStartedCount = Object.values(masteryData).filter(v => v === "Not Started").length;

  const getGroupStats = (groupName: string) => {
    const casesInGroup = cases.filter(c => c.group === groupName);
    const count = casesInGroup.length;
    const mastered = casesInGroup.filter(c => masteryData[c.id] === "Mastered").length;
    return { count, mastered, percentage: count > 0 ? Math.round((mastered / count) * 100) : 0 };
  };

  const handleResetProgress = () => {
    if (confirm(`Reset ${caseType.toUpperCase()} learning progress? This cannot be undone.`)) {
      setMasteryByCaseType(prev => ({ ...prev, [caseType]: defaultMastery(cases) }));
    }
  };

  useEffect(() => {
    setSelectedGroup("All");
    setSelectedStatus("All");
    setSearchTerm("");
  }, [caseType]);

  return (
    <div id="ll-app-container" className="min-h-screen theme-bg-main theme-text-main font-sans pb-12 transition-colors duration-300">
      <header id="ll-header" className="sticky top-0 z-40 theme-card border-b-2 theme-border-main theme-shadow-small mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4">

          <div className="flex items-center gap-3">
            <img src="./logo.png" alt="Cube Coach" className="h-10 w-auto" />
            <h1 className="text-2xl md:text-3xl font-black tracking-tighter theme-card-text uppercase font-display">Cube Coach</h1>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-stretch md:self-auto justify-end">
            <div className="theme-toggle-group flex p-0.5 rounded-xl theme-shadow-small">
              <button
                onClick={() => setViewMode("library")}
                className={`px-3 py-1.5 rounded-lg font-black text-xs uppercase transition-all active:scale-95 ${
                  viewMode === "library" ? "theme-btn-primary theme-shadow-tiny" : "theme-btn-ghost"
                }`}
              >
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  Library
                </span>
              </button>
              <button
                onClick={() => setViewMode("timer")}
                className={`px-3 py-1.5 rounded-lg font-black text-xs uppercase transition-all active:scale-95 ${
                  viewMode === "timer" ? "theme-btn-primary theme-shadow-tiny" : "theme-btn-ghost"
                }`}
              >
                <span className="flex items-center gap-1">
                  <Timer className="w-3 h-3" />
                  Timer
                </span>
              </button>
            </div>

            {viewMode === "library" && (
            <div className="theme-toggle-group flex p-0.5 rounded-xl theme-shadow-small">
              <button
                onClick={() => setCaseType("f2l")}
                className={`px-3 py-1.5 rounded-lg font-black text-xs uppercase transition-all active:scale-95 ${
                  caseType === "f2l" ? "theme-btn-primary theme-shadow-tiny" : "theme-btn-ghost"
                }`}
              >
                <span className="flex items-center gap-1">
                  <Boxes className="w-3 h-3" />
                  F2L
                </span>
              </button>
              <button
                onClick={() => setCaseType("oll")}
                className={`px-3 py-1.5 rounded-lg font-black text-xs uppercase transition-all active:scale-95 ${
                  caseType === "oll" ? "theme-btn-primary theme-shadow-tiny" : "theme-btn-ghost"
                }`}
              >
                <span className="flex items-center gap-1">
                  <Grid3x3 className="w-3 h-3" />
                  OLL
                </span>
              </button>
              <button
                onClick={() => setCaseType("pll")}
                className={`px-3 py-1.5 rounded-lg font-black text-xs uppercase transition-all active:scale-95 ${
                  caseType === "pll" ? "theme-btn-primary theme-shadow-tiny" : "theme-btn-ghost"
                }`}
              >
                <span className="flex items-center gap-1">
                  <Shapes className="w-3 h-3" />
                  PLL
                </span>
              </button>
            </div>
            )}

            <div className="theme-control-surface flex items-center rounded-xl px-3 py-1 theme-shadow-small">
              <span className="text-xs font-black uppercase font-mono mr-1.5">Theme:</span>
              <select
                value={activeTheme}
                onChange={(e) => setActiveTheme(e.target.value)}
                aria-label="Select theme"
                className="theme-control-surface bg-transparent text-xs font-black uppercase focus:outline-none cursor-pointer py-1"
              >
                {Object.entries(themes).map(([key, theme]) => (
                  <option key={key} value={key}>{theme.label}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setShowNotationLegend(true)}
              className="theme-control-surface flex items-center gap-1.5 px-3 h-9 rounded-xl theme-shadow-small transition-all active:scale-95"
              title="Open move notation guide"
              aria-label="Open move notation guide"
            >
              <HelpCircle className="w-4 h-4" />
              <span className="text-xs font-black uppercase font-mono">Move notation</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {viewMode === "library" ? (
          <>
            <StatsCards
              masteredCount={masteredCount}
              learningCount={learningCount}
              notStartedCount={notStartedCount}
              totalCases={totalCases}
            />

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

              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-display font-black theme-card-text uppercase tracking-tight flex items-center gap-2">
                  <span className="theme-pill-accent-soft px-4 py-1.5 rounded-xl border-2 theme-border-main text-xs font-mono font-bold theme-shadow-small">
                    {filteredCases.length} Cases Match Filters
                  </span>
                </h2>
                {selectedGroup !== "All" && (
                  <div className="text-sm font-black theme-card-text uppercase tracking-tight">
                    Category Progress: <span className="theme-pill-accent-soft text-blue-600 px-2 py-0.5 rounded border theme-border-main">{getGroupStats(selectedGroup).percentage}% mastered</span>
                  </div>
                )}
              </div>

              {filteredCases.length > 0 ? (
                <div id="ll-cards-grid" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredCases.map((llCase, cardIndex) => {
                const currentStatus = masteryData[llCase.id] || "Not Started";
                const colorKey = caseType === "f2l" ? llCase.category : llCase.group;

                return (
                  <div
                    key={`${caseType}-${llCase.id}`}
                    id={`ll-card-${llCase.id}`}
                    className="theme-card rounded-3xl border-2 theme-border-main flex flex-col overflow-hidden group theme-shadow-main h-full theme-card-glow opacity-0 animate-fade-in-up"
                    style={{ animationDelay: `${cardIndex * 50}ms` }}>
                    <div className="h-1 shrink-0" style={{ backgroundColor: GROUP_COLORS[colorKey] || "#ccc" }}></div>
                    <div className="p-4 flex items-start justify-between gap-2 border-b theme-border-main theme-muted-bg">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black font-mono theme-pill-accent px-2 py-0.5 rounded theme-shadow-tiny">
                          {labelPrefix} #{String(llCase.id).padStart(2, '0')}
                        </span>
                        {caseType === "f2l" && (
                          <F2LSlotIndicator
                            slot={(llCase as F2LCase).slot}
                            edgeOriented={(llCase as F2LCase).edgeOriented}
                          />
                        )}
                      </div>

                      <select
                        value={currentStatus}
                        onChange={(e) => updateStatus(llCase.id, e.target.value as "Mastered" | "Learning" | "Not Started")}
                        className="text-[9px] font-mono font-bold px-2 py-1 rounded-xl border-2 theme-border-main theme-control-surface cursor-pointer"
                        style={{ color: currentStatus === "Mastered" ? "#16a34a" : currentStatus === "Learning" ? "#2563eb" : "#dc2626" }}
                      >
                        <option value="Not Started" className="text-red-600">🫩 Not Started</option>
                        <option value="Learning" className="text-blue-600">📚 Learning</option>
                        <option value="Mastered" className="text-green-600">🦾 Mastered</option>
                      </select>
                    </div>

                    <div className="px-4 pt-3 pb-2">
                      <h4 className="text-base font-black uppercase tracking-tight">
                        {llCase.name}
                      </h4>
                      <span className="text-[11px] font-mono theme-muted-text font-semibold uppercase tracking-wider block mt-0.5 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full inline-block shrink-0" style={{ backgroundColor: GROUP_COLORS[colorKey] || "#999" }}></span>
                        {llCase.group}
                        {caseType === "f2l" && (
                          <span className="text-[10px] font-mono theme-muted-text font-bold px-1.5 py-0.5 theme-chip rounded uppercase">
                            {llCase.category}
                          </span>
                        )}
                      </span>
                    </div>

                    <div
                      className="p-4 theme-accent-bg flex items-center justify-center border-b theme-border-main relative overflow-hidden h-44"
                      style={{ backgroundColor: GROUP_COLORS[llCase.group] ? `${GROUP_COLORS[llCase.group]}15` : undefined }}
                    >
                      <button
                        onClick={() => setEnlargedImageId(llCase.id)}
                        className="cursor-pointer z-10 transition-transform duration-300 hover:scale-105"
                        title="Click to enlarge"
                      >
                        <CaseImage
                          id={llCase.id}
                          name={llCase.name}
                          type={caseType}
                          f2lView={caseType === "f2l" ? getF2LView(llCase.id) : undefined}
                          className="w-32 h-32 object-contain select-none pointer-events-none"
                        />
                      </button>
                      {caseType === "f2l" && (
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex theme-toggle-group p-0.5 rounded-lg theme-shadow-small">
                          {([
                            { slot: "fl", label: "Left" },
                            { slot: "fr", label: "Center" },
                            { slot: "br", label: "Right" },
                            { slot: "bl", label: "Back" },
                          ] as const).map(({ slot, label }) => (
                            <button
                              key={slot}
                              onClick={() => setF2lViews(prev => ({ ...prev, [llCase.id]: slot }))}
                              className={`px-2 py-0.5 rounded-md font-black text-[10px] uppercase transition-all active:scale-95 ${
                                getF2LView(llCase.id) === slot ? "theme-btn-primary" : "theme-btn-ghost"
                              }`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between gap-4">
                      <div className="theme-pill-accent-soft p-3 rounded-xl border theme-border-main flex items-center justify-between gap-2 theme-shadow-small">
                        <div className="flex-1 py-0.5 min-w-0">
                          <span className="text-[9px] font-bold theme-muted-text uppercase mb-0.5 flex items-center gap-1.5 flex-wrap">
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
                              const scramble = handleGenerate(llCase.id);
                              if (scramble) handleCopy(scramble, llCase.id);
                            }}
                            className="theme-control-surface p-2 rounded-lg transition-all theme-shadow-tiny hover:shadow-none active:scale-95"
                            title="Generate new scramble"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleCopy(getScramble(llCase.id), llCase.id)}
                            className="theme-control-surface p-2 rounded-lg transition-all theme-shadow-tiny hover:shadow-none active:scale-95"
                            title="Copy Setup Scramble"
                          >
                            {copiedId === llCase.id ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <AlgorithmSelector
                        llCase={llCase}
                        caseType={caseType}
                        activeVariant={activeAlgVariant[llCase.id] || "1"}
                        copiedId={copiedId}
                        onSelectVariant={(id, variant) => setActiveAlgVariant(prev => ({...prev, [id]: variant}))}
                        onCopy={(alg, id) => {
                          navigator.clipboard.writeText(alg);
                          setCopiedId(id);
                          showToast("Copied!", id);
                          setTimeout(() => setCopiedId(null), 1500);
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="theme-card text-center py-16 px-4 rounded-3xl border-2 theme-border-main max-w-xl mx-auto mt-6 theme-shadow-main">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl theme-accent-bg border-2 theme-border-main flex items-center justify-center">
                <svg className="w-8 h-8 theme-card-text" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="text-base font-black uppercase tracking-tight">No cases matched</h3>
              <p className="theme-muted-text text-sm mt-1 leading-relaxed">
                Try adjusting your search or filter to find what you're looking for.
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedGroup("All");
                  setSelectedStatus("All");
                }}
                className="mt-4 px-6 py-2 theme-btn-primary font-black uppercase text-xs rounded-xl transition-all theme-shadow-small hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] active:scale-95"
              >
                Clear Filters
              </button>
            </div>
          )}
          </div>
          </>
        ) : (
          <TimerSection />
        )}
      </main>

      <ImageModal
        enlargedImageId={enlargedImageId}
        onClose={() => setEnlargedImageId(null)}
        cases={cases}
        caseType={caseType}
        labelPrefix={labelPrefix}
        f2lView={enlargedImageId != null ? getF2LView(enlargedImageId) : undefined}
      />

      <NotationLegend
        isOpen={showNotationLegend}
        onClose={() => setShowNotationLegend(false)}
      />

      <Toast message={toast?.message ?? null} />

      {swUpdateAvailable && (
        <div className="fixed top-0 left-0 right-0 z-[60] flex items-center justify-center gap-3 px-4 py-2 theme-btn-primary border-b-2 theme-border-main text-xs font-black font-mono uppercase animate-fade-in">
          <span>New version available</span>
          <button
            onClick={() => (window as unknown as { __cubeCoachReloadSW?: () => void }).__cubeCoachReloadSW?.()}
            className="px-2 py-0.5 rounded border-2 theme-border-main theme-control-surface font-black"
          >
            Reload
          </button>
          <button
            onClick={() => setSwUpdateAvailable(false)}
            className="px-2 py-0.5 rounded border-2 theme-border-main theme-control-surface font-black"
            aria-label="Dismiss update"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
