import { Router } from 'express';
import * as controller from '../controllers/staffController.js';
const router = Router();
router.get('/:phcId', controller.getStaff);
router.put('/:phcId', controller.updateStaff);
export default router;
