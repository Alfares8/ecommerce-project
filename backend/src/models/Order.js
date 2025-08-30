import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name: String,
  quantity: { type: Number, min: 1 },
  price: { type: Number, min: 0 }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [itemSchema],
  total: { type: Number, min: 0 },
  status: { type: String, enum: ['pending','paid','shipped','delivered','canceled'], default: 'paid' },
  payment_id: String
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);