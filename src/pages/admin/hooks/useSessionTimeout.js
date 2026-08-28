import { useState, useEffect, useCallback, useRef } from 'react';
import { logout } from '../../../lib/cms';

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const WARNING_BEFORE_EXPIRY_MS = 2 * 60 * 1000; // 2 minutes warning before auto logout
const ABSOLUTE_MAX_SESSION_MS = 8 * 60 * 60 * 1000; // 8 hours absolute max

export const useSessionTimeout = (user, onSessionExpired) => {
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(120);
  
  const lastActivityRef = useRef(Date.now());
  const warningTimerRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const logoutTimerRef = useRef(null);
  const absoluteTimerRef = useRef(null);

  const performLogout = useCallback(async (reason = 'inactivity') => {
    setIsWarningOpen(false);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    if (absoluteTimerRef.current) clearTimeout(absoluteTimerRef.current);
    
    sessionStorage.removeItem('admin_session_start');
    try {
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
    if (onSessionExpired) {
      onSessionExpired(reason);
    }
  }, [onSessionExpired]);

  const resetInactivityTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    setIsWarningOpen(false);
    
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);

    if (!user) return;

    // Timer until the warning modal pops up (28 minutes of inactivity)
    warningTimerRef.current = setTimeout(() => {
      setIsWarningOpen(true);
      setRemainingSeconds(Math.floor(WARNING_BEFORE_EXPIRY_MS / 1000));
      
      countdownIntervalRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(countdownIntervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, INACTIVITY_TIMEOUT_MS - WARNING_BEFORE_EXPIRY_MS);

    // Hard auto-logout at 30 minutes
    logoutTimerRef.current = setTimeout(() => {
      performLogout('inactivity');
    }, INACTIVITY_TIMEOUT_MS);
  }, [user, performLogout]);

  useEffect(() => {
    if (!user) {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
      if (absoluteTimerRef.current) clearTimeout(absoluteTimerRef.current);
      setIsWarningOpen(false);
      return;
    }

    // Set absolute max session timer (e.g. 8 hours)
    let sessionStart = sessionStorage.getItem('admin_session_start');
    if (!sessionStart) {
      sessionStart = Date.now().toString();
      sessionStorage.setItem('admin_session_start', sessionStart);
    }
    const elapsed = Date.now() - parseInt(sessionStart, 10);
    const maxRemaining = Math.max(ABSOLUTE_MAX_SESSION_MS - elapsed, 1000);

    absoluteTimerRef.current = setTimeout(() => {
      performLogout('max_session');
    }, maxRemaining);

    // Activity event listeners
    const events = ['mousedown', 'mousemove', 'keydown', 'touchstart', 'scroll'];
    const handleUserActivity = () => {
      // Throttle activity resets to every 30 seconds to prevent unnecessary timer re-creations
      if (Date.now() - lastActivityRef.current > 30000) {
        resetInactivityTimer();
      }
    };

    events.forEach((ev) => window.addEventListener(ev, handleUserActivity, { passive: true }));
    resetInactivityTimer();

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, handleUserActivity));
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
      if (absoluteTimerRef.current) clearTimeout(absoluteTimerRef.current);
    };
  }, [user, resetInactivityTimer, performLogout]);

  return {
    isWarningOpen,
    remainingSeconds,
    staySignedIn: resetInactivityTimer,
    signOutNow: () => performLogout('manual'),
  };
};
