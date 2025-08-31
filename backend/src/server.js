// backend/server.js

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';
import { config } from './config.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// اتصال بقاعدة البيانات
mongoose
  .connect(config.mongoUri)
  .then(() => console.log('✅ MongoDB connected:', config.mongoUri))
  .catch((err) => console.error('❌ MongoDB error:', err.message));

const app = express();

// Middleware
app.use(cors({ origin: config.corsOrigin || '*', credentials: false }));
app.use(express.json());
app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));

// Health check
app.get('/health', (_req, res) => res.json({ ok: true }));

// استخدام الـ routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// طباعة جميع الـ routes الموجودة (للتأكد)
app._router.stack.forEach((r) => {
  if (r.route && r.route.path) {
    console.log(`➡ ${Object.keys(r.route.methods)} ${r.route.path}`);
  } else if (r.name === 'router') {
    r.handle.stack.forEach((handler) => {
      if (handler.route) {
        console.log(`➡ ${Object.keys(handler.route.methods)} ${handler.route.path}`);
      }
    });
  }
});

// 404 handler
app.use((req, res) => res.status(404).json({ error: 'Not Found' }));

// تشغيل السيرفر
app.listen(config.port, () =>
  console.log(`🚀 Backend running on: http://localhost:${config.port}`)
);

export default app;