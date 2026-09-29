import { Router } from 'express';
import * as controller from '../controllers/phcController.js';
const router = Router();
router.get('/', controller.getAllPHCs);
router.get('/:id', controller.getPHCById);
router.post('/', controller.createPHC);
router.put('/:id', controller.updatePHC);
router.delete('/:id', controller.deletePHC);
export default router;
