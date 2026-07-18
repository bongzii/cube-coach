import type { Solve, Penalty } from "../types";

/** Effective time in seconds for a solve (DNF -> Infinity, +2 adds 2s). */
export function effectiveTime(s: Solve): number {
  if (s.penalty === "DNF" || s.time === null) return Infinity;
  return s.time + (s.penalty === "+2" ? 2 : 0);
}

export function isDNF(s: Solve): boolean {
  return s.penalty === "DNF" || s.time === null;
}

function trimmedAverage(times: number[], dropBest: number, dropWorst: number): number | null {
  if (times.length === 0) return null;
  const sorted = [...times].sort((a, b) => a - b);
  const usable = sorted.slice(dropBest, sorted.length - dropWorst);
  if (usable.length === 0) return null;
  if (usable.some((t) => !isFinite(t))) return null;
  const sum = usable.reduce((a, b) => a + b, 0);
  return sum / usable.length;
}

export interface SessionStats {
  count: number;
  best: number | null;
  mean: number | null;
  ao5: number | null;
  ao12: number | null;
  ao100: number | null;
}

export function computeSessionStats(solves: Solve[]): SessionStats {
  const times = solves.map(effectiveTime);
  const count = solves.length;

  const finite = times.filter((t) => isFinite(t));
  const best = finite.length > 0 ? Math.min(...finite) : null;
  const mean =
    finite.length > 0 ? finite.reduce((a, b) => a + b, 0) / finite.length : null;

  // AoN computed from the last N solves (rolling, newest last).
  const lastN = (n: number, dropBest: number, dropWorst: number) =>
    times.length >= n ? trimmedAverage(times.slice(times.length - n), dropBest, dropWorst) : null;

  return {
    count,
    best,
    mean,
    ao5: lastN(5, 1, 1),
    ao12: lastN(12, 1, 1),
    ao100: lastN(100, 3, 3),
  };
}

export function formatSolveTime(s: Solve, precision = 2): string {
  if (isDNF(s)) return "DNF";
  const t = effectiveTime(s);
  return t.toFixed(precision) + "s";
}

/** Format a raw seconds value to a fixed-precision string. */
export function formatSeconds(sec: number, precision = 2): string {
  if (!isFinite(sec)) return "DNF";
  return sec.toFixed(precision) + "s";
}

export function penaltyLabel(p: Penalty): string {
  return p === "none" ? "" : p;
}
