import { ethers } from 'ethers';
import { Order } from '../models/Order.js';
import { Trade } from '../models/Trade.js';

export const startIndexer = (io) => {
  if (!process.env.CONTRACT_ADDRESS_MARKET) return;
  const rpcUrl = process.env.NETWORK_URL || process.env.VITE_RPC_URL;
  if (!rpcUrl) return;

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  
  const abi = [
    "event OrderCreated(uint256 indexed orderId, address indexed seller, uint256 tokenAmount, uint256 pricePerToken)",
    "event OrderFulfilled(uint256 indexed orderId, address indexed buyer, uint256 amountFilled, uint256 ethPaid)",
    "event OrderCancelled(uint256 indexed orderId)"
  ];
  
  const market = new ethers.Contract(process.env.CONTRACT_ADDRESS_MARKET, abi, provider);

  market.on("OrderCreated", async (orderId, seller, tokenAmount, pricePerToken, event) => {
    try {
      await Order.create({
        orderId: Number(orderId),
        sellerAddress: seller,
        tokenAmount: tokenAmount.toString(),
        pricePerToken: pricePerToken.toString(),
        status: 0,
        createdAt: new Date()
      });
      console.log(`Indexed OrderCreated: ${orderId}`);
      io.emit('order:created', { orderId: Number(orderId), seller, tokenAmount: tokenAmount.toString(), pricePerToken: pricePerToken.toString() });
    } catch(e) {
      console.error(e);
    }
  });

  market.on("OrderFulfilled", async (orderId, buyer, amountFilled, ethPaid, event) => {
    try {
      // In ethers v6, the event listener receives the Log object directly as the
      // last argument — NOT a wrapper. event.log.transactionHash would throw.
      const txHash = event?.transactionHash ?? event?.log?.transactionHash ?? null;

      const order = await Order.findOne({ orderId: Number(orderId) });
      if (order) {
        const prevFilled = BigInt(order.filledAmount || '0');
        order.filledAmount = (prevFilled + BigInt(amountFilled)).toString();
        if (BigInt(order.filledAmount) >= BigInt(order.tokenAmount)) {
          order.status = 1; // Filled
        }
        await order.save();
      }

      await Trade.create({
        orderId: Number(orderId),
        sellerAddress: order ? order.sellerAddress : 'unknown',
        buyerAddress: buyer,
        tokenAmount: amountFilled.toString(),
        ethPaid: ethPaid.toString(),
        txHash,
      });

      console.log(`Indexed OrderFulfilled: ${orderId}`);
      // Always emit — even if DB ops above had issues the frontend must update
      io.emit('order:fulfilled', { orderId: Number(orderId), buyer, amountFilled: amountFilled.toString(), ethPaid: ethPaid.toString() });
    } catch(e) {
      console.error('OrderFulfilled indexer error:', e);
      // Still emit so frontend refreshes even on DB error
      io.emit('order:fulfilled', { orderId: Number(orderId), buyer, amountFilled: amountFilled.toString(), ethPaid: ethPaid.toString() });
    }
  });

  market.on("OrderCancelled", async (orderId, event) => {
    try {
      const order = await Order.findOne({ orderId: Number(orderId) });
      if (order) {
        order.status = 2; // Cancelled
        await order.save();
      }
      console.log(`Indexed OrderCancelled: ${orderId}`);
      io.emit('order:cancelled', { orderId: Number(orderId) });
    } catch(e) {
      console.error(e);
    }
  });
  
  console.log("Marketplace event indexer started.");
};
