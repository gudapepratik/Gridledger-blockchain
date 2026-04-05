import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const client = axios.create({
  baseURL: BASE,
  timeout: 10000,
})

// ── Users ──────────────────────────────────────────────
export const registerUser = (walletAddress) =>
  client.post('/api/users', { walletAddress }).then(r => r.data)

export const updateUser = (address, data) =>
  client.patch(`/api/users/${address}`, data).then(r => r.data)

// ── Readings ───────────────────────────────────────────
export const getReadings = (address, limit = 50) =>
  client.get('/api/readings', { params: { address, limit } }).then(r => r.data)

export const getReadingStats = (address) =>
  client.get(`/api/readings/stats/${address}`).then(r => r.data)

// ── Orders ──────────────────────────────────────────────
export const getActiveOrders = (limit = 50) =>
  client.get('/api/orders', { params: { status: 0, limit } }).then(r => r.data)

export const getSellerOrders = (address) =>
  client.get(`/api/orders/seller/${address}`).then(r => r.data)

// ── Trades ──────────────────────────────────────────────
export const getTrades = (address, limit = 50) =>
  client.get('/api/trades', { params: { address, limit } }).then(r => r.data)

// ── Network stats ───────────────────────────────────────
export const getNetworkStats = () =>
  client.get('/api/stats').then(r => r.data)

export const ping = () =>
  client.get('/api/ping').then(r => r.data)
