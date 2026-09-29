import { Router } from 'express';
import * as controller from '../controllers/bedController.js';
const router = Router();
router.get('/:phcId', controller.getBeds);
router.put('/:phcId', controller.updateBeds);
export default router;
