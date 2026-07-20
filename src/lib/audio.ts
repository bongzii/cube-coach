let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

function beep(freq: number, duration: number, vol = 0.15) {
  const c = getCtx();
  const o = c.createOscillator();
  const g = c.createGain();
  o.connect(g);
  g.connect(c.destination);
  o.frequency.value = freq;
  g.gain.value = vol;
  o.start(c.currentTime);
  o.stop(c.currentTime + duration);
}

export function beepInspection(n: number) {
  // 8s = one beep, 12s = two fast beeps, 15s+ = penalty beeps
  if (n >= 15) { beep(440, 0.15); setTimeout(() => beep(440, 0.15), 200); }
  else if (n >= 12) { beep(600, 0.1); setTimeout(() => beep(600, 0.1), 120); }
  else if (n === 8) beep(800, 0.08);
}

export function beepStart() { beep(1200, 0.06, 0.1); }
export function beepStop() { beep(1000, 0.08, 0.12); }
