import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

import { startSimulation } from './services/simulation.js';
import { startIndexer }    from './services/indexer.js';
import { MeterReading }    from './models/MeterReading.js';
import { Order }           from './models/Order.js';
import { Trade }           from './models/Trade.js';
import { User }            from './models/User.js';

const app        = express();
const httpServer = createServer(app);
const io         = new Server(httpServer, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

// ─── Health / Ping ───────────────────────────────────────────────
app.get('/api/ping', (_req, res) => res.json({ pong: true, ts: Date.now() }));

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    contracts: {
      token:  process.env.CONTRACT_ADDRESS_TOKEN  || null,
      market: process.env.CONTRACT_ADDRESS_MARKET || null,
    },
  });
});

// ─── Users ───────────────────────────────────────────────────────
// Register / upsert a user wallet (called when they connect)
app.post('/api/users', async (req, res) => {
  try {
    const { walletAddress, displayName, peakKwCapacity } = req.body;
    if (!walletAddress) return res.status(400).json({ error: 'walletAddress required' });

    const user = await User.findOneAndUpdate(
      { walletAddress: walletAddress.toLowerCase() },
      { $setOnInsert: { walletAddress: walletAddress.toLowerCase(), peakKwCapacity: peakKwCapacity || 5 },
        $set: displayName ? { displayName } : {} },
      { upsert: true, new: true }
    );
    res.json({ success: true, data: user });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Update user settings
app.patch('/api/users/:address', async (req, res) => {
  try {
    const { displayName, peakKwCapacity } = req.body;
    const user = await User.findOneAndUpdate(
      { walletAddress: req.params.address.toLowerCase() },
      { $set: { ...(displayName && { displayName }), ...(peakKwCapacity && { peakKwCapacity }) } },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true, data: user });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── Meter Readings ───────────────────────────────────────────────
app.get('/api/readings', async (req, res) => {
  try {
    const { address, limit = 50, skip = 0 } = req.query;
    const filter = address ? { walletAddress: address.toLowerCase() } : {};
    const readings = await MeterReading
      .find(filter)
      .sort({ timestamp: -1 })
      .skip(Number(skip))
      .limit(Number(limit));
    res.json({ success: true, data: readings });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Stats for a specific wallet (today's generation & consumption)
app.get('/api/readings/stats/:address', async (req, res) => {
  try {
    const addr = req.params.address.toLowerCase();
    const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);

    const [genResult, conResult] = await Promise.all([
      MeterReading.aggregate([
        { $match: { walletAddress: addr, type: 'generation', timestamp: { $gte: startOfDay } } },
        { $group: { _id: null, totalKwh: { $sum: '$kwhAmount' }, totalTokens: { $sum: { $toLong: '$tokenAmount' } } } }
      ]),
      MeterReading.aggregate([
        { $match: { walletAddress: addr, type: 'consumption', timestamp: { $gte: startOfDay } } },
        { $group: { _id: null, totalKwh: { $sum: '$kwhAmount' }, totalTokens: { $sum: { $toLong: '$tokenAmount' } } } }
      ]),
    ]);

    res.json({
      success: true,
      data: {
        generatedKwh:  genResult[0]?.totalKwh  ?? 0,
        consumedKwh:   conResult[0]?.totalKwh  ?? 0,
        generatedTokens: genResult[0]?.totalTokens?.toString() ?? '0',
        consumedTokens:  conResult[0]?.totalTokens?.toString() ?? '0',
      }
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── Orders ──────────────────────────────────────────────────────
app.get('/api/orders', async (req, res) => {
  try {
    const { status = 0, limit = 50 } = req.query;                    // status 0 = Active
    const orders = await Order
      .find({ status: Number(status) })
      .sort({ createdAt: -1 })
      .limit(Number(limit));
    res.json({ success: true, data: orders });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/orders/seller/:address', async (req, res) => {
  try {
    const orders = await Order
      .find({ sellerAddress: req.params.address.toLowerCase() })
      .sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── Trades ──────────────────────────────────────────────────────
app.get('/api/trades', async (req, res) => {
  try {
    const { address, limit = 50, skip = 0 } = req.query;
    const filter = address
      ? { $or: [{ buyerAddress: address.toLowerCase() }, { sellerAddress: address.toLowerCase() }] }
      : {};
    const trades = await Trade
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit));
    res.json({ success: true, data: trades });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── Network stats (aggregate) ───────────────────────────────────
app.get('/api/stats', async (req, res) => {
  try {
    const [orderCount, activeSellers, tradeVol] = await Promise.all([
      Order.countDocuments({ status: 0 }),
      Order.distinct('sellerAddress', { status: 0 }),
      Trade.aggregate([
        { $group: { _id: null, totalKwh: { $sum: { $divide: [{ $toLong: '$tokenAmount' }, 1e18] } }, totalEth: { $sum: { $divide: [{ $toLong: '$ethPaid' }, 1e18] } } } }
      ]),
    ]);
    res.json({
      success: true,
      data: {
        activeListings: orderCount,
        activeTraders:  activeSellers.length,
        totalTradedKwh: tradeVol[0]?.totalKwh?.toFixed(2) ?? '0',
        totalEth:       tradeVol[0]?.totalEth?.toFixed(4) ?? '0',
      }
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── Socket.io ───────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

// ─── Boot ────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✔ Connected to MongoDB');
      startSimulation();
      startIndexer(io);
    } else {
      console.warn('⚠  No MONGODB_URI — skipping DB & services');
    }
    httpServer.listen(PORT, () => console.log(`✔ Server running on port ${PORT}`));
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
