import mongoose from 'mongoose';

const tradeSchema = new mongoose.Schema({
  orderId: { type: Number, required: true },
  sellerAddress: { type: String, required: true, lowercase: true, index: true },
  buyerAddress: { type: String, required: true, lowercase: true, index: true },
  tokenAmount: { type: String, required: true }, // BigInt string
  ethPaid: { type: String, required: true },     // BigInt string
}, { timestamps: true });   // adds createdAt + updatedAt automatically

tradeSchema.index({ sellerAddress: 1, createdAt: -1 });
tradeSchema.index({ buyerAddress: 1, createdAt: -1 });

export const Trade = mongoose.model('Trade', tradeSchema);
