import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'

const WalletContext = createContext(null)

const SUPPORTED_CHAIN_ID = 11155111 // Sepolia

export function WalletProvider({ children }) {
  const [account, setAccount] = useState(null)
  const [provider, setProvider] = useState(null)
  const [signer, setSigner] = useState(null)
  const [chainId, setChainId] = useState(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState(null)

  const isConnected = !!account
  const isCorrectChain = chainId === SUPPORTED_CHAIN_ID

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setError('MetaMask not installed. Please install the MetaMask extension.')
      return
    }
    setIsConnecting(true)
    setError(null)
    try {
      const web3Provider = new ethers.BrowserProvider(window.ethereum)
      const accounts = await web3Provider.send('eth_requestAccounts', [])
      const network = await web3Provider.getNetwork()
      const web3Signer = await web3Provider.getSigner()

      setProvider(web3Provider)
      setSigner(web3Signer)
      setAccount(accounts[0])
      setChainId(Number(network.chainId))
    } catch (e) {
      setError(e.message || 'Failed to connect wallet.')
    } finally {
      setIsConnecting(false)
    }
  }, [])

  const disconnect = useCallback(() => {
    setAccount(null)
    setProvider(null)
    setSigner(null)
    setChainId(null)
  }, [])

  useEffect(() => {
    if (!window.ethereum) return

    const handleAccountChange = (accounts) => {
      if (accounts.length === 0) disconnect()
      else setAccount(accounts[0])
    }
    const handleChainChange = (hexChainId) => {
      setChainId(parseInt(hexChainId, 16))
    }

    // Auto-connect if previously connected
    window.ethereum.request({ method: 'eth_accounts' }).then(accounts => {
      if (accounts.length > 0) connect()
    })

    window.ethereum.on('accountsChanged', handleAccountChange)
    window.ethereum.on('chainChanged', handleChainChange)
    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountChange)
      window.ethereum.removeListener('chainChanged', handleChainChange)
    }
  }, [connect, disconnect])

  const truncateAddress = (addr) =>
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : ''

  return (
    <WalletContext.Provider value={{
      account, provider, signer, chainId,
      isConnected, isConnecting, isCorrectChain,
      error, connect, disconnect, truncateAddress
    }}>
      {children}
    </WalletContext.Provider>
  )
}

export const useWallet = () => {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new Error('useWallet must be used inside WalletProvider')
  return ctx
}
