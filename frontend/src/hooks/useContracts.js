import { useMemo } from 'react'
import { ethers } from 'ethers'
import { useWallet } from '../context/WalletContext'
import EnergyTokenABI from '../abis/EnergyToken.json'
import MarketplaceABI from '../abis/Marketplace.json'

const TOKEN_ADDRESS  = import.meta.env.VITE_TOKEN_ADDRESS
const MARKET_ADDRESS = import.meta.env.VITE_MARKET_ADDRESS

/**
 * Returns ethers contract instances connected to the current signer.
 * If no signer (wallet not connected), returns read-only provider-connected instances.
 */
export function useContracts() {
  const { signer, provider } = useWallet()

  return useMemo(() => {
    const runner = signer || provider
    if (!runner) return { token: null, market: null }

    return {
      token:  new ethers.Contract(TOKEN_ADDRESS,  EnergyTokenABI, runner),
      market: new ethers.Contract(MARKET_ADDRESS, MarketplaceABI, runner),
      TOKEN_ADDRESS,
      MARKET_ADDRESS,
    }
  }, [signer, provider])
}
