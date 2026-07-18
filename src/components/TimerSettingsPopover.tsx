import { useState } from "react";
import { Settings } from "lucide-react";
import type { TimerSettings } from "../types";

interface TimerSettingsPopoverProps {
  settings: TimerSettings;
  onChange: (next: TimerSettings) => void;
}

export default function TimerSettingsPopover({ settings, onChange }: TimerSettingsPopoverProps) {
  const [open, setOpen] = useState(false);

  const update = (patch: Partial<TimerSettings>) => onChange({ ...settings, ...patch });

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-3 py-2 theme-control-surface border-2 theme-border-main rounded-xl font-black text-xs uppercase theme-shadow-small active:scale-95"
        title="Timer settings"
      >
        <Settings className="w-4 h-4" />
        Timer
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-72 max-w-[calc(100vw-1rem)] theme-card border-2 theme-border-main rounded-2xl p-4 theme-shadow-main">
          <h4 className="font-display font-black uppercase text-sm mb-3 theme-card-text">Timer Settings</h4>

          <label className="flex items-center justify-between text-xs font-black uppercase mb-2">
            <span>Inspection</span>
            <input
              type="checkbox"
              checked={settings.inspectionOn}
              onChange={e => update({ inspectionOn: e.target.checked })}
              className="w-4 h-4"
            />
          </label>

          <label className="flex items-center justify-between text-xs font-black uppercase mb-2">
            <span>Alerts</span>
            <input
              type="checkbox"
              checked={settings.alertsOn}
              onChange={e => update({ alertsOn: e.target.checked })}
              className="w-4 h-4"
            />
          </label>

          <label className="flex items-center justify-between gap-2 text-xs font-black uppercase mb-2">
            <span>Inspect (s)</span>
            <input
              type="number"
              min={0}
              max={30}
              value={settings.inspectionSec}
              disabled={!settings.inspectionOn}
              onChange={e => update({ inspectionSec: Math.max(0, Math.min(30, Number(e.target.value))) })}
              className="w-16 theme-input border-2 theme-border-main rounded px-2 py-1"
            />
          </label>

          <label className="flex items-center justify-between gap-2 text-xs font-black uppercase mb-2">
            <span>Hold (ms)</span>
            <input
              type="number"
              min={0}
              max={1000}
              step={50}
              value={settings.holdMs}
              onChange={e => update({ holdMs: Math.max(0, Math.min(1000, Number(e.target.value))) })}
              className="w-16 theme-input border-2 theme-border-main rounded px-2 py-1"
            />
          </label>

          <label className="flex items-center justify-between gap-2 text-xs font-black uppercase">
            <span>Precision</span>
            <select
              value={settings.precision}
              onChange={e => update({ precision: Number(e.target.value) })}
              className="theme-input border-2 theme-border-main rounded px-2 py-1"
            >
              {[1, 2, 3].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </label>
        </div>
      )}
    </div>
  );
}
