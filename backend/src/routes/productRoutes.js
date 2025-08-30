import { Router } from 'express';
import { list, getOne, create, update, remove } from '../controllers/productController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();
router.get('/', list);
router.get('/:id', getOne);
router.post('/', requireAuth, requireAdmin, create);
router.put('/:id', requireAuth, requireAdmin, update);
router.delete('/:id', requireAuth, requireAdmin, remove);
export default router;