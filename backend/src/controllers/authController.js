import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { config } from '../config.js';

export const register = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password || password.length < 8) return res.status(400).json({ error: 'Invalid data' });
  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ error: 'Email exists' });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, passwordHash, role: 'customer' });
  res.status(201).json({ id: user._id, email: user.email });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.passwordHash)))
    return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, config.jwtSecret, { expiresIn: '7d' });
  res.json({ token, user: { id: user._id, email: user.email, role: user.role } });
};

export const me = async (req, res) => {
  res.json({ user: { id: req.user.id, email: req.user.email, role: req.user.role } });
};