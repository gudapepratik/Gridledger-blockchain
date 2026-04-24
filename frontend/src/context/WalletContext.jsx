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

  const ensureSepoliaNetwork = useCallback(async () => {
    if (!window.ethereum) return false
    const hexChainId = '0x' + SUPPORTED_CHAIN_ID.toString(16)
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: hexChainId }],
      })
      return true
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: hexChainId,
                chainName: 'Sepolia Test Network',
                nativeCurrency: { name: 'Sepolia ETH', symbol: 'ETH', decimals: 18 },
                rpcUrls: ['https://sepolia.infura.io/v3/'],
                blockExplorerUrls: ['https://sepolia.etherscan.io'],
              },
            ],
          })
          return true
        } catch (addError) {
          console.error('Failed to add Sepolia network:', addError)
        }
      }
      console.error('Failed to switch to Sepolia network:', switchError)
      return false
    }
  }, [])

  const connect = useCallback(async () => {
    console.log('--- Connecting Wallet ---')
    if (!window.ethereum) {
      setError('MetaMask not installed. Please install the MetaMask extension.')
      return
    }

    setIsConnecting(true)
    setError(null)
    try {
      // First ensure we are on the right network
      await ensureSepoliaNetwork()

      const web3Provider = new ethers.BrowserProvider(window.ethereum)
      console.log('Provider initialized')
      const accounts = await web3Provider.send('eth_requestAccounts', [])
      console.log('Accounts received from MetaMask:', accounts)
      const network = await web3Provider.getNetwork()
      console.log('Network connected:', network.name, network.chainId)
      const web3Signer = await web3Provider.getSigner()
      console.log('Signer address:', await web3Signer.getAddress())

      setProvider(web3Provider)
      setSigner(web3Signer)
      setAccount(accounts[0])
      setChainId(Number(network.chainId))
    } catch (e) {
      console.error('Connection error:', e)
      setError(e.message || 'Failed to connect wallet.')
    } finally {
      setIsConnecting(false)
    }
  }, [ensureSepoliaNetwork])

  const disconnect = useCallback(() => {
    console.log('--- Disconnecting Wallet ---')
    setAccount(null)
    setProvider(null)
    setSigner(null)
    setChainId(null)
  }, [])

  const handleAccountChange = useCallback(async (accounts) => {
    console.log('--- Account Changed Event ---', accounts)
    if (accounts.length === 0) {
      disconnect()
    } else {
      try {
        await ensureSepoliaNetwork()
        const web3Provider = new ethers.BrowserProvider(window.ethereum)
        const web3Signer = await web3Provider.getSigner()
        const addr = await web3Signer.getAddress()
        console.log('New signer synced:', addr)
        setProvider(web3Provider)
        setSigner(web3Signer)
        setAccount(accounts[0])
      } catch (e) {
        console.error("Failed to sync account change:", e)
        setAccount(accounts[0]) // Fallback to just address
      }
    }
  }, [disconnect, ensureSepoliaNetwork])

  const handleChainChange = useCallback((hexChainId) => {
    const cid = parseInt(hexChainId, 16)
    console.log('--- Chain Changed Event ---', cid)
    setChainId(cid)
  }, [])

  useEffect(() => {
    if (!window.ethereum) return

    console.log('Setting up WalletContext listeners...')

    // Auto-connect if previously connected
    window.ethereum.request({ method: 'eth_accounts' }).then(accounts => {
      console.log('Initial accounts check:', accounts)
      if (accounts.length > 0) connect()
    })

    window.ethereum.on('accountsChanged', handleAccountChange)
    window.ethereum.on('chainChanged', handleChainChange)
    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountChange)
      window.ethereum.removeListener('chainChanged', handleChainChange)
    }
  }, [connect, handleAccountChange, handleChainChange])

  const switchAccount = useCallback(async () => {
    console.log('--- Requesting Account Switch ---')
    if (!window.ethereum) return
    try {
      // Force MetaMask to show the account selection menu
      await window.ethereum.request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }]
      })
      // After permissions are granted/updated, reconnect
      await connect()
    } catch (e) {
      console.error('Failed to switch account:', e)
    }
  }, [connect])

  const truncateAddress = (addr) =>
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : ''

  return (
    <WalletContext.Provider value={{
      account, provider, signer, chainId,
      isConnected, isConnecting, isCorrectChain,
      error, connect, disconnect, switchAccount, truncateAddress
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
