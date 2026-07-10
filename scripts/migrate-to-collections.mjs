import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Requires a firebase admin service account key at the root of the project
// named serviceAccountKey.json
let serviceAccount;
try {
  serviceAccount = JSON.parse(readFileSync(resolve('./serviceAccountKey.json'), 'utf-8'));
} catch (e) {
  console.error("Missing serviceAccountKey.json. Please download it from Firebase Console -> Project Settings -> Service Accounts -> Generate New Private Key, save it in the root folder, and try again.");
  process.exit(1);
}

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

// List of documents in 'content' that contain an 'items' array which we want to migrate
const COLLECTIONS_TO_MIGRATE = [
  'projects',
  'certifications',
  'skills',
  'experience',
  'blog',
  'testimonials',
  'services',
  'resources',
  'faqs',
];

async function migrate() {
  console.log("Starting Migration to Root Collections...");
  const batch = db.batch();
  let operations = 0;

  for (const collectionName of COLLECTIONS_TO_MIGRATE) {
    console.log(`Processing content/${collectionName}...`);
    const docRef = db.collection('content').doc(collectionName);
    const docSnap = await docRef.get();
    
    if (!docSnap.exists) {
      console.log(`  -> content/${collectionName} does not exist, skipping.`);
      continue;
    }

    const data = docSnap.data();
    if (!data.items || !Array.isArray(data.items)) {
      console.log(`  -> content/${collectionName} has no 'items' array, skipping.`);
      continue;
    }

    console.log(`  -> Found ${data.items.length} items to migrate to root collection /${collectionName}.`);
    
    for (const [index, item] of data.items.entries()) {
      // Create a unique ID or use existing id if available
      const itemId = item.id || `${collectionName}-${Date.now()}-${index}`;
      
      const newDocRef = db.collection(collectionName).doc(itemId);
      
      // Keep legacy original_index to preserve old sorting if necessary, and assign an order
      const migratedItem = {
        ...item,
        order: index, // Preserve array order via a numeric field
        migratedAt: new Date(),
        status: item.status || 'published' // Default to published so public read rules work
      };
      
      // Some components expect `updatedAt` for sorting (like Blog)
      if (!migratedItem.updatedAt) {
          migratedItem.updatedAt = new Date();
      }

      batch.set(newDocRef, migratedItem);
      operations++;

      if (operations === 490) {
        await batch.commit();
        console.log("Committed a batch of 490 operations.");
        operations = 0;
      }
    }
  }

  if (operations > 0) {
    await batch.commit();
    console.log(`Committed final batch of ${operations} operations.`);
  }

  console.log("Migration completed successfully.");
}

migrate().catch(console.error);
