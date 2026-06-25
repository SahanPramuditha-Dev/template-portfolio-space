import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const generateSessionId = () => {
  if (typeof window === 'undefined') return '';
  let id = window.sessionStorage.getItem('analytics_session_id');
  if (!id) {
    id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    window.sessionStorage.setItem('analytics_session_id', id);
  }
  return id;
};

const sessionId = generateSessionId();

// Analytics utility - can be integrated with Google Analytics, Plausible, etc.
export const trackEvent = (eventName, eventData = {}) => {
  // Only track in production (or if locally enabled for testing, let's keep VITE_ANALYTICS_ENDPOINT or simple checks)
  // Let's log in dev if we want to test, but let's keep a toggle or just run in production by default.
  // Wait, let's allow it in development too if the user wants, or let's run it always so the user can test locally!
  // Yes! Let's run it always so that local testing writes events and the user can see them in their admin dashboard!

  // Save to Firebase Firestore collection analyticsEvents
    addDoc(collection(db, 'analyticsEvents'), {
      eventName,
      eventData,
      timestamp: serverTimestamp(),
      sessionId,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      referrer: typeof document !== 'undefined' ? document.referrer : '',
    }).catch(() => {
      // Fail silently in background
    });

  // Google Analytics 4
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, eventData);
  }

  // Plausible Analytics
  if (typeof window !== 'undefined' && window.plausible) {
    window.plausible(eventName, { props: eventData });
  }

  // Custom analytics endpoint (if you have one)
  if (import.meta.env.VITE_ANALYTICS_ENDPOINT) {
    fetch(import.meta.env.VITE_ANALYTICS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: eventName, data: eventData }),
    }).catch(() => {}); // Silently fail
  }
};

export const trackPageView = (path) => {
  trackEvent('page_view', { path });
};

export const trackScrollDepth = (path, depth) => {
  trackEvent('scroll_depth', { path, depth });
};

export const trackProjectView = (projectTitle) => {
  trackEvent('project_view', { project_title: projectTitle });
};

export const trackContactSubmit = (success) => {
  trackEvent('contact_submit', { success });
};

export const trackDownload = (fileType) => {
  trackEvent('download', { file_type: fileType });
};

export const trackSocialClick = (platform) => {
  trackEvent('social_click', { platform });
};
