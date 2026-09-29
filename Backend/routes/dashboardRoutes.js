import { Router } from 'express';
import * as controller from '../controllers/dashboardController.js';
const router = Router();
router.get('/', controller.getDashboard);
export default router;
