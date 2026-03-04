import { useState, useEffect, useCallback, useRef } from "react";

const STORAGE_KEY = "fitwise_timer";

function loadFromStorage() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveToStorage(state) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // silent
  }
}

function clearStorage() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // silent
  }
}

export function useAccurateTimer() {
  const saved = loadFromStorage();

  const [isRunning, setIsRunning] = useState(saved?.isRunning || false);
  const [startTime, setStartTime] = useState(saved?.startTime || 0);
  const [accumulatedTime, setAccumulatedTime] = useState(
    saved?.accumulatedTime || 0,
  );
  const [displayMs, setDisplayMs] = useState(0);
  const intervalRef = useRef(null);

  // Calculate current elapsed
  const getElapsed = useCallback(() => {
    if (!isRunning || !startTime) return accumulatedTime;
    return Date.now() - startTime + accumulatedTime;
  }, [isRunning, startTime, accumulatedTime]);

  // Tick loop — always based on system clock
  useEffect(() => {
    if (isRunning) {
      const tick = () => setDisplayMs(getElapsed());
      tick(); // immediate first tick
      intervalRef.current = setInterval(tick, 100);
      return () => clearInterval(intervalRef.current);
    } else {
      setDisplayMs(accumulatedTime);
    }
  }, [isRunning, getElapsed, accumulatedTime]);

  // Persist to sessionStorage whenever state changes
  useEffect(() => {
    if (isRunning || accumulatedTime > 0) {
      saveToStorage({ isRunning, startTime, accumulatedTime });
    }
  }, [isRunning, startTime, accumulatedTime]);

  const start = useCallback(() => {
    setStartTime(Date.now());
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    if (!isRunning) return;
    const elapsed = Date.now() - startTime + accumulatedTime;
    setAccumulatedTime(elapsed);
    setStartTime(0);
    setIsRunning(false);
  }, [isRunning, startTime, accumulatedTime]);

  const resume = useCallback(() => {
    setStartTime(Date.now());
    setIsRunning(true);
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setStartTime(0);
    setAccumulatedTime(0);
    setDisplayMs(0);
    clearStorage();
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  // Format milliseconds to HH:MM:SS
  const totalSeconds = Math.floor(displayMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const formatted = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return {
    isRunning,
    displayMs,
    totalSeconds,
    minutes: Math.floor(totalSeconds / 60),
    formatted,
    start,
    pause,
    resume,
    reset,
  };
}
