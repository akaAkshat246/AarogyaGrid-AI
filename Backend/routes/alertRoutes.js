import { Router } from 'express';
import * as controller from '../controllers/alertController.js';
const router = Router();
router.get('/', controller.getAlerts);
router.post('/', controller.createAlert);
router.put('/:id/resolve', controller.resolveAlert);
export default router;
