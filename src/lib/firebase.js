import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyD2jARZLL75tRWQ5_gOZ71nLkQXF7tek3Y',
  authDomain: 'sahanpramuditha-portfolio.firebaseapp.com',
  projectId: 'sahanpramuditha-portfolio',
  storageBucket: 'sahanpramuditha-portfolio.firebasestorage.app',
  messagingSenderId: '180340771122',
  appId: '1:180340771122:web:e0ddfe5fc4d66991d72f2b',
  measurementId: 'G-EQFV12BE5K',
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
