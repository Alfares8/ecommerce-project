import mongoose from 'mongoose';

const variationSchema = new mongoose.Schema({
  size: String,
  color: String,
  stock: { type: Number, default: 0, min: 0 }
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, default: 0, min: 0 },
  image_url: String,
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  variations: [variationSchema],
  active: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Product', productSchema);