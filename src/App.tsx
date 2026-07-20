import { useState, useEffect, useRef, useMemo } from "react";
import {
  Copy,
  Check,
  Timer,
  HelpCircle,
  Boxes,
  Grid3x3,
  Shapes,
  RefreshCw
} from "lucide-react";
import { ollCases, OLLCase } from "./data/ollCases";
import { pllCases, PLLCase } from "./data/pllCases";
import { f2lCases, F2LCase } from "./data/f2lCases";
import { ollSetups, pllSetups } from "./data/originalSetups";
import { ollAlgs } from "./data/ollAlgs";
import { pllAlgs } from "./data/pllAlgs";
import { f2lAlgs } from "./data/f2lAlgs";

import { themes, applyTheme } from "./themes";
import CaseImage from "./components/CaseImage";
import F2LSlotIndicator from "./components/F2LSlotIndicator";
import StatsCards from "./components/StatsCards";
import ImageModal from "./components/ImageModal";
import NotationLegend from "./components/NotationLegend";
import Toast from "./components/Toast";
import AlgorithmSelector from "./components/AlgorithmSelector";
import FilterBar from "./components/FilterBar";
import TrainerControls from "./components/TrainerControls";
import TrainerTimer from "./components/TrainerTimer";
import SessionPanel from "./components/SessionPanel";
import TimerSettingsPopover from "./components/TimerSettingsPopover";

import type { CaseType, Penalty, Session, SessionType, Solve, TimerSettings, TimerPhase } from "./types";
import { DEFAULT_TIMER_SETTINGS } from "./types";
import { InspectionAlerts } from "./lib/audio";
import { registerSW } from "virtual:pwa-register";

export type CaseItem = OLLCase | PLLCase | F2LCase;
type MasteryStatus = "Mastered" | "Learning" | "Not Started";
type MasteryByCaseType = Record<CaseType, Record<number, MasteryStatus>>;
const CASE_TYPES: CaseType[] = ["f2l", "oll", "pll"];

const caseKey = (type: CaseType, id: number) => `${type}-${id}`;

function defaultMastery(cases: CaseItem[]): Record<number, MasteryStatus> {
  return Object.fromEntries(cases.map((c) => [c.id, "Not Started"]));
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

    // One-time migration from the original per-mode keys.
    return CASE_TYPES.reduce((all, type) => {
      const legacy = localStorage.getItem(`ll-mastery-${type}`);
      return { ...all, [type]: { ...defaults[type], ...(legacy ? JSON.parse(legacy) : {}) } };
    }, {} as MasteryByCaseType);
  } catch (e) {
    console.error(e);
    return defaults;
  }
}

// ── Session persistence helpers ────────────────────────────────────
const genId = () =>
  (typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36));

function makeSession(name: string, type: SessionType, caseType: CaseType): Session {
  return { id: genId(), name, type, pinned: false, caseType, createdAt: Date.now(), solves: [] };
}

function loadSessions(): Session[] {
  try {
    const saved = localStorage.getItem("ll-sessions");
    if (saved) {
      const parsed = JSON.parse(saved) as Session[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error(e);
  }
  return [makeSession("Default Session", "standard", "f2l")];
}

function loadActiveSessionId(sessions: Session[]): string {
  try {
    const saved = localStorage.getItem("ll-active-session");
    if (saved && sessions.some((s) => s.id === saved)) return saved;
  } catch (e) {
    console.error(e);
  }
  return sessions[0]?.id ?? "";
}

function loadTimerSettings(): TimerSettings {
  try {
    const saved = localStorage.getItem("ll-timer-settings");
    if (saved) return { ...DEFAULT_TIMER_SETTINGS, ...JSON.parse(saved) };
  } catch (e) {
    console.error(e);
  }
  return DEFAULT_TIMER_SETTINGS;
}

export default function App() {
  // Case type toggle  
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

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"grid" | "trainer">("grid");

  // Keep all three modes together so changing modes can never overwrite progress.
  const [masteryByCaseType, setMasteryByCaseType] = useState<MasteryByCaseType>(loadMastery);
  const masteryData = masteryByCaseType[caseType];

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

  // F2L slot-orientation view, per-card (independent across cases; resets on reload)
  const [f2lViews, setF2lViews] = useState<Record<number, "fr" | "fl" | "br" | "bl">>({});
  const getF2LView = (id: number) => f2lViews[id] ?? "fr";

  // Active theme state
  const [activeTheme, setActiveTheme] = useState<string>(() => {
    return localStorage.getItem("ll-theme") || "default";
  });

  useEffect(() => {
    localStorage.setItem("ll-theme", activeTheme);
    applyTheme(activeTheme);
  }, [activeTheme]);

  // PWA update prompt: show banner when a new service worker is waiting
  const [swUpdateAvailable, setSwUpdateAvailable] = useState(false);
  useEffect(() => {
    const updateSW = registerSW({
      onNeedRefresh() {
        setSwUpdateAvailable(true);
      },
      onOfflineReady() {},
    });
    (window as unknown as { __cubeCoachReloadSW?: () => void }).__cubeCoachReloadSW = () => updateSW(true);
  }, []);

  // Active algorithm variant per case
  const [activeAlgVariant, setActiveAlgVariant] = useState<Record<number, string>>({});

  // Rotations state
  const [showNotationLegend, setShowNotationLegend] = useState(false);

  // Trainer state
  const [trainerGroups, setTrainerGroups] = useState<string[]>(() => [groups[1]]);
  const [activeTrainerCase, setActiveTrainerCase] = useState<CaseItem | null>(null);
  const [trainerReveal, setTrainerReveal] = useState(false);
  const [trainerRunId, setTrainerRunId] = useState(0);

  // ── CubeTime-style sessions & timer ──────────────────────────────
  const [sessions, setSessions] = useState<Session[]>(() => loadSessions());
  const [activeSessionId, setActiveSessionId] = useState<string | null>(() => loadActiveSessionId(sessions));
  const [timerSettings, setTimerSettings] = useState<TimerSettings>(() => loadTimerSettings());

  const [timerPhase, setTimerPhase] = useState<TimerPhase>("idle");
  const [timerTime, setTimerTime] = useState(0);
  const [inspectionLeft, setInspectionLeft] = useState(0);
  const [pendingPenalty, setPendingPenalty] = useState<Penalty>("none");

  const timerIntervalRef = useRef<number | null>(null);
  const holdTimeoutRef = useRef<number | null>(null);
  const inspectionIntervalRef = useRef<number | null>(null);
  const timerStartRef = useRef<number>(0);
  const timerPhaseRef = useRef<TimerPhase>("idle");

  const sessionsForCaseType = useMemo(
    () => sessions.filter((s) => s.caseType === caseType),
    [sessions, caseType]
  );

  const activeSession = useMemo(
    () => sessionsForCaseType.find((s) => s.id === activeSessionId) ?? sessionsForCaseType[0],
    [sessionsForCaseType, activeSessionId]
  );

  // Derived per-case solve history (source of truth = sessions). Recomputed
  // whenever sessions change so grid PB/Avg and dashboard best stay in sync
  // with penalty edits and deleted solves.
  const solveHistory = useMemo(() => {
    const map: Record<string, { date: string; time: number }[]> = {};
    for (const s of sessions) {
      for (const sv of s.solves) {
        if (sv.caseType !== caseType || sv.penalty === "DNF" || sv.time === null) continue;
        const effective = sv.time + (sv.penalty === "+2" ? 2 : 0);
        (map[caseKey(sv.caseType, sv.caseId)] ||= []).push({ date: new Date(sv.date).toLocaleDateString(), time: effective });
      }
    }
    return map;
  }, [sessions, caseType]);

  // Close enlarged image on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setEnlargedImageId(null);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  // Save all modes as one atomic progress record.
  useEffect(() => {
    localStorage.setItem("cube-coach-mastery-v2", JSON.stringify(masteryByCaseType));
  }, [masteryByCaseType]);

  // Persist sessions, active session, and timer settings
  useEffect(() => {
    localStorage.setItem("ll-sessions", JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    if (activeSessionId) localStorage.setItem("ll-active-session", activeSessionId);
  }, [activeSessionId]);

  useEffect(() => {
    localStorage.setItem("ll-timer-settings", JSON.stringify(timerSettings));
  }, [timerSettings]);

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

  const copyText = (text: string) => navigator.clipboard.writeText(text);

  const handleCopy = (scramble: string, id: number) => {
    copyText(scramble);
    setCopiedId(id);
    showToast("Copied!", id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleCopyTrainer = (scramble: string) => {
    copyText(scramble);
    setCopiedScramble(scramble);
    setTimeout(() => setCopiedScramble(null), 1500);
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
    if (scramble) {
      setCustomScrambles(prev => ({ ...prev, [key]: scramble }));
    }
    return scramble;
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
      showToast("Please select at least one category to train!", -1);
      return;
    }
    const eligibleCases = cases.filter(c => trainerGroups.includes(c.group));
    if (eligibleCases.length === 0) {
      showToast("No cases found in selected categories!", -1);
      return;
    }
    const randomCase = eligibleCases[Math.floor(Math.random() * eligibleCases.length)];
    setActiveTrainerCase(randomCase);
    setTrainerReveal(false);
    resetTimerPhase();
    setTrainerRunId(prev => prev + 1);
  };

  // ── Timer phase machine (hold-to-start, inspection, penalties) ──
  function clearTimerIntervals() {
    if (timerIntervalRef.current) { clearInterval(timerIntervalRef.current); timerIntervalRef.current = null; }
    if (holdTimeoutRef.current) { clearTimeout(holdTimeoutRef.current); holdTimeoutRef.current = null; }
    if (inspectionIntervalRef.current) { clearInterval(inspectionIntervalRef.current); inspectionIntervalRef.current = null; }
  }

  function goPhase(p: TimerPhase) {
    timerPhaseRef.current = p;
    setTimerPhase(p);
  }

  function resetTimerPhase() {
    clearTimerIntervals();
    goPhase("idle");
    setTimerTime(0);
    setInspectionLeft(0);
    setPendingPenalty("none");
  }

  function beginInspection() {
    if (!timerSettings.inspectionOn) {
      goPhase("ready");
      return;
    }
    goPhase("inspection");
    setInspectionLeft(timerSettings.inspectionSec);
    if (inspectionIntervalRef.current) clearInterval(inspectionIntervalRef.current);
    inspectionIntervalRef.current = setInterval(() => {
      setInspectionLeft(prev => {
        const next = prev - 1;
        if (next === 8 && timerSettings.alertsOn) InspectionAlerts.warn();
        if (next === 12 && timerSettings.alertsOn) InspectionAlerts.final();
        if (next <= 0) {
          if (timerSettings.alertsOn) InspectionAlerts.expired();
          setPendingPenalty("+2");
          return 0;
        }
        return next;
      });
    }, 1000) as unknown as number;
  }

  // Called on press/hold start (pointer or Space down)
  function pressTimer() {
    if (timerPhase === "running") {
      stopSolve();
      return;
    }
    if (timerPhase !== "idle" && timerPhase !== "inspection") return;
    // Pause inspection countdown while holding
    if (inspectionIntervalRef.current) { clearInterval(inspectionIntervalRef.current); inspectionIntervalRef.current = null; }
    goPhase("holding");
    holdTimeoutRef.current = setTimeout(() => {
      goPhase("ready");
    }, timerSettings.holdMs) as unknown as number;
  }

  // Called on release (pointer or Space up)
  function releaseTimer() {
    if (timerPhase === "holding") {
      // released before hold completed -> cancel and resume inspection if it was active
      if (holdTimeoutRef.current) { clearTimeout(holdTimeoutRef.current); holdTimeoutRef.current = null; }
      if (timerSettings.inspectionOn && inspectionLeft > 0) {
        goPhase("inspection");
        inspectionIntervalRef.current = setInterval(() => {
          setInspectionLeft(prev => {
            const next = prev - 1;
            if (next === 8 && timerSettings.alertsOn) InspectionAlerts.warn();
            if (next === 12 && timerSettings.alertsOn) InspectionAlerts.final();
            if (next <= 0) {
              if (timerSettings.alertsOn) InspectionAlerts.expired();
              setPendingPenalty("+2");
              return 0;
            }
            return next;
          });
        }, 1000) as unknown as number;
      } else {
        goPhase("idle");
      }
      return;
    }
    if (timerPhase === "inspection" || timerPhase === "ready") {
      // start solving
      if (inspectionIntervalRef.current) { clearInterval(inspectionIntervalRef.current); inspectionIntervalRef.current = null; }
      goPhase("running");
      setTimerTime(0);
      timerStartRef.current = Date.now();
      if (timerSettings.alertsOn) InspectionAlerts.start();
      timerIntervalRef.current = setInterval(() => {
        setTimerTime(Date.now() - timerStartRef.current);
      }, 10) as unknown as number;
    }
  }

  function stopSolve() {
    clearTimerIntervals();
    const finalMs = Date.now() - timerStartRef.current;
    goPhase("idle");
    if (activeTrainerCase && activeSession) {
      saveSolve(finalMs, pendingPenalty);
    }
    setTimerTime(0);
    setPendingPenalty("none");
  }

  function saveSolve(timeMs: number, penalty: Penalty) {
    if (!activeTrainerCase || !activeSession) return;
    const timeSec = penalty === "DNF" ? null : parseFloat((timeMs / 1000).toFixed(timerSettings.precision));
    const solve: Solve = {
      id: genId(),
      caseId: activeTrainerCase.id,
      caseType,
      caseName: activeTrainerCase.name,
      time: timeSec,
      penalty,
      date: Date.now(),
      scramble: getScramble(activeTrainerCase.id),
    };
    setSessions(prev => prev.map(s => s.id === activeSession.id
      ? { ...s, solves: [solve, ...s.solves].slice(0, 500) }
      : s));
  }

  function setSolvePenalty(sessionId: string, solveId: string, penalty: Penalty) {
    setSessions(prev => prev.map(s => s.id === sessionId
      ? { ...s, solves: s.solves.map(sv => sv.id === solveId ? { ...sv, penalty } : sv) }
      : s));
  }

  function deleteSolve(sessionId: string, solveId: string) {
    setSessions(prev => prev.map(s => s.id === sessionId
      ? { ...s, solves: s.solves.filter(sv => sv.id !== solveId) }
      : s));
  }

  function createSession(name: string, type: SessionType) {
    const s = makeSession(name || `${type[0].toUpperCase()}${type.slice(1)} Session`, type, caseType);
    setSessions(prev => [...prev, s]);
    setActiveSessionId(s.id);
  }

  function deleteSession(id: string) {
    setSessions(prev => {
      const next = prev.filter(s => s.id !== id);
      if (id === activeSessionId && next.length > 0) setActiveSessionId(next[0].id);
      return next.length > 0 ? next : [makeSession("Default Session", "standard", caseType)];
    });
  }

  function togglePinSession(id: string) {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, pinned: !s.pinned } : s));
  }

  function renameSession(id: string, name: string) {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, name } : s));
  }

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

  // Handle keyboard timer (hold Space to start/stop)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewMode !== "trainer" || !activeTrainerCase) return;
      if (e.code === "Space") {
        e.preventDefault();
        if (e.repeat) return;
        pressTimer();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (viewMode !== "trainer" || !activeTrainerCase) return;
      if (e.code === "Space") {
        e.preventDefault();
        releaseTimer();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [viewMode, activeTrainerCase, timerPhase, timerSettings]);

  const handleResetTimer = () => {
    resetTimerPhase();
  };

  const updateTimerSettings = (next: TimerSettings) => {
    setTimerSettings(next);
  };

  // Begin inspection on each new trainer run (monotonic runId so it restarts
  // even when the random case repeats the previous id).
  useEffect(() => {
    if (viewMode === "trainer" && activeTrainerCase && timerPhase === "idle") {
      beginInspection();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trainerRunId, viewMode]);
  const getCaseStats = (caseId: number) => {
    const records = solveHistory[caseKey(caseType, caseId)] || [];
    if (records.length === 0) return { best: null, avg: null, count: 0 };
    const best = Math.min(...records.map(r => r.time));
    const avg = parseFloat((records.reduce((sum, r) => sum + r.time, 0) / records.length).toFixed(2));
    return { best, avg, count: records.length };
  };

  const overallBest = () => {
    const all = Object.values(solveHistory).flatMap(h => h.map(r => r.time));
    return all.length ? { time: Math.min(...all), count: all.length } : null;
  };

  const handleTrainerResult = (status: "Mastered" | "Learning") => {
    if (!activeTrainerCase) return;
    updateStatus(activeTrainerCase.id, status);
    handleStartTrainer();
  };

  const handleResetProgress = () => {
    if (confirm(`Reset ${caseType.toUpperCase()} learning progress and solve times? This cannot be undone.`)) {
      setMasteryByCaseType(prev => ({ ...prev, [caseType]: defaultMastery(cases) }));
      const replacement = makeSession("Default Session", "standard", caseType);
      setSessions(prev => [...prev.filter((s) => s.caseType !== caseType), replacement]);
      setActiveSessionId(replacement.id);
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
    setTrainerGroups([groups[1]]);
    setSelectedGroup("All");
    setSelectedStatus("All");
    setSearchTerm("");
    const firstSession = sessions.find((s) => s.caseType === caseType);
    if (firstSession) {
      setActiveSessionId(firstSession.id);
    } else {
      const newSession = makeSession("Default Session", "standard", caseType);
      setSessions((prev) => [...prev, newSession]);
      setActiveSessionId(newSession.id);
    }
  }, [caseType, groups, sessions]);

  return (
    <div id="ll-app-container" className="min-h-screen theme-bg-main theme-text-main font-sans pb-12 transition-colors duration-300">
      {/* Top Professional Header Bar */}
      <header id="ll-header" className="sticky top-0 z-40 theme-card border-b-2 theme-border-main theme-shadow-small mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4">

          {/* Logo & Coach Badge */}
          <div className="flex items-center gap-3">
            <img src="./logo.png" alt="Cube Coach" className="h-10 w-auto" />
            <h1 className="text-2xl md:text-3xl font-black tracking-tighter theme-card-text uppercase font-display">Cube Coach</h1>
          </div>

          {/* Controls: Mode switching & Theme selection */}
          <div className="flex flex-wrap items-center gap-3 self-stretch md:self-auto justify-end">
              {/* F2L / OLL / PLL Toggle */}
              <div className="theme-toggle-group flex p-0.5 rounded-xl theme-shadow-small">
                <button
                  onClick={() => setCaseType("f2l")}
                  className={`px-3 py-1.5 rounded-lg font-black text-xs uppercase transition-all active:scale-95 ${
                    caseType === "f2l"
                      ? "theme-btn-primary theme-shadow-tiny"
                      : "theme-btn-ghost"
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
                    caseType === "oll"
                      ? "theme-btn-primary theme-shadow-tiny"
                      : "theme-btn-ghost"
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
                    caseType === "pll"
                      ? "theme-btn-primary theme-shadow-tiny"
                      : "theme-btn-ghost"
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <Shapes className="w-3 h-3" />
                    PLL
                  </span>
                </button>
              </div>

            {/* Theme Selector */}
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

            {/* Notation Legend Trigger */}
            <button
              onClick={() => setShowNotationLegend(true)}
              className="theme-control-surface flex items-center gap-1.5 px-3 h-9 rounded-xl theme-shadow-small transition-all active:scale-95"
              title="Open move notation guide"
              aria-label="Open move notation guide"
            >
              <HelpCircle className="w-4 h-4" />
              <span className="text-xs font-black uppercase font-mono">Move notation</span>
            </button>

            {/* Mode Switching Tabs */}
            <div className="theme-toggle-group flex p-1 rounded-xl theme-shadow-small">
              <button
                id="tab-grid"
                onClick={() => setViewMode("grid")}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-black text-sm uppercase transition-all duration-200 active:scale-95 ${
                  viewMode === "grid"
                    ? "theme-btn-primary theme-shadow-small"
                    : "theme-btn-ghost"
                }`}
              >
                <span className="text-base leading-none">📖</span>
                Case Library
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
                    ? "theme-btn-primary theme-shadow-small"
                    : "theme-btn-ghost"
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
          bestSolve={overallBest()}
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

            {/* Cards Grid */}
            {filteredCases.length > 0 ? (
              <div id="ll-cards-grid" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredCases.map((llCase, cardIndex) => {
                  const currentStatus = masteryData[llCase.id] || "Not Started";
                  const caseStats = getCaseStats(llCase.id);
                  const colorKey = caseType === "f2l" ? llCase.category : llCase.group;

                return (
                  <div
                    key={`${caseType}-${llCase.id}`}
                    id={`ll-card-${llCase.id}`}
                    className="theme-card rounded-3xl border-2 theme-border-main flex flex-col overflow-hidden group theme-shadow-main h-full theme-card-glow opacity-0 animate-fade-in-up"
                    style={{ animationDelay: `${cardIndex * 50}ms` }}>
                    {/* Group color stripe */}
                    <div className="h-1 shrink-0" style={{ backgroundColor: GROUP_COLORS[colorKey] || "#ccc" }}></div>
                    {/* Top Header details */}
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

                      {/* Case Name & Group */}
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

                      {/* Visual Cube Representation Container */}
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
                                  getF2LView(llCase.id) === slot
                                    ? "theme-btn-primary"
                                    : "theme-btn-ghost"
                                }`}
                              >
                                {label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Study details & Setup Scramble */}
                      <div className="p-4 flex-1 flex flex-col justify-between gap-4">

                        {/* Scramble Setup display */}
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

                        {/* Best / Solve Speeds if available */}
                        {caseStats.count > 0 && (
                          <div className="pt-2 border-t theme-border-main flex items-center justify-between text-[10px] font-bold font-mono uppercase theme-muted-text">
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
        ) : (
          /* ========================================================= */
          /* VIEW 2: INTERACTIVE ACTIVE TRAINER (QUIZ & STOPWATCH)    */
          /* ========================================================= */
          <div id="trainer-view-section" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-12 flex justify-end">
              <TimerSettingsPopover settings={timerSettings} onChange={updateTimerSettings} />
            </div>
            <div className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
              <TrainerControls
                groups={groups}
                trainerGroups={trainerGroups}
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
                timerPhase={timerPhase}
                timerTime={timerTime}
                inspectionLeft={inspectionLeft}
                pendingPenalty={pendingPenalty}
                timerSettings={timerSettings}
                formatTime={formatTime}
                getScramble={getScramble}
                onNewScramble={(id) => { handleGenerate(id); resetTimerPhase(); beginInspection(); }}
                onCopyScramble={handleCopyTrainer}
                onPressStart={pressTimer}
                onReleaseStart={releaseTimer}
                onResetTimer={handleResetTimer}
                onReveal={() => setTrainerReveal(true)}
                onMastered={() => handleTrainerResult("Mastered")}
                onNeedsPractice={() => handleTrainerResult("Learning")}
                onEnlarge={(id) => setEnlargedImageId(id)}
                onTogglePenalty={(p) => setPendingPenalty(p)}
              />
              <SessionPanel
                sessions={sessionsForCaseType}
                activeSessionId={activeSessionId}
                timerSettings={timerSettings}
                onSelectSession={setActiveSessionId}
                onCreateSession={createSession}
                onDeleteSession={deleteSession}
                onTogglePin={togglePinSession}
                onRenameSession={renameSession}
                onDeleteSolve={deleteSolve}
                onSetPenalty={setSolvePenalty}
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
