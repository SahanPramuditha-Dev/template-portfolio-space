const BOT_USER_AGENT_PATTERN =
  /bot|crawler|spider|googlebot|google-inspectiontool|googleother|bingbot|duckduckbot|baiduspider|yandex|slurp|facebookexternalhit|twitterbot|linkedinbot|applebot/i;

export const isBotUserAgent = () => {
  if (typeof navigator === 'undefined') return false;
  return BOT_USER_AGENT_PATTERN.test(navigator.userAgent || '');
};

export const supportsWebGL = () => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return true;
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl');
    return Boolean(gl);
  } catch {
    return false;
  }
};

export const shouldDisableHeavyVisuals = () => {
  if (typeof window === 'undefined') return false;

  const visualMode = window.localStorage.getItem('visualMode');
  if (visualMode === 'lite') return true;
  if (visualMode === 'full') return false;

  const prefersReducedMotion =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = typeof navigator !== 'undefined' && Boolean(navigator.connection?.saveData);
  const lowMemory =
    typeof navigator !== 'undefined' &&
    typeof navigator.deviceMemory === 'number' &&
    navigator.deviceMemory <= 4;

  return isBotUserAgent() || prefersReducedMotion || saveData || lowMemory || !supportsWebGL();
};

export const getVisualModePreference = () => {
  if (typeof window === 'undefined') return 'auto';
  return window.localStorage.getItem('visualMode') || 'auto';
};

export const setVisualModePreference = (mode) => {
  if (typeof window === 'undefined') return;
  if (mode === 'auto') {
    window.localStorage.removeItem('visualMode');
  } else {
    window.localStorage.setItem('visualMode', mode);
  }
  window.dispatchEvent(new CustomEvent('visual-mode-change', { detail: { mode } }));
};

