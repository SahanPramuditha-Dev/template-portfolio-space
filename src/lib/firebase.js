import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

let analytics = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {
    analytics = null;
  });
}

export { app, auth, db, storage, analytics };
