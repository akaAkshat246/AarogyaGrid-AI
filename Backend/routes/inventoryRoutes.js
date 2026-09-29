import { Router } from 'express';
import * as controller from '../controllers/inventoryController.js';
const router = Router();
router.get('/:phcId', controller.getInventory);
router.post('/', controller.addInventoryItem);
router.put('/:id', controller.updateInventoryItem);
router.delete('/:id', controller.deleteInventoryItem);
export default router;
