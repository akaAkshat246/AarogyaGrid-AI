import { env, root } from './config/env.js';
import { connectFirebase } from './config/firebase.js';
import { createStore } from './services/store.js';
import { memoryStore } from './test/support/memoryStore.js';
import { createAIService } from './services/aiService.js';
import { createApp } from './app.js';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

try {
  let store;
  let auth;

  try {
    const fb = connectFirebase();
    store = createStore(fb.db);
    auth = fb.auth;
    console.log('Connected to live Firebase Firestore & Auth.');
  } catch (error) {
    if (env.skipAuth) {
      console.warn(`[Notice] ${error.message}`);
      console.warn('⚡ Initializing local in-memory store with synthetic PHC fixtures.');
      store = memoryStore();
      auth = { verifyIdToken: async () => ({ uid: 'local-dev-user' }) };

      // Seed synthetic PHC fixtures if available
      try {
        const phcPath = resolve(root, '..', 'ai-data', 'data', 'raw', 'phcs.json');
        const invPath = resolve(root, '..', 'ai-data', 'data', 'raw', 'inventory.json');
        if (existsSync(phcPath)) {
          const phcs = JSON.parse(readFileSync(phcPath, 'utf8'));
          for (const p of phcs) {
            await store.put('phcs', p.id, {
              name: p.name,
              district: p.district,
              state: p.state,
              latitude: p.latitude,
              longitude: p.longitude,
              pincode: p.pincode
            });
            await store.put('beds', p.id, {
              totalBeds: p.total_beds || 24,
              occupiedBeds: Math.floor((p.total_beds || 24) * 0.7),
              icuBeds: p.icu_beds || 4
            });
            await store.put('staff', p.id, {
              doctorsTotal: p.doctors || 4,
              doctorsPresent: Math.max(1, (p.doctors || 4) - 1),
              nursesTotal: p.nurses || 8,
              nursesPresent: Math.max(2, (p.nurses || 8) - 1)
            });
          }
          console.log(`✓ Preloaded ${phcs.length} PHC facilities into local memory store.`);
        }
        if (existsSync(invPath)) {
          const inv = JSON.parse(readFileSync(invPath, 'utf8'));
          let count = 0;
          for (const item of inv.slice(0, 40)) {
            await store.create('inventory', {
              phcId: item.phc_id,
              medicine: item.medicine,
              quantity: item.stock_on_hand,
              minimumStock: item.minimum_stock,
              dailyUsage: item.daily_usage
            });
            count++;
          }
          console.log(`✓ Preloaded ${count} medicine inventory items.`);
        }
      } catch (seedErr) {
        console.warn('Fixture seeding notice:', seedErr.message);
      }
    } else {
      throw error;
    }
  }

  const app = createApp({ store, auth, config: env, predict: createAIService(env) });
  const server = app.listen(env.PORT, env.HOST, () => {
    console.log(`🚀 AarogyaGrid Backend API live at: http://${env.HOST}:${env.PORT}`);
    if (env.skipAuth) console.log('🛡️  Local development mode active (Auth bypass: ON)');
  });
  server.on('error', error => { console.error(error.message); process.exitCode = 1; });
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => {
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10000).unref();
  });
} catch (error) { console.error('Startup failed:', error.message); process.exitCode = 1; }

