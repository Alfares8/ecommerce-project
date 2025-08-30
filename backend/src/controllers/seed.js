// backend/src/seed.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from './config.js';

import User from './models/User.js';
import Category from './models/Category.js';
import Product from './models/Product.js';
async function run() {
  console.log('🔧 Connecting to MongoDB…', config.mongoUri);
  await mongoose.connect(config.mongoUri);

  // مسح البيانات القديمة
  console.log('🧹 Clearing collections…');
  await Promise.all([User.deleteMany({}), Category.deleteMany({}), Product.deleteMany({})]);

  // مستخدمين (انتبه: الحقل اسمه password وليس passwordHash)
  console.log('👤 Creating users…');
  const admin = await User.create({
    email: 'admin@store.com',
    password: await bcrypt.hash('Admin@12345', 10),
    role: 'admin',
  });
  const customer = await User.create({
    email: 'user@store.com',
    password: await bcrypt.hash('User@12345', 10),
    role: 'customer',
  });

  // فئات
  console.log('🏷  Inserting categories…');
  const cats = await Category.insertMany([
    { name: 'Shirts', slug: 'shirts' },
    { name: 'Shoes', slug: 'shoes' },
    { name: 'Accessories', slug: 'accessories' },
    { name: 'Bags', slug: 'bags' },
  ]);
  const catId = (slug) => cats.find(c => c.slug === slug)._id;

  // منتجات
  console.log('🧺 Inserting products…');
  const products = [
    { name: 'Classic White Shirt', description: 'قميص قطني كلاسيكي', price: 29.99, stock: 60, image_url: 'https://images.unsplash.com/photo-1520975922284-8b456906c813?w=1200', categories: [catId('shirts')], variations: [{ size:'M', color:'White', stock: 20 }] },
    { name: 'Denim Shirt', description: 'قميص دنيم خفيف', price: 34.90, stock: 40, image_url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=1200', categories: [catId('shirts')], variations: [{ size:'L', color:'Blue', stock: 15 }] },
    { name: 'Linen Summer Shirt', description: 'كتان صيفي مريح', price: 39.50, stock: 35, image_url: 'https://images.unsplash.com/photo-1593032457860-9f7b5a2f1c3a?w=1200', categories: [catId('shirts')], variations: [{ size:'M', color:'Beige', stock: 12 }] },
    { name: 'Checked Casual Shirt', description: 'قميص مربعات كاجوال', price: 31.00, stock: 30, image_url: 'https://images.unsplash.com/photo-1520975619016-3fb3b5b7b2d4?w=1200', categories: [catId('shirts')], variations: [{ size:'XL', color:'Red', stock: 10 }] },
    { name: 'Oxford Slim Shirt', description: 'أوكسفورد نحيف رسمي', price: 42.00, stock: 28, image_url: 'https://images.unsplash.com/photo-1520975619321-229c7f0c5e1b?w=1200', categories: [catId('shirts')], variations: [{ size:'M', color:'Blue', stock: 10 }] },

    { name: 'Elegant Leather Shoes', description: 'أحذية جلد فاخرة', price: 59.99, stock: 50, image_url: 'https://images.unsplash.com/photo-1542293787938-c9e299b88054?w=1200', categories: [catId('shoes')], variations: [{ size:'42', color:'Black', stock: 18 }] },
    { name: 'Running Sneakers', description: 'حذاء جري خفيف', price: 64.90, stock: 45, image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200', categories: [catId('shoes')], variations: [{ size:'43', color:'Gray', stock: 14 }] },
    { name: 'Canvas Low-Top', description: 'حذاء كانفاس كلاسيكي', price: 35.00, stock: 70, image_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200', categories: [catId('shoes')], variations: [{ size:'41', color:'White', stock: 20 }] },
    { name: 'Chelsea Boots', description: 'تشيلسي بوت جلد', price: 89.00, stock: 20, image_url: 'https://images.unsplash.com/photo-1543489816-c87b0f5f7dd1?w=1200', categories: [catId('shoes')], variations: [{ size:'44', color:'Brown', stock: 7 }] },
    { name: 'Hiking Shoes', description: 'أحذية مشي للرحلات', price: 74.50, stock: 25, image_url: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=1200', categories: [catId('shoes')], variations: [{ size:'43', color:'Olive', stock: 8 }] },

    { name: 'Leather Belt', description: 'حزام جلد طبيعي', price: 19.99, stock: 80, image_url: 'https://images.unsplash.com/photo-1520975923027-8b4f9b0f0f16?w=1200', categories: [catId('accessories')] },
    { name: 'Aviator Sunglasses', description: 'نظارات شمس كلاسيك', price: 24.90, stock: 65, image_url: 'https://images.unsplash.com/photo-1511497584788-876760111969?w=1200', categories: [catId('accessories')] },
    { name: 'Sports Cap', description: 'قبعة رياضية', price: 14.50, stock: 90, image_url: 'https://images.unsplash.com/photo-1520975921800-cc73d0f5f7ae?w=1200', categories: [catId('accessories')] },
    { name: 'Wool Scarf', description: 'وشاح صوفي شتوي', price: 22.00, stock: 40, image_url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200', categories: [catId('accessories')] },
    { name: 'Minimal Watch', description: 'ساعة يد بسيطة وأنيقة', price: 79.00, stock: 18, image_url: 'https://images.unsplash.com/photo-1517940310602-75eae8b2f0de?w=1200', categories: [catId('accessories')] },

    { name: 'Everyday Backpack', description: 'حقيبة ظهر يومية', price: 44.90, stock: 35, image_url: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=1200', categories: [catId('bags')] },
    { name: 'Leather Messenger', description: 'حقيبة كتف جلد', price: 99.00, stock: 15, image_url: 'https://images.unsplash.com/photo-1500043357865-c6b8827edf7a?w=1200', categories: [catId('bags')] },
    { name: 'Travel Duffle', description: 'حقيبة سفر متينة', price: 79.50, stock: 22, image_url: 'https://images.unsplash.com/photo-1519961655809-34fa156820ff?w=1200', categories: [catId('bags')] },
    { name: 'Tote Canvas Bag', description: 'حقيبة كانفاس للتسوّق', price: 16.00, stock: 100, image_url: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=1200', categories: [catId('bags')] },
    { name: 'Laptop Sleeve 15\"', description: 'حافظة لابتوب 15 إنش', price: 25.00, stock: 50, image_url: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=1200', categories: [catId('bags')] },
  ];

  await Product.insertMany(products);

  console.log('✅ Seed done:', {
    admin: admin.email,
    customer: customer.email,
    categories: cats.length,
    products: products.length,
  });
}

run()
  .catch((err) => { console.error('❌ Seed failed:', err); process.exit(1); })
  .finally(async () => { await mongoose.disconnect(); process.exit(0); });