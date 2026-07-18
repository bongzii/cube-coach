export type CaseType = "oll" | "pll" | "f2l";

export type Penalty = "none" | "+2" | "DNF";

export type TimerPhase = "idle" | "holding" | "ready" | "inspection" | "running";

export interface Solve {
  id: string;
  caseId: number;
  caseType: CaseType;
  caseName: string;
  /** Seconds. null when DNF. */
  time: number | null;
  penalty: Penalty;
  /** Epoch ms. */
  date: number;
  scramble: string;
}

export type SessionType = "standard" | "comp" | "playground";

export interface Session {
  id: string;
  name: string;
  type: SessionType;
  pinned: boolean;
  caseType: CaseType;
  createdAt: number;
  solves: Solve[];
}

export interface TimerSettings {
  /** ms the user must hold before the timer turns green / ready. */
  holdMs: number;
  inspectionOn: boolean;
  inspectionSec: number;
  alertsOn: boolean;
  /** decimal places shown for times. */
  precision: number;
}

export const DEFAULT_TIMER_SETTINGS: TimerSettings = {
  holdMs: 300,
  inspectionOn: true,
  inspectionSec: 15,
  alertsOn: true,
  precision: 2,
};

export const SESSION_TYPE_LABELS: Record<SessionType, string> = {
  standard: "Standard",
  comp: "Comp Sim",
  playground: "Playground",
};
