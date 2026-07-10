import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore, clearIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyD2jARZLL75tRWQ5_gOZ71nLkQXF7tek3Y',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'sahanpramuditha-portfolio.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'sahanpramuditha-portfolio',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'sahanpramuditha-portfolio.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '180340771122',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:180340771122:web:e0ddfe5fc4d66991d72f2b',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-EQFV12BE5K',
};

import { getFunctions } from 'firebase/functions';
import { getPerformance } from 'firebase/performance';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Force clear the IndexedDB cache to resolve any schema mismatch or corrupted states 
// (e.g. FIRESTORE INTERNAL ASSERTION FAILED: Unexpected state ID: ca9)
if (typeof window !== 'undefined') {
  clearIndexedDbPersistence(db).catch(() => {});
}

const storage = getStorage(app);
const functions = getFunctions(app);

let analytics = null;
let performance = null;

if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {
    analytics = null;
  });
  
  // Initialize Performance Monitoring
  try {
    performance = getPerformance(app);
  } catch (err) {
    console.warn('Firebase Performance Monitoring failed to initialize:', err);
  }
}

export { app, auth, db, storage, analytics, functions, performance };
