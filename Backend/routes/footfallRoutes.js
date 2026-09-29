import { Router } from 'express';
import * as controller from '../controllers/footfallController.js';
const router = Router();
router.get('/:phcId', controller.getFootfall);
router.post('/', controller.addFootfall);
export default router;
