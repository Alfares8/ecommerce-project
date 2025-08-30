import Product from '../models/Product.js';
import Category from '../models/Category.js';

export const list = async (req, res) => {
  const { q, category, page = 1, limit = 12 } = req.query;
  const filter = { active: true };
  if (q) filter.name = { $regex: q, $options: 'i' };
  if (category) {
    const cat = await Category.findOne({ slug: category });
    if (cat) filter.categories = cat._id;
  }
  const skip = (Number(page)-1) * Number(limit);
  const [items, total] = await Promise.all([
    Product.find(filter).skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
    Product.countDocuments(filter)
  ]);
  res.json({ items, total, page: Number(page), pages: Math.ceil(total/Number(limit)) });
};

export const getOne = async (req, res) => {
  const p = await Product.findById(req.params.id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  res.json(p);
};

export const create = async (req, res) => {
  const { name, price, description, image_url, stock, categories = [], variations = [] } = req.body;
  if (!name || price == null) return res.status(400).json({ error: 'Invalid data' });
  const catDocs = await Category.find({ slug: { $in: categories } });
  const product = await Product.create({
    name, price, description, image_url, stock: stock ?? 0, categories: catDocs.map(c=>c._id), variations
  });
  res.status(201).json(product);
};

export const update = async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!product) return res.status(404).json({ error: 'Not found' });
  res.json(product);
};

export const remove = async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ success: true });
};