import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyD2jARZLL75tRWQ5_gOZ71nLkQXF7tek3Y',
  authDomain: 'sahanpramuditha-portfolio.firebaseapp.com',
  projectId: 'sahanpramuditha-portfolio',
  storageBucket: 'sahanpramuditha-portfolio.firebasestorage.app',
  messagingSenderId: '180340771122',
  appId: '1:180340771122:web:e0ddfe5fc4d66991d72f2b',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const testimonialsSeed = {
  items: [
    {
      name: 'Nimesh Bandara',
      role: 'CEO & Co-founder',
      company: 'TechVantage Solutions',
      content: 'Working with Sahan was an absolute breeze. He transformed our messy legacy code into a blazing fast, responsive React platform ahead of our launch schedule. His attention to detail on visual elements and performance metrics was exactly what we needed.',
      rating: 5,
      context: 'Custom Web Application Build',
      link: ''
    },
    {
      name: 'Dilhani Perera',
      role: 'Marketing Director',
      company: 'Ceylon Artisans',
      content: 'We engaged Sahan to rebuild our e-commerce portal and integrate it with our local payment system in LKR. Not only did he complete the project on time, but our conversion rate boosted by 25% due to the optimized shopping cart experience.',
      rating: 5,
      context: 'Premium E-Commerce Build',
      link: ''
    },
    {
      name: 'Michael Chen',
      role: 'Lead Architect',
      company: 'NexusTech Canada',
      content: 'Sahan was brought in to build our RESTful microservices API and optimize our database schema logic. He delivered clean, robust Node.js code with fully passing Swagger specifications and test coverage. A highly skilled engineer.',
      rating: 5,
      context: 'API Architecture Optimization',
      link: ''
    }
  ]
};

const openSourceSeed = {
  items: [
    {
      name: 'framer-motion-glass-cards',
      category: 'UI Components',
      description: 'A React library that exports highly customizable glassmorphic components and mouse-tracking blur card containers powered by Framer Motion.',
      repository: 'https://github.com/SahanPramuditha-Dev/framer-motion-glass-cards',
      stars: 42,
      forks: 8,
      watchers: 3,
      status: 'Active'
    },
    {
      name: 'firebase-cms-light',
      category: 'Backend Utilities',
      description: 'An elegant, lightweight CMS wrapper to read, subscribe, and edit dynamic documents directly from Firestore without writing boilerplate adapters.',
      repository: 'https://github.com/SahanPramuditha-Dev/firebase-cms-light',
      stars: 28,
      forks: 3,
      watchers: 2,
      status: 'Maintained'
    }
  ]
};

async function seed() {
  try {
    console.log('Logging in...');
    await signInWithEmailAndPassword(auth, 'sahanpramuditha91@gmail.com', 'Sahan@910');
    console.log('Login successful!');
    
    console.log('Seeding testimonials...');
    await setDoc(doc(db, 'content', 'testimonials'), testimonialsSeed);
    
    console.log('Seeding openSource...');
    await setDoc(doc(db, 'content', 'openSource'), openSourceSeed);
    
    console.log('Success! Testimonials & Open Source seeded.');
  } catch (error) {
    console.error('Seeding failed:', error.message);
  }
  process.exit();
}

seed();
