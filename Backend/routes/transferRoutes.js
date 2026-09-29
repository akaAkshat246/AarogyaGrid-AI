import { Router } from 'express';
import * as controller from '../controllers/transferController.js';
const router = Router();
router.get('/', controller.getTransfers);
router.post('/', controller.createTransfer);
router.put('/:id/status', controller.updateTransferStatus);
export default router;
