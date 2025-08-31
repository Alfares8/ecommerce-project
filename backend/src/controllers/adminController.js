// backend/controllers/adminController.js
import mongoose from "mongoose";
import User from "../models/User.js";
import Order from "../models/Order.js";

// شكل الاستجابة الموحّد للـ lists:
// { items: [...], count: <number> }
// وشكل التحديث/عنصر واحد:
// { item: {...} }

export const listUsers = async (_req, res) => {
  try {
    const users = await User
      .find({}, { passwordHash: 0, __v: 0 })
      .sort({ createdAt: -1 });

    return res.json({ items: users, count: users.length });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Failed to load users" });
  }
};

export const listOrders = async (_req, res) => {
  try {
    const orders = await Order
      .find({}, { __v: 0 })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    return res.json({ items: orders, count: orders.length });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Failed to load orders" });
  }
};

const ALLOWED_STATUSES = ["new", "paid", "processing", "shipped", "completed", "cancelled"];

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body ?? {};

    // تحقّق من صحة الـ id
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid order id" });
    }

    // تحقّق من الحالة المطلوبة
    if (!status || !ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Allowed: ${ALLOWED_STATUSES.join(", ")}`,
      });
    }

    const updated = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate("user", "name email");

    if (!updated) {
      return res.status(404).json({ error: "Order not found" });
    }

    return res.json({ item: updated });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Failed to update order" });
  }
};