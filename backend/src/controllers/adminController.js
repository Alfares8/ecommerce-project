import User from '../models/User.js';
import Order from '../models/Order.js';

export const listUsers = async (_req, res) => {
  const users = await User.find({}, { passwordHash: 0 }).sort({ createdAt: -1 });
  res.json(users);
};

export const listOrders = async (_req, res) => {
  const orders = await Order.find().populate('user','email').sort({ createdAt: -1 });
  res.json(orders);
};

export const updateOrderStatus = async (req, res) => {
  const o = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  res.json(o);
};