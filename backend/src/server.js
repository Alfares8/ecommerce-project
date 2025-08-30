import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';
import { config } from './config.js';

import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

mongoose.connect(config.mongoUri).then(()=>console.log('✅ MongoDB connected')).catch(console.error);

const app = express();
app.use(cors({ origin: config.corsOrigin, credentials: false }));
app.use(express.json());
app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));

app.get('/health', (_req,res)=>res.json({ok:true}));
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

app.use((req,res)=>res.status(404).json({error:'Not Found'}));

app.listen(config.port, ()=>console.log(`🚀 Backend http://localhost:${config.port}`));
export default app;