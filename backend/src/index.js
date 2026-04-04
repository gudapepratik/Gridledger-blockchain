import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
  }
});

app.use(cors());
app.use(express.json());

// API Endpoints
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    data: { 
      status: 'ok', 
      db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' 
    } 
  });
});

// Ping endpoint for cron job
app.get('/api/ping', (req, res) => {
  res.send('pong');
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

import { startSimulation } from './services/simulation.js';
import { startIndexer } from './services/indexer.js';
import { User } from './models/User.js';
import { MeterReading } from './models/MeterReading.js';
import { Order } from './models/Order.js';

const startServer = async () => {
  try {
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('Connected to MongoDB');
      
      startSimulation();
      startIndexer(io);
    } else {
      console.log('Skipping MongoDB connection (no URI)');
    }
    
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
};

startServer();
