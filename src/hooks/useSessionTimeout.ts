import { useEffect, useRef, useCallback, useState } from "react";
import { useAuth } from "../context/AuthContext";

const INACTIVITY_LIMIT = 15 * 60 * 1000;
const WARNING_BEFORE = 60 * 1000;
const CHECK_INTERVAL = 5 * 1000;

export function useSessionTimeout() {
  const { token, logout } = useAuth();
  const lastActivity = useRef(Date.now());
  const [showWarning, setShowWarning] = useState(false);
  const warnedRef = useRef(false);

  const resetTimer = useCallback(() => {
    lastActivity.current = Date.now();
    warnedRef.current = false;
    if (showWarning) setShowWarning(false);
  }, [showWarning]);

  useEffect(() => {
    if (!token) return;

    const events = ["mousemove", "mousedown", "click", "keydown", "scroll", "touchstart"];
    events.forEach((ev) => window.addEventListener(ev, resetTimer, { passive: true }));

    const interval = setInterval(() => {
      const elapsed = Date.now() - lastActivity.current;

      if (elapsed >= INACTIVITY_LIMIT) {
        logout();
        return;
      }

      if (elapsed >= INACTIVITY_LIMIT - WARNING_BEFORE && !warnedRef.current) {
        warnedRef.current = true;
        setShowWarning(true);
      }
    }, CHECK_INTERVAL);

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, resetTimer));
      clearInterval(interval);
    };
  }, [token, logout, resetTimer]);

  const extendSession = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  return { showWarning, extendSession, logout };
}
