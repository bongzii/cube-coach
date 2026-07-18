let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  return ctx;
}

/** Play a short beep. freq in Hz, duration in seconds. */
export function beep(freq = 880, duration = 0.12, volume = 0.2): void {
  const c = getCtx();
  if (!c) return;
  if (c.state === "suspended") c.resume().catch(() => {});
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(volume, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + duration);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + duration);
}

/** Distinct alert tones used during inspection. */
export const InspectionAlerts = {
  /** 8-second warning. */
  warn: () => beep(660, 0.1),
  /** 12-second final warning. */
  final: () => beep(880, 0.1),
  /** Inspection expired (0s). */
  expired: () => beep(330, 0.25),
  /** Solve started. */
  start: () => beep(990, 0.06, 0.15),
};
