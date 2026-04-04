import mongoose from 'mongoose';

const meterReadingSchema = new mongoose.Schema({
  readingId: { type: String, required: true, unique: true, index: true },
  walletAddress: { type: String, required: true, index: true, lowercase: true },
  timestamp: { type: Date, required: true, index: true },
  type: { type: String, required: true, enum: ['generation', 'consumption'] },
  kwhAmount: { type: Number, required: true },
  tokenAmount: { type: String, required: true },
  txHash: { type: String },
  status: { type: String, required: true, enum: ['pending', 'confirmed', 'failed'], default: 'pending' }
});

meterReadingSchema.index({ walletAddress: 1, timestamp: -1 });
meterReadingSchema.index({ status: 1, timestamp: 1 });

export const MeterReading = mongoose.model('MeterReading', meterReadingSchema);
