import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, doc, setDoc, increment } from 'firebase/firestore';

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

// Cache geolocation lookup in sessionStorage to prevent redundant API hits
let cachedGeo = null;
if (typeof window !== 'undefined') {
  try {
    const saved = window.sessionStorage.getItem('analytics_geo');
    if (saved) cachedGeo = JSON.parse(saved);
  } catch {
    // Ignore cache error
  }
}

const getGeoLocation = async () => {
  if (cachedGeo) return cachedGeo;
  try {
    const res = await fetch('https://ipapi.co/json/');
    if (res.ok) {
      const data = await res.json();
      const info = {
        country: data.country_name || 'Unknown',
        countryCode: data.country_code || 'UN',
        city: data.city || 'Unknown',
      };
      cachedGeo = info;
      window.sessionStorage.setItem('analytics_geo', JSON.stringify(info));
      return info;
    }
  } catch {
    // Ignore API failures
  }
  return { country: 'Unknown', countryCode: 'UN', city: 'Unknown' };
};

// Analytics utility - can be integrated with Google Analytics, Plausible, etc.
export const trackEvent = async (eventName, eventData = {}) => {
  const geo = await getGeoLocation();

  // Save to Firebase Firestore collection analyticsEvents
  addDoc(collection(db, 'analyticsEvents'), {
    eventName,
    eventData: {
      ...eventData,
      country: geo.country,
      countryCode: geo.countryCode,
      city: geo.city,
    },
    timestamp: serverTimestamp(),
    sessionId,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    referrer: typeof document !== 'undefined' ? document.referrer : '',
  }).catch(() => {
    // Fail silently in background
  });

  // If tracking a page view, increment the public views counter
  if (eventName === 'page_view') {
    setDoc(doc(db, 'site', 'public'), {
      stats: {
        views: increment(1)
      }
    }, { merge: true }).catch((err) => {
      console.error('Failed to increment public stats views:', err);
    });
  }

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
