import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export const requireAuth = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const requireAdmin = (req, _res, next) => {
  if (req.user?.role !== 'admin') return next({ status: 403, message: 'Forbidden' });
  next();
};