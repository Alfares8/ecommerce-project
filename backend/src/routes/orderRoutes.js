import { Router } from 'express';
import { createPaymentIntent, placeOrder, myOrders } from '../controllers/orderController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.post('/create-payment-intent', createPaymentIntent);
router.post('/', requireAuth, placeOrder);
router.get('/mine', requireAuth, myOrders);
export default router;