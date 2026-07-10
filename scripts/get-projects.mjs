import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyD2jARZLL75tRWQ5_gOZ71nLkQXF7tek3Y',
  authDomain: 'sahanpramuditha-portfolio.firebaseapp.com',
  projectId: 'sahanpramuditha-portfolio',
  storageBucket: 'sahanpramuditha-portfolio.firebasestorage.app',
  messagingSenderId: '180340771122',
  appId: '1:180340771122:web:e0ddfe5fc4d66991d72f2b',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function getProjects() {
  try {
    const docRef = doc(db, 'content', 'projects');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      console.log(JSON.stringify(docSnap.data(), null, 2));
    } else {
      console.log('No projects document found.');
    }
  } catch (error) {
    console.error('Error fetching projects:', error);
  }
  process.exit();
}

getProjects();
