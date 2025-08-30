import 'dotenv/config';

export const config = {
  port: process.env.PORT || 4000,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce',
  jwtSecret: process.env.JWT_SECRET || 'change_me_please',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  stripeSecret: process.env.STRIPE_SECRET_KEY || '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || ''
};