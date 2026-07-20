export type Penalty = "none" | "plustwo" | "dnf";

export interface Solve {
  id: string;
  time: number; // ms
  penalty: Penalty;
  scramble: string;
  ts: number;
}

export function effectiveTime(s: Solve): number {
  if (s.penalty === "dnf") return Infinity;
  return s.time + (s.penalty === "plustwo" ? 2000 : 0);
}

export function formatTime(ms: number): string {
  if (!isFinite(ms)) return "DNF";
  if (ms < 0) return "0.00";
  const s = ms / 1000;
  if (s >= 60) {
    const m = Math.floor(s / 60);
    const rem = s - m * 60;
    return `${m}:${rem < 10 ? "0" : ""}${rem.toFixed(2)}`;
  }
  return s < 10 ? s.toFixed(2) : s.toFixed(2);
}

function trimmedMean(times: number[], trim: number): number {
  if (times.length < trim * 2 + 1) return Infinity;
  const sorted = [...times].sort((a, b) => a - b);
  const trimmed = sorted.slice(trim, sorted.length - trim);
  return trimmed.reduce((a, b) => a + b, 0) / trimmed.length;
}

export interface Stats {
  count: number;
  best: number;
  mean: number;
  ao5: number;
  ao12: number;
  ao100: number;
}

export function computeStats(solves: Solve[]): Stats {
  const times = solves.map(effectiveTime);
  const finite = times.filter(isFinite);
  const count = solves.length;
  const best = finite.length > 0 ? Math.min(...finite) : Infinity;
  const mean = finite.length > 0 ? finite.reduce((a, b) => a + b, 0) / finite.length : Infinity;

  // for AoX, each window must not contain DNF
  function aoX(x: number): number {
    if (count < x) return Infinity;
    let best = Infinity;
    for (let i = 0; i <= count - x; i++) {
      const window = times.slice(i, i + x);
      if (window.some((t) => !isFinite(t))) continue;
      const trimmed = trimmedMean(window, 1);
      if (trimmed < best) best = trimmed;
    }
    return best;
  }

  return { count, best, mean, ao5: aoX(5), ao12: aoX(12), ao100: aoX(100) };
}
