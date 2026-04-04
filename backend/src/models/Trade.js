import mongoose from 'mongoose';

const tradeSchema = new mongoose.Schema({
  orderId: { type: Number, required: true },
  sellerAddress: { type: String, required: true, lowercase: true, index: true },
  buyerAddress: { type: String, required: true, lowercase: true, index: true },
  tokenAmount: { type: String, required: true }, // BigInt string
  ethPaid: { type: String, required: true },     // BigInt string
  timestamp: { type: Date, required: true, default: Date.now }
});

tradeSchema.index({ sellerAddress: 1, timestamp: -1 });
tradeSchema.index({ buyerAddress: 1, timestamp: -1 });

export const Trade = mongoose.model('Trade', tradeSchema);
