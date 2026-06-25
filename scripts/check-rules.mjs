import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const firestoreRules = readFileSync('firestore.rules', 'utf8');
const storageRules = readFileSync('storage.rules', 'utf8');

assert.match(
  firestoreRules,
  /match \/inquiries\/\{inquiryId\}[\s\S]*allow read, write: if isAdmin\(\);/,
  'Firestore inquiries must be admin-only.'
);

assert.match(
  firestoreRules,
  /match \/auditLogs\/\{logId\}[\s\S]*allow create: if isAdmin\(\);[\s\S]*allow update, delete: if false;/,
  'Firestore audit logs must be append-only.'
);

assert.match(
  firestoreRules,
  /match \/projects\/\{projectId\}[\s\S]*allow read: if resource\.data\.status == 'published';/,
  'Project reads must be gated by published status.'
);

assert.match(
  storageRules,
  /match \/private\/\{allPaths=\*\*\}[\s\S]*allow read, write: if isAdmin\(\);/,
  'Private Storage files must be admin-only.'
);

assert.match(
  storageRules,
  /request\.resource\.size < 10 \* 1024 \* 1024/,
  'Storage uploads must have a file-size limit.'
);

assert.match(
  storageRules,
  /match \/\{allPaths=\*\*\}[\s\S]*allow read: if false;[\s\S]*allow write: if false;/,
  'Storage catch-all must deny reads and writes.'
);

console.log('Firebase rules sanity checks passed.');
