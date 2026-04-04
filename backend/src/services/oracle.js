import { ethers } from 'ethers';
import { MeterReading } from '../models/MeterReading.js';

let provider, wallet, energyTokenContract;

const initOracle = () => {
  if (!process.env.NETWORK_URL && !process.env.VITE_RPC_URL) return false;
  if (!process.env.CONTRACT_ADDRESS_TOKEN) return false;
  
  // Abi definition for EnergyToken mint/burn
  const abi = [
    "function mint(address to, uint256 amount, bytes32 meterReadingId)",
    "function burn(address from, uint256 amount, bytes32 meterReadingId)"
  ];
  
  const rpcUrl = process.env.NETWORK_URL || process.env.VITE_RPC_URL;
  provider = new ethers.JsonRpcProvider(rpcUrl);
  wallet = new ethers.Wallet(process.env.ORACLE_PRIVATE_KEY, provider);
  energyTokenContract = new ethers.Contract(process.env.CONTRACT_ADDRESS_TOKEN, abi, wallet);
  return true;
};

export const processPendingReadings = async () => {
  if (!wallet && !initOracle()) {
    console.log("Oracle not initialized - check ENV vars.");
    return;
  }

  const pendings = await MeterReading.find({ status: 'pending' }).limit(5); 
  for (const doc of pendings) {
    try {
      let tx;
      if (doc.type === 'generation') {
        tx = await energyTokenContract.mint(doc.walletAddress, BigInt(doc.tokenAmount), doc.readingId);
      } else if (doc.type === 'consumption') {
        tx = await energyTokenContract.burn(doc.walletAddress, BigInt(doc.tokenAmount), doc.readingId);
      }
      
      if (tx) {
        doc.status = 'confirmed';
        doc.txHash = tx.hash;
        await doc.save();
        console.log(`Oracle signed ${doc.type} for ${doc.walletAddress}. Hash: ${tx.hash}`);
      }
    } catch (error) {
      console.error(`Oracle failed to sign for ${doc.readingId}: ${error.reason || error.message}`);
      if (error.message.includes('insufficient funds') || error.message.includes('revert') || error.message.includes('Missing or invalid role')) {
        doc.status = 'failed';
        await doc.save();
      }
    }
  }
};
