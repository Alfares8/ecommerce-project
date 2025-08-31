// backend/controllers/orderController.js
import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Stripe from "stripe";
import { config } from "../config.js";

const stripe =
  config.stripeSecret
    ? new Stripe(config.stripeSecret, { apiVersion: "2023-10-16" })
    : null;

// helper: ردّ موحّد للأخطاء
const fail = (res, code, msg) => res.status(code).json({ error: msg });

// POST /api/orders/intent
// body: { items: [{ productId, quantity }] }
export const createPaymentIntent = async (req, res) => {
  try {
    const items = Array.isArray(req.body?.items) ? req.body.items : [];
    if (!items.length) return fail(res, 400, "Empty cart");

    // اجلب المنتجات وتحقّق من صحتها
    const dbItems = [];
    for (const it of items) {
      if (!mongoose.isValidObjectId(it?.productId)) {
        return fail(res, 400, "Invalid product id");
      }
      const p = await Product.findById(it.productId).lean();
      if (!p || p.active === false) return fail(res, 400, "Invalid product");
      const qty = Math.max(1, Number(it.quantity || 1));
      dbItems.push({
        productId: p._id.toString(),
        name: p.name,
        price: Number(p.price) || 0,
        quantity: qty,
        amount: Math.round((Number(p.price) || 0) * 100),
        currency: "eur",
      });
    }

    // إجمالي المبلغ بالسنتات
    const amount = dbItems.reduce((s, it) => s + it.amount * it.quantity, 0);

    // وضع وهمي إذا ما في STRIPE_SECRET
    if (!stripe) {
      return res.json({
        clientSecret: "mock_client_secret",
        amount,
        currency: "eur",
        items: dbItems,
        mock: true,
      });
    }

    const intent = await stripe.paymentIntents.create({
      amount,
      currency: "eur",
      automatic_payment_methods: { enabled: true },
      metadata: { app: "ecommerce-platform" },
    });

    return res.json({
      clientSecret: intent.client_secret,
      amount,
      currency: "eur",
      items: dbItems,
    });
  } catch (e) {
    return fail(res, 500, e?.message || "Failed to create payment intent");
  }
};

// POST /api/orders
// body: { items:[{productId, quantity}], payment_id, total }
export const placeOrder = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return fail(res, 401, "Unauthorized");

    const items = Array.isArray(req.body?.items) ? req.body.items : [];
    if (!items.length) return fail(res, 400, "Empty cart");

    const payment_id = String(req.body?.payment_id || "").trim();
    if (!payment_id) return fail(res, 400, "Missing payment");

    // ابني عناصر الطلب + حدّث المخزون
    const fullItems = [];
    let computedTotal = 0;

    for (const it of items) {
      if (!mongoose.isValidObjectId(it?.productId)) {
        return fail(res, 400, "Invalid product id");
      }
      const p = await Product.findById(it.productId);
      if (!p || p.active === false) return fail(res, 400, "Invalid product");

      const qty = Math.max(1, Number(it.quantity || 1));

      if (Number(p.stock) < qty) {
        return fail(res, 400, `Out of stock: ${p.name}`);
      }

      // خفّض المخزون واحفظ المنتج
      p.stock = Number(p.stock) - qty;
      await p.save();

      const price = Number(p.price) || 0;
      computedTotal += price * qty;

      fullItems.push({
        product: p._id,
        name: p.name,
        quantity: qty,
        price,
      });
    }

    // في حال أرسل الفرونت total، نتحقق أنه مطابق (بهامش بسيط)
    const clientTotal = Number(req.body?.total ?? computedTotal);
    if (Math.abs(clientTotal - computedTotal) > 0.01) {
      return fail(res, 400, "Total mismatch");
    }

    const order = await Order.create({
      user: userId,
      items: fullItems,
      total: computedTotal,
      status: "paid",
      payment_id,
    });

    return res.status(201).json({ order });
  } catch (e) {
    return fail(res, 500, e?.message || "Failed to place order");
  }
};

// GET /api/orders/mine
export const myOrders = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return fail(res, 401, "Unauthorized");

    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .lean();

    return res.json(orders);
  } catch (e) {
    return fail(res, 500, e?.message || "Failed to load orders");
  }
};