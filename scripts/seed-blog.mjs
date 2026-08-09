import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, writeBatch, collection } from 'firebase/firestore';
import { BLOG_POSTS } from '../src/data/blogPosts.js';

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

async function seed() {
  try {
    console.log('Logging into database...');
    await signInWithEmailAndPassword(auth, 'sahanpramuditha91@gmail.com', 'Sahan@910');
    console.log('Login successful! Seeding blog collection...');

    // 1. Seed legacy content/blog document
    await setDoc(doc(db, 'content', 'blog'), { items: BLOG_POSTS });
    console.log('Successfully set content/blog document with 15 items!');

    // 2. Seed individual root collection documents in 'blog'
    const batch = writeBatch(db);
    BLOG_POSTS.forEach((post, index) => {
      const docRef = doc(db, 'blog', post.slug || post.id);
      batch.set(docRef, {
        ...post,
        order: index,
        updatedAt: new Date().toISOString(),
        status: post.status || 'published',
      }, { merge: true });
    });

    await batch.commit();
    console.log(`Successfully seeded ${BLOG_POSTS.length} documents into root 'blog' collection!`);

  } catch (error) {
    console.error('Seeding failed:', error.message);
  }
  process.exit();
}

seed();
