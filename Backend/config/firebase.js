import { applicationDefault, initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { root } from './env.js';
export function connectFirebase() {
  const credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (credentials) {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = resolve(root, credentials);
    if (!existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
      throw new Error('Firebase credentials missing. Add serviceAccountKey.json to Backend or update GOOGLE_APPLICATION_CREDENTIALS in .env.');
    }
  }
  const app = getApps()[0] ?? initializeApp({ credential: applicationDefault() });
  return { db: getFirestore(app), auth: getAuth(app) };
}
