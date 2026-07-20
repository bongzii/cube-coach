import { useState, useRef, useCallback, useEffect } from "react";
import { beepStart, beepStop, beepInspection } from "./audio";

export type TimerState = "idle" | "inspecting" | "holding" | "ready" | "running";

export interface TimerSettings {
  inspection: boolean;
  holdTime: number; // ms
}

export const DEFAULT_SETTINGS: TimerSettings = { inspection: true, holdTime: 300 };

export function useTimer(settings: TimerSettings) {
  const [state, setState] = useState<TimerState>("idle");
  const [elapsed, setElapsed] = useState(0); // running solve elapsed (ms)
  const [inspectionTime, setInspectionTime] = useState(0); // 0–17+ seconds

  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickRef = useRef<number | null>(null);
  const startTimeRef = useRef(0);
  const inspectionStartRef = useRef(0);
  const stateRef = useRef<TimerState>("idle");
  const heldRef = useRef(false);

  // keep stateRef in sync
  useEffect(() => { stateRef.current = state; }, [state]);

  const clearTick = () => { if (tickRef.current) { cancelAnimationFrame(tickRef.current); tickRef.current = null; } };
  const clearHold = () => { if (holdTimer.current) { clearTimeout(holdTimer.current); holdTimer.current = null; } };

  const tickRunning = useCallback(() => {
    setElapsed(Date.now() - startTimeRef.current);
    tickRef.current = requestAnimationFrame(tickRunning);
  }, []);

  const tickInspection = useCallback(() => {
    const s = (Date.now() - inspectionStartRef.current) / 1000;
    setInspectionTime(s);
    if (s >= 17) {
      setInspectionTime(17);
      setState("idle");
      clearTick();
      return; // DNF
    }
    if (s >= 8 || s >= 12 || s >= 15) {
      const whole = Math.floor(s);
      // beep at boundaries
      const key = whole >= 15 ? 15 : whole >= 12 ? 12 : 8;
      beepInspection(key);
    }
    tickRef.current = requestAnimationFrame(tickInspection);
  }, []);

  const startRun = useCallback(() => {
    setState("running");
    setElapsed(0);
    startTimeRef.current = Date.now();
    tickRunning();
    beepStart();
  }, [tickRunning]);

  const startInspection = useCallback(() => {
    setState("inspecting");
    setInspectionTime(0);
    inspectionStartRef.current = Date.now();
    tickInspection();
  }, [tickInspection]);

  const stopRun = useCallback(() => {
    const finalElapsed = Date.now() - startTimeRef.current;
    setElapsed(finalElapsed);
    clearTick();
    setState("idle");
    beepStop();
    return finalElapsed;
  }, []);

  // pointer + space handlers
  const handleDown = useCallback(() => {
    if (stateRef.current === "running") {
      // stop
      stopRun();
      return;
    }
    if (stateRef.current === "inspecting") {
      // during inspection: start holding
      heldRef.current = false;
      clearHold();
      holdTimer.current = setTimeout(() => {
        heldRef.current = true;
        setState("ready");
      }, settings.holdTime);
      return;
    }
    if (stateRef.current === "idle") {
      heldRef.current = false;
      clearHold();
      if (settings.inspection) {
        startInspection();
        // immediately start holding within inspection
        holdTimer.current = setTimeout(() => {
          heldRef.current = true;
          setState("ready");
        }, settings.holdTime);
      } else {
        // no inspection: hold-to-start directly
        setState("holding");
        holdTimer.current = setTimeout(() => {
          heldRef.current = true;
          setState("ready");
        }, settings.holdTime);
      }
    }
  }, [settings, startInspection, stopRun]);

  const handleUp = useCallback(() => {
    clearHold();
    if (stateRef.current === "ready" && heldRef.current) {
      heldRef.current = false;
      startRun();
      return;
    }
    if (stateRef.current === "holding") {
      // released before holdTime — cancel
      setState("idle");
    }
    if (stateRef.current === "inspecting") {
      // released during inspection — reset hold but stay inspecting
      heldRef.current = false;
    }
  }, [startRun]);

  // spacebar support
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code !== "Space" || e.repeat) return;
      e.preventDefault();
      handleDown();
    };
    const up = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      e.preventDefault();
      handleUp();
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, [handleDown, handleUp]);

  // cleanup
  useEffect(() => () => { clearTick(); clearHold(); }, []);

  const reset = useCallback(() => {
    clearTick();
    clearHold();
    setState("idle");
    setElapsed(0);
    setInspectionTime(0);
    heldRef.current = false;
  }, []);

  return { state, elapsed, inspectionTime, handleDown, handleUp, reset, stopRun };
}
