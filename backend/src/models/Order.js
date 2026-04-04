import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderId: { type: Number, required: true, unique: true, index: true },
  sellerAddress: { type: String, required: true, lowercase: true },
  tokenAmount: { type: String, required: true },
  pricePerToken: { type: String, required: true },
  filledAmount: { type: String, required: true, default: '0' },
  status: { type: Number, required: true }, // 0: Active, 1: Filled, 2: Cancelled
  createdAt: { type: Date, required: true }
});

orderSchema.index({ status: 1, createdAt: -1 });

export const Order = mongoose.model('Order', orderSchema);
