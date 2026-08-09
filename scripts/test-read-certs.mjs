import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { resolve } from 'path';

let serviceAccount = JSON.parse(readFileSync(resolve('./serviceAccountKey.json'), 'utf-8'));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function run() {
  const snapshot = await db.collection('certifications').get();
  console.log('Total certs:', snapshot.size);
  snapshot.forEach(doc => {
    const data = doc.data();
    console.log(doc.id, '-> status:', data.status);
  });
}
run().catch(console.error);
