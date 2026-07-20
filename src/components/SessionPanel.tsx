import { useState } from "react";
import { Penalty, Session, SessionType, TimerSettings, SESSION_TYPE_LABELS } from "../types";
import { computeSessionStats, formatSeconds, formatSolveTime } from "../lib/stats";

interface SessionPanelProps {
  sessions: Session[];
  activeSessionId: string | null;
  timerSettings: TimerSettings;
  onSelectSession: (id: string) => void;
  onCreateSession: (name: string, type: SessionType) => void;
  onDeleteSession: (id: string) => void;
  onTogglePin: (id: string) => void;
  onRenameSession: (id: string, name: string) => void;
  onDeleteSolve: (sessionId: string, solveId: string) => void;
  onSetPenalty: (sessionId: string, solveId: string, penalty: Penalty) => void;
}

export default function SessionPanel({
  sessions,
  activeSessionId,
  timerSettings,
  onSelectSession,
  onCreateSession,
  onDeleteSession,
  onTogglePin,
  onRenameSession,
  onDeleteSolve,
  onSetPenalty,
}: SessionPanelProps) {
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<SessionType>("standard");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const active = sessions.find(s => s.id === activeSessionId) ?? null;
  const sortedSessions = [...sessions].sort((a, b) => Number(b.pinned) - Number(a.pinned) || a.createdAt - b.createdAt);

  const stats = active ? computeSessionStats(active.solves) : null;

  const statCard = (label: string, value: string | null) => (
    <div className="flex-1 min-w-[80px] theme-control-surface border-2 theme-border-main theme-shadow-tiny rounded-xl p-3 text-center">
      <div className="text-[10px] font-black uppercase theme-muted-text">{label}</div>
      <div className="text-lg font-display font-black theme-card-text">{value ?? "—"}</div>
    </div>
  );

  return (
    <div className="theme-card border-2 theme-border-main theme-shadow-small rounded-3xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-black uppercase font-display theme-card-text tracking-tighter">Sessions</h2>
        <span className="text-xs font-bold theme-muted-text">{sessions.length} total</span>
      </div>

      {/* Session tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {sortedSessions.map(s => (
          <div
            key={s.id}
            className={`group flex items-center gap-1 px-3 py-1.5 rounded-xl border-2 font-black text-xs uppercase cursor-pointer transition-all active:scale-95 ${
              s.id === activeSessionId
                ? "theme-btn-primary theme-shadow-tiny"
                : "theme-btn-ghost border-2 theme-border-main"
            }`}
            onClick={() => onSelectSession(s.id)}
            onDoubleClick={() => { setEditingId(s.id); setEditingName(s.name); }}
          >
            <span>{s.pinned ? "📌 " : ""}{editingId === s.id ? null : s.name}</span>
            {editingId === s.id ? (
              <input
                autoFocus
                value={editingName}
                onChange={e => setEditingName(e.target.value)}
                onBlur={() => { onRenameSession(s.id, editingName.trim() || s.name); setEditingId(null); }}
                onKeyDown={e => { if (e.key === "Enter") { onRenameSession(s.id, editingName.trim() || s.name); setEditingId(null); } }}
                className="w-24 theme-input border border-gray-300 rounded px-1 text-xs"
                onClick={e => e.stopPropagation()}
              />
            ) : null}
            <button
              className="ml-1 text-xs opacity-60 hover:opacity-100"
              title="Pin"
              onClick={e => { e.stopPropagation(); onTogglePin(s.id); }}
            >📌</button>
            <button
              className="text-xs opacity-60 hover:opacity-100"
              title="Delete session"
              onClick={e => { e.stopPropagation(); if (confirm("Delete session and all its solves?")) onDeleteSession(s.id); }}
            >✕</button>
          </div>
        ))}
      </div>

      {/* Create new session */}
      <div className="flex flex-wrap gap-2 items-center mb-5">
        <input
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="New session name"
          className="flex-1 min-w-[140px] theme-input border-2 theme-border-main rounded-xl px-3 py-1.5 text-sm"
        />
        <select
          value={newType}
          onChange={e => setNewType(e.target.value as SessionType)}
          className="theme-input border-2 theme-border-main rounded-xl px-2 py-1.5 text-sm"
        >
          {(Object.keys(SESSION_TYPE_LABELS) as SessionType[]).map(t => (
            <option key={t} value={t}>{SESSION_TYPE_LABELS[t]}</option>
          ))}
        </select>
        <button
          onClick={() => { onCreateSession(newName.trim(), newType); setNewName(""); }}
          className="px-3 py-1.5 rounded-xl font-black text-xs uppercase bg-green-600 text-white border-2 theme-border-main theme-shadow-tiny active:scale-95"
        >+ Add</button>
      </div>

      {active && stats ? (
        <>
          <div className="flex flex-wrap gap-2 mb-4">
            {statCard("Count", String(stats.count))}
            {statCard("Best", stats.best !== null ? formatSeconds(stats.best, timerSettings.precision) : null)}
            {statCard("Mean", stats.mean !== null ? formatSeconds(stats.mean, timerSettings.precision) : null)}
            {statCard("Ao5", stats.ao5 !== null ? formatSeconds(stats.ao5, timerSettings.precision) : null)}
            {statCard("Ao12", stats.ao12 !== null ? formatSeconds(stats.ao12, timerSettings.precision) : null)}
            {statCard("Ao100", stats.ao100 !== null ? formatSeconds(stats.ao100, timerSettings.precision) : null)}
          </div>

          <h3 className="text-sm font-black uppercase mb-2 theme-card-text">Solves ({active.solves.length})</h3>
          <div className="max-h-80 overflow-y-auto flex flex-col gap-1.5 pr-1">
            {active.solves.length === 0 ? (
              <p className="text-xs theme-muted-text">No solves yet. Use the timer above to record one.</p>
            ) : active.solves.map(sv => {
              return (
                <div key={sv.id} className="flex items-center justify-between theme-control-surface border-2 theme-border-main rounded-xl px-3 py-2">
                  <div className="flex flex-col">
                    <span className={`font-display font-black text-sm ${sv.penalty === "DNF" ? "text-red-600" : "theme-card-text"}`}>
                      {formatSolveTime(sv, timerSettings.precision)}
                      {sv.penalty !== "none" && <span className="ml-1 text-xs text-red-600">{sv.penalty}</span>}
                    </span>
                    <span className="text-[10px] theme-muted-text truncate max-w-[180px]">{sv.caseName} · {sv.scramble}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      title="No penalty"
                      className={`text-[10px] px-1.5 rounded border ${sv.penalty === "none" ? "bg-blue-600 text-white border-blue-600" : "theme-btn-ghost border-2 theme-border-main"}`}
                      onClick={() => onSetPenalty(active.id, sv.id, "none")}
                    >OK</button>
                    <button
                      title="+2"
                      className={`text-[10px] px-1.5 rounded border ${sv.penalty === "+2" ? "bg-yellow-500 text-black border-yellow-500" : "theme-btn-ghost border-2 theme-border-main"}`}
                      onClick={() => onSetPenalty(active.id, sv.id, "+2")}
                    >+2</button>
                    <button
                      title="DNF"
                      className={`text-[10px] px-1.5 rounded border ${sv.penalty === "DNF" ? "bg-red-600 text-white border-red-600" : "theme-btn-ghost border-2 theme-border-main"}`}
                      onClick={() => onSetPenalty(active.id, sv.id, "DNF")}
                    >DNF</button>
                    <button
                      className="text-[10px] px-1.5 rounded border theme-btn-ghost border-2 theme-border-main"
                      title="Delete solve"
                      onClick={() => onDeleteSolve(active.id, sv.id)}
                    >✕</button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <p className="text-xs theme-muted-text">Select or create a session to view stats and solves.</p>
      )}
    </div>
  );
}
