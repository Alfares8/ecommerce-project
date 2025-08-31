// backend/routes/adminRoutes.js
import { Router } from "express";
import {
  listUsers,
  listOrders,
  updateOrderStatus,
} from "../controllers/adminController.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

// كل مسارات الأدمن لازم تكون محمية
router.use(requireAuth, requireAdmin);

// قائمة المستخدمين
router.get("/users", listUsers);

// قائمة الطلبات
router.get("/orders", listOrders);

// تحديث حالة طلب (PATCH أفضل من PUT لأننا نعدل جزء فقط)
router.patch("/orders/:id/status", updateOrderStatus);

export default router;