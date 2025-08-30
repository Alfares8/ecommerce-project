import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Stripe from 'stripe';
import { config } from '../config.js';

const stripe = new Stripe(config.stripeSecret || 'sk_test_dummy', { apiVersion: '2023-10-16' });

export const createPaymentIntent = async (req, res) => {
  const { items } = req.body; // [{productId, quantity}]
  if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'Empty cart' });

  const dbItems = await Promise.all(items.map(async it => {
    const p = await Product.findById(it.productId);
    if (!p || !p.active) throw new Error('Invalid product');
    const qty = Math.max(1, Number(it.quantity || 1));
    return { name: p.name, amount: Math.round(p.price * 100), currency: 'eur', quantity: qty, product: p };
  }));

  const amount = dbItems.reduce((sum, it) => sum + it.amount * it.quantity, 0);
  // للبيئة المحلية، إن لم يوجد مفتاح Stripe حقيقي، أرجع mock
  if (!config.stripeSecret) {
    return res.json({ clientSecret: 'mock_client_secret', amount });
  }
  const intent = await stripe.paymentIntents.create({ amount, currency: 'eur', automatic_payment_methods: { enabled: true } });
  res.json({ clientSecret: intent.client_secret, amount });
};

export const placeOrder = async (req, res) => {
  const { items, payment_id, total } = req.body;
  if (!payment_id) return res.status(400).json({ error: 'Missing payment' });

  const fullItems = [];
  for (const it of items) {
    const p = await Product.findById(it.productId);
    if (!p || p.stock < it.quantity) return res.status(400).json({ error:` Out of stock: ${p?.name} `});
    fullItems.push({ product: p._id, name: p.name, quantity: it.quantity, price: p.price });
    p.stock -= it.quantity;
    await p.save();
  }

  const order = await Order.create({
    user: req.user?.id,
    items: fullItems,
    total,
    status: 'paid',
    payment_id
  });

  res.status(201).json({ order });
};

export const myOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json(orders);
};