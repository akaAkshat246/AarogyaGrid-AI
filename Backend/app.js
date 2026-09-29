import express from 'express';
import cors from 'cors';
import { verifyUser } from './middleware/authMiddleware.js';
import { errorHandler, HttpError } from './middleware/errorHandler.js';
import phcRoutes from './routes/phcRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import bedRoutes from './routes/bedRoutes.js';
import staffRoutes from './routes/staffRoutes.js';
import footfallRoutes from './routes/footfallRoutes.js';
import alertRoutes from './routes/alertRoutes.js';
import transferRoutes from './routes/transferRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
export function createApp({ store, auth, config, predict }) {
  const app = express();
  app.disable('x-powered-by');
  app.locals.store = store;
  app.locals.predict = predict;
  app.use(cors({ origin(origin, callback) {
    callback(null, !origin || config.origins.includes(origin));
  }}));
  app.use(express.json({ limit: '100kb' }));
  app.get('/', (req, res) => res.json({ success: true, message: 'AarogyaGrid API is running' }));
  app.get('/health', (req, res) => res.json({ success: true, status: 'ok' }));
  app.use('/api', verifyUser({ auth, skipAuth: config.skipAuth }));
  app.get('/api/health/ready', async (req, res) => {
    try { await store.ping(); }
    catch { throw new HttpError(503, 'Firestore unavailable; check credentials, permissions and database setup'); }
    res.json({ success: true, firestore: 'connected' });
  });
  app.use('/api/phcs', phcRoutes);
  app.use('/api/inventory', inventoryRoutes);
  app.use('/api/beds', bedRoutes);
  app.use('/api/staff', staffRoutes);
  app.use('/api/footfall', footfallRoutes);
  app.use('/api/alerts', alertRoutes);
  app.use('/api/transfers', transferRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/ai', aiRoutes);
  app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
  app.use(errorHandler);
  return app;
}
