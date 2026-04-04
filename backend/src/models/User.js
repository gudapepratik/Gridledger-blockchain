import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  walletAddress: { type: String, required: true, unique: true, index: true, lowercase: true },
  displayName: String,
  peakKwCapacity: { type: Number, default: 5 },
  createdAt: { type: Date, default: Date.now },
  lastSeen: { type: Date, default: Date.now }
});

export const User = mongoose.model('User', userSchema);
