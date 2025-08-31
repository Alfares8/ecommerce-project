// backend/routes/orderRoutes.js
import { Router } from "express";
import {
  createPaymentIntent,
  placeOrder,
  myOrders,
} from "../controllers/orderController.js";
import { requireAuth } from "../middleware/auth.js";

// التفاف للدوال غير المتزامنة لتمرير الأخطاء إلى Express
const wrap = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const router = Router();

/**
 * POST /api/orders/create-payment-intent
 * عام: يستخدمه الـ Checkout لحساب المبلغ وإنشاء PaymentIntent (أو mock بدون Stripe)
 */
router.post("/create-payment-intent", wrap(createPaymentIntent));

/**
 * POST /api/orders
 * خاص: إنشاء الطلب بعد الدفع — يتطلب تسجيل دخول
 */
router.post("/", requireAuth, wrap(placeOrder));

/**
 * GET /api/orders/mine
 * خاص: استرجاع طلبات المستخدم الحالي — يتطلب تسجيل دخول
 */
router.get("/mine", requireAuth, wrap(myOrders));

export default router;