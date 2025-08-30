import { Router } from 'express';
import { listUsers, listOrders, updateOrderStatus } from '../controllers/adminController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth, requireAdmin);
router.get('/users', listUsers);
router.get('/orders', listOrders);
router.put('/orders/:id/status', updateOrderStatus);
export default router;