import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { resolve } from 'path';

let serviceAccount = JSON.parse(readFileSync(resolve('./serviceAccountKey.json'), 'utf-8'));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function run() {
  const snapshot = await db.collection('projects').where('status', 'in', ['published', 'Published', 'Live', 'Active']).get();
  console.log('Query returned total projects:', snapshot.size);
}
run().catch(console.error);
