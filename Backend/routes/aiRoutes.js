import { Router } from 'express';
import * as controller from '../controllers/aiController.js';
const router = Router();
router.post('/predict', controller.predict);
router.get('/predictions/:phcId', controller.getPredictions);
export default router;
