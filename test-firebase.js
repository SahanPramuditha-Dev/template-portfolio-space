import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || 'AIzaSyD2jARZLL75tRWQ5_gOZ71nLkQXF7tek3Y',
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || 'sahanpramuditha-portfolio.firebaseapp.com',
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'sahanpramuditha-portfolio',
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || 'sahanpramuditha-portfolio.firebasestorage.app',
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '180340771122',
  appId: process.env.VITE_FIREBASE_APP_ID || '1:180340771122:web:e0ddfe5fc4d66991d72f2b',
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-EQFV12BE5K',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function test() {
  try {
    console.log('Signing in...');
    const userCredential = await signInWithEmailAndPassword(auth, 'sahanpramuditha91@gmail.com', 'Sahan@910');
    console.log('Signed in as:', userCredential.user.email);
    
    console.log('Querying analyticsEvents...');
    const q = query(collection(db, 'analyticsEvents'), orderBy('timestamp', 'desc'), limit(2));
    const snapshot = await getDocs(q);
    console.log('Success! Documents found:', snapshot.docs.length);
  } catch (error) {
    console.error('Error occurred:');
    console.error(error.message);
    console.error(error.code);
  }
  process.exit();
}

test();
