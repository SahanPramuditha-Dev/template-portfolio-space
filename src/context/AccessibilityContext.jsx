/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

const AccessibilityContext = createContext();

export const AccessibilityProvider = ({ children }) => {
  const [reduceMotion, setReduceMotion] = useState(() => {
    if (typeof window === 'undefined') return false;
    const stored = window.localStorage.getItem('a11y_reduce_motion');
    if (stored !== null) return stored === 'true';
    // Fallback to system preference
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  const [highContrast, setHighContrast] = useState(() => {
    if (typeof window === 'undefined') return false;
    const stored = window.localStorage.getItem('a11y_high_contrast');
    return stored === 'true';
  });

  const [textSize, setTextSize] = useState(() => {
    if (typeof window === 'undefined') return 1.0;
    const stored = window.localStorage.getItem('a11y_text_size');
    return stored ? parseFloat(stored) : 1.0;
  });

  // Apply visual settings to document element
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;

    // Apply reduceMotion
    if (reduceMotion) {
      root.classList.add('motion-reduce');
      window.localStorage.setItem('a11y_reduce_motion', 'true');
    } else {
      root.classList.remove('motion-reduce');
      window.localStorage.setItem('a11y_reduce_motion', 'false');
    }

    // Apply highContrast
    if (highContrast) {
      root.classList.add('high-contrast');
      window.localStorage.setItem('a11y_high_contrast', 'true');
    } else {
      root.classList.remove('high-contrast');
      window.localStorage.setItem('a11y_high_contrast', 'false');
    }

    // Apply textSize scaling (base font size scaling)
    root.style.fontSize = `${textSize * 100}%`;
    window.localStorage.setItem('a11y_text_size', String(textSize));

    // Dispatch event to notify Three.js components and other listeners
    window.dispatchEvent(new Event('visual-mode-change'));
  }, [reduceMotion, highContrast, textSize]);

  const toggleReduceMotion = useCallback(() => {
    setReduceMotion((prev) => !prev);
  }, []);

  const toggleHighContrast = useCallback(() => {
    setHighContrast((prev) => !prev);
  }, []);

  const changeTextSize = useCallback((size) => {
    setTextSize(size);
  }, []);

  return (
    <AccessibilityContext.Provider
      value={{
        reduceMotion,
        highContrast,
        textSize,
        toggleReduceMotion,
        toggleHighContrast,
        changeTextSize,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => useContext(AccessibilityContext);
