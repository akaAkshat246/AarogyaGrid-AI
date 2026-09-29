import { env } from './config/env.js';
import { connectFirebase } from './config/firebase.js';
import { createStore } from './services/store.js';
import { createAIService } from './services/aiService.js';
import { createApp } from './app.js';
try {
  const { db, auth } = connectFirebase();
  const app = createApp({ store: createStore(db), auth, config: env, predict: createAIService(env) });
  const server = app.listen(env.PORT, env.HOST, () => {
    console.log('AarogyaGrid API: http://' + env.HOST + ':' + env.PORT);
    if (env.skipAuth) console.warn('Local demo mode: authentication is disabled.');
  });
  server.on('error', error => { console.error(error.message); process.exitCode = 1; });
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => {
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10000).unref();
  });
} catch (error) { console.error('Startup failed:', error.message); process.exitCode = 1; }
