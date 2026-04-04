import { MeterReading } from '../models/MeterReading.js';
import { User } from '../models/User.js';
import { processPendingReadings } from './oracle.js';

export const startSimulation = () => {
  const interval = process.env.SIMULATION_INTERVAL_MS || 30000;
  
  setInterval(async () => {
    try {
      console.log('--- Simulation Cycle Start ---');
      const users = await User.find({});
      const hour = new Date().getHours();
      
      for (const user of users) {
        // Solar Generation = peakKw * Math.max(0, Math.sin((hour - 6) * Math.PI / 12))
        const peakKw = user.peakKwCapacity || 5;
        let gen = peakKw * Math.max(0, Math.sin((hour - 6) * Math.PI / 12));
        
        // Add minimal noise
        gen = gen * (0.9 + Math.random() * 0.2);
        
        // Base consumption
        let cons = 0.5 + Math.random() * 0.5;
        // Peak hours modifier
        if ((hour >= 7 && hour <= 9) || (hour >= 18 && hour <= 21)) {
          cons += 1.5 + Math.random();
        }

        if (gen > 0.1) {
          await createReading(user.walletAddress, 'generation', gen);
        }
        if (cons > 0.1) {
          await createReading(user.walletAddress, 'consumption', cons);
        }
      }

      await processPendingReadings();
      
    } catch (e) {
      console.error('Simulation error:', e);
    }
  }, interval);
};

async function createReading(wallet, type, kwh) {
  const readingId = '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
  const amount = Math.floor(kwh * 1000) / 1000;
  
  const tokenAmt = BigInt(Math.floor(amount * 1000)) * BigInt(10**15);
  
  await MeterReading.create({
    readingId,
    walletAddress: wallet,
    timestamp: new Date(),
    type,
    kwhAmount: amount,
    tokenAmount: tokenAmt.toString()
  });
}
