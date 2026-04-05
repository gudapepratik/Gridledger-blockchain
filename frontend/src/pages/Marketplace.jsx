import { useState, useEffect, useCallback } from 'react'
import { useWallet } from '../context/WalletContext'
import { useContracts } from '../hooks/useContracts'
import { useSocket } from '../hooks/useSocket'
import { getActiveOrders } from '../lib/api'
import { ethers } from 'ethers'
import { ArrowRight, X, Plus, RefreshCw, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

const fmtErt  = (wei) => (Number(BigInt(wei || '0')) / 1e18).toFixed(2)
const fmtEth  = (wei) => (Number(BigInt(wei || '0')) / 1e18).toFixed(4)
const fmtPrice = (wei) => (Number(BigInt(wei || '0')) / 1e18).toFixed(6)

export default function Marketplace() {
  const { isConnected, account, connect, isCorrectChain } = useWallet()
  const { token, market, MARKET_ADDRESS } = useContracts()

  const [orders,      setOrders]      = useState([])
  const [loading,     setLoading]     = useState(false)
  const [buyModal,    setBuyModal]    = useState(null)
  const [sellModal,   setSellModal]   = useState(false)
  const [buyAmt,      setBuyAmt]      = useState('')
  const [sellAmt,     setSellAmt]     = useState('')
  const [sellPrice,   setSellPrice]   = useState('')
  const [txPending,   setTxPending]   = useState(false)
  const [sortBy,      setSortBy]      = useState('price')

  // ── Fetch active orders ─────────────────────────────────
  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getActiveOrders(50)
      if (res.success) {
        let list = res.data
        if (sortBy === 'price') list = [...list].sort((a, b) => Number(BigInt(a.pricePerToken) - BigInt(b.pricePerToken)))
        else                    list = [...list].sort((a, b) => Number(BigInt(b.tokenAmount) - BigInt(a.tokenAmount)))
        setOrders(list)
      }
    } catch (e) { console.warn('orders fetch err', e) }
    finally     { setLoading(false) }
  }, [sortBy])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  // Socket: refresh when new orders come in
  useSocket({
    'order:created':   () => fetchOrders(),
    'order:fulfilled': () => fetchOrders(),
    'order:cancelled': () => fetchOrders(),
  })

  // ── Buy ─────────────────────────────────────────────────
  const handleBuy = async () => {
    if (!market || !buyModal || !buyAmt) return
    if (!isCorrectChain) { toast.error('Switch to Sepolia Testnet'); return }

    const tokenWei = ethers.parseUnits(buyAmt, 18)
    const ethCost  = tokenWei * BigInt(buyModal.pricePerToken) / BigInt(1e18)

    setTxPending(true)
    const toastId = toast.loading('Waiting for MetaMask…')
    try {
      const tx = await market.buyOrder(buyModal.orderId, tokenWei, { value: ethCost })
      toast.loading('Transaction submitted…', { id: toastId })
      await tx.wait()
      toast.success(`Bought ${buyAmt} ERT!`, { id: toastId })
      setBuyModal(null); setBuyAmt('')
      fetchOrders()
    } catch (e) {
      toast.error(e.reason || e.message || 'Transaction failed', { id: toastId })
    } finally { setTxPending(false) }
  }

  // ── Sell (approve + createOrder) ────────────────────────
  const handleSell = async () => {
    if (!token || !market || !sellAmt || !sellPrice) return
    if (!isCorrectChain) { toast.error('Switch to Sepolia Testnet'); return }

    const tokenWei = ethers.parseUnits(sellAmt, 18)
    const priceWei = ethers.parseEther(sellPrice)

    setTxPending(true)
    const toastId = toast.loading('Step 1/2: Approving tokens…')
    try {
      const approveTx = await token.approve(MARKET_ADDRESS, tokenWei)
      await approveTx.wait()
      toast.loading('Step 2/2: Creating listing…', { id: toastId })

      const sellTx = await market.createOrder(tokenWei, priceWei)
      await sellTx.wait()
      toast.success('Listing created!', { id: toastId })
      setSellModal(false); setSellAmt(''); setSellPrice('')
      fetchOrders()
    } catch (e) {
      toast.error(e.reason || e.message || 'Transaction failed', { id: toastId })
    } finally { setTxPending(false) }
  }

  // ── Derived price stats ──────────────────────────────────
  const prices = orders.map(o => Number(BigInt(o.pricePerToken)) / 1e18)
  const bestAsk = prices.length ? Math.min(...prices).toFixed(6) : '—'
  const avgPrice = prices.length ? (prices.reduce((a,b)=>a+b,0)/prices.length).toFixed(6) : '—'
  const bestBid  = prices.length ? Math.max(...prices).toFixed(6) : '—'

  return (
    <div className="page">
      <div className="wrap" style={{ paddingTop:32, paddingBottom:60 }}>

        {/* Header */}
        <div className="fu page-header" style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:28, flexWrap:'wrap', gap:16 }}>
          <div>
            <div className="section-eyebrow" style={{ marginBottom:8 }}>P2P Energy Market</div>
            <h1 className="page-title" style={{ fontSize:48, fontWeight:800, letterSpacing:'-0.04em', lineHeight:1 }}>
              Energy<br/>Marketplace
            </h1>
          </div>
          <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
            <div style={{ display:'flex', background:'var(--paper)', borderRadius:'var(--r-pill)', padding:3, gap:2, border:'1px solid var(--ink-rule)' }}>
              {['price','volume'].map(s => (
                <button key={s} onClick={()=>setSortBy(s)} style={{
                  padding:'6px 14px', borderRadius:'var(--r-pill)', border:'none', cursor:'pointer',
                  fontFamily:'var(--font)', fontWeight:500, fontSize:13,
                  background: sortBy===s?'var(--text)':'transparent',
                  color: sortBy===s?'var(--bg)':'var(--ink-dim)',
                  transition:'all 0.18s',
                }}>{s==='price'?'By Price':'By Vol'}</button>
              ))}
            </div>
            <button className="btn btn-ghost" onClick={fetchOrders} title="Refresh" style={{ borderRadius:'var(--r-pill)', border:'1px solid var(--ink-rule)', padding:'8px 12px' }}>
              <RefreshCw size={14} style={{ animation: loading?'spin 1s linear infinite':'none' }}/>
            </button>
            <button className="btn btn-ink" onClick={()=>isConnected?setSellModal(true):connect()}>
              <Plus size={14}/> Sell Energy
            </button>
          </div>
        </div>

        {/* Wrong network warning */}
        {isConnected && !isCorrectChain && (
          <div style={{ background:'rgba(220,38,38,0.1)', border:'1px solid rgba(220,38,38,0.3)', borderRadius:'var(--r-md)', padding:'12px 20px', marginBottom:16, display:'flex', alignItems:'center', gap:10 }}>
            <AlertTriangle size={16} color="#b91c1c"/>
            <span style={{ fontSize:14, fontWeight:500, color:'#b91c1c' }}>Switch to <strong>Sepolia Testnet</strong> to start trading</span>
          </div>
        )}

        {/* Price band */}
        <div className="fu d1" style={{ background:'var(--lime)', borderRadius:'var(--r-lg)', padding:'18px 24px', marginBottom:12, display:'flex', gap:36, flexWrap:'wrap', alignItems:'center' }}>
          {[
            { l:'Best Ask', v: bestAsk !== '—' ? `${bestAsk} ETH/ERT` : '—' },
            { l:'Avg Price', v: avgPrice !== '—' ? `${avgPrice} ETH/ERT` : '—' },
            { l:'Best Bid',  v: bestBid  !== '—' ? `${bestBid} ETH/ERT`  : '—' },
            { l:'Active Listings', v: `${orders.length}` },
          ].map(({l,v},i)=>(
            <div key={i}>
              <div style={{ fontSize:10, fontWeight:700, color:'var(--on-lime-sub)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:3 }}>{l}</div>
              <div style={{ fontFamily:'var(--display)', fontWeight:800, fontSize:15, color:'var(--on-lime)' }}>{v}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="fu d2 bento-cell cell-cream" style={{ overflow:'hidden' }}>

          <div className="market-table-header" style={{ display:'grid', gridTemplateColumns:'40px 1fr 120px 130px 120px 100px 48px', padding:'11px 22px', background:'var(--paper)', borderBottom:'1px solid var(--ink-rule)' }}>
            {['#','Seller','Available','Price/ERT','Total Cost','Filled',''].map((h,i)=>(
              <div key={i} style={{ fontSize:10, fontWeight:700, color:'var(--ink-dim)', textTransform:'uppercase', letterSpacing:'0.07em' }}>{h}</div>
            ))}
          </div>

          {orders.length === 0 && (
            <div style={{ padding:'40px 24px', textAlign:'center', color:'var(--ink-dim)', fontSize:14 }}>
              {loading ? 'Loading listings…' : 'No active listings right now — be the first to sell energy!'}
            </div>
          )}

          {orders.map((o, i) => {
            const total = BigInt(o.tokenAmount)
            const filled = BigInt(o.filledAmount || '0')
            const remaining = total - filled
            const pct = total > 0n ? Number((filled*100n)/total) : 0
            const totalCost = ((Number(remaining)/1e18)*(Number(BigInt(o.pricePerToken))/1e18)).toFixed(6)
            const isMine = o.sellerAddress?.toLowerCase() === account?.toLowerCase()

            return (
              <div key={o.orderId} className="market-row"
                style={{ display:'grid', gridTemplateColumns:'40px 1fr 120px 130px 120px 100px 48px', padding:'16px 22px', borderBottom: i<orders.length-1?'1px solid var(--ink-rule)':'none', alignItems:'center', transition:'background 0.14s', cursor: isMine?'default':'pointer' }}
                onMouseEnter={e=>{ if(!isMine) e.currentTarget.style.background='var(--paper)' }}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                onClick={()=>{ if(isMine) return; if(!isConnected){connect();return}; setBuyModal(o); setBuyAmt('') }}>
                <div style={{ fontFamily:'var(--display)', fontSize:11, fontWeight:700, color:'var(--ink-dim)' }}>{String(i+1).padStart(2,'0')}</div>
                <div className="market-row-meta" style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <code style={{ fontSize:13, fontFamily:'monospace', color:'var(--text)' }}>
                    {o.sellerAddress?.slice(0,6)}…{o.sellerAddress?.slice(-4)}
                  </code>
                  {isMine && <span className="tag tag-blue">You</span>}
                </div>
                <div style={{ fontFamily:'var(--display)', fontWeight:700, fontSize:14 }}>{fmtErt(remaining.toString())} <span style={{ fontSize:11, color:'var(--ink-dim)' }}>ERT</span></div>
                <div style={{ fontFamily:'var(--display)', fontWeight:600, fontSize:14 }}>{fmtPrice(o.pricePerToken)} ETH</div>
                <div style={{ fontSize:13, color:'var(--ink-dim)' }}>{totalCost} ETH</div>
                <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                  <div className="progress-track" style={{ width:'85%' }}><div className="progress-fill" style={{ width:`${pct}%` }}/></div>
                  <div style={{ fontSize:10, color:'var(--ink-dim)' }}>{pct}%</div>
                </div>
                {!isMine
                  ? <button className="arrow-btn" onClick={e=>{e.stopPropagation();if(!isConnected){connect();return}setBuyModal(o);setBuyAmt('')}}><ArrowRight size={13}/></button>
                  : <div style={{ width:34 }}/>}
              </div>
            )
          })}
        </div>
      </div>

      {/* Buy Modal */}
      {buyModal && (
        <div className="modal-bg" onClick={()=>setBuyModal(null)}>
          <div className="modal-box" onClick={e=>e.stopPropagation()}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:22 }}>
              <div><div className="section-eyebrow" style={{ marginBottom:5 }}>Order #{buyModal.orderId}</div><h2 style={{ fontSize:24, fontWeight:800 }}>Purchase Energy</h2></div>
              <button className="arrow-btn" onClick={()=>setBuyModal(null)}><X size={14}/></button>
            </div>
            <div style={{ background:'var(--paper)', borderRadius:'var(--r-md)', padding:'14px 18px', marginBottom:18 }}>
              {[
                { l:'Seller', v:<code style={{ fontFamily:'monospace', fontSize:12 }}>{buyModal.sellerAddress?.slice(0,10)}…</code> },
                { l:'Price/ERT', v:<strong style={{ fontFamily:'var(--display)', fontSize:13 }}>{fmtPrice(buyModal.pricePerToken)} ETH</strong> },
                { l:'Available', v:<strong style={{ fontFamily:'var(--display)', fontSize:13, color:'var(--forest)' }}>{fmtErt((BigInt(buyModal.tokenAmount)-BigInt(buyModal.filledAmount||'0')).toString())} ERT</strong> },
              ].map(({l,v},i)=>(
                <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:i<2?8:0 }}>
                  <span style={{ fontSize:13, color:'var(--ink-dim)' }}>{l}</span>{v}
                </div>
              ))}
            </div>
            <div style={{ marginBottom:18 }}>
              <label style={{ fontSize:13, fontWeight:600, display:'block', marginBottom:7 }}>Quantity (ERT)</label>
              <input className="input" type="number" placeholder="e.g. 10" value={buyAmt} onChange={e=>setBuyAmt(e.target.value)} min="1" step="1"/>
            </div>
            {buyAmt && Number(buyAmt) > 0 && (
              <div style={{ background:'var(--lime)', borderRadius:'var(--r-md)', padding:'12px 18px', marginBottom:18 }}>
                <div style={{ fontSize:10, fontWeight:700, color:'rgba(0,31,63,0.5)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:3 }}>You Pay</div>
                <div style={{ fontFamily:'var(--display)', fontWeight:800, fontSize:22, color:'var(--ink)' }}>
                  {(Number(buyAmt) * Number(BigInt(buyModal.pricePerToken)) / 1e18).toFixed(6)} ETH
                </div>
              </div>
            )}
            <button className="btn btn-ink" style={{ width:'100%', justifyContent:'center', padding:13, fontSize:14 }}
              onClick={handleBuy} disabled={txPending || !buyAmt}>
              {txPending ? 'Confirming…' : 'Confirm Purchase'} <ArrowRight size={15}/>
            </button>
          </div>
        </div>
      )}

      {/* Sell Modal */}
      {sellModal && (
        <div className="modal-bg" onClick={()=>setSellModal(false)}>
          <div className="modal-box" onClick={e=>e.stopPropagation()}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:22 }}>
              <div><div className="section-eyebrow" style={{ marginBottom:5 }}>New Listing</div><h2 style={{ fontSize:24, fontWeight:800 }}>Sell Energy</h2></div>
              <button className="arrow-btn" onClick={()=>setSellModal(false)}><X size={14}/></button>
            </div>
            <div style={{ background:'rgba(219,230,76,0.15)', borderRadius:'var(--r-md)', padding:'12px 16px', marginBottom:18, fontSize:13, color:'var(--ink-dim)' }}>
              ⚠ This will first <strong>approve</strong> the Marketplace contract to transfer your ERT, then <strong>create</strong> the listing — two MetaMask confirmations.
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div>
                <label style={{ fontSize:13, fontWeight:600, display:'block', marginBottom:7 }}>Amount to sell (ERT)</label>
                <input className="input" type="number" placeholder="e.g. 100" value={sellAmt} onChange={e=>setSellAmt(e.target.value)}/>
              </div>
              <div>
                <label style={{ fontSize:13, fontWeight:600, display:'block', marginBottom:7 }}>Price per ERT (ETH)</label>
                <input className="input" type="number" placeholder="e.g. 0.001" value={sellPrice} onChange={e=>setSellPrice(e.target.value)} step="0.0001"/>
              </div>
              {sellAmt && sellPrice && (
                <div style={{ background:'var(--lime)', borderRadius:'var(--r-md)', padding:'12px 18px' }}>
                  <div style={{ fontSize:10, fontWeight:700, color:'rgba(0,31,63,0.5)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:3 }}>Estimated Revenue (if fully sold)</div>
                  <div style={{ fontFamily:'var(--display)', fontWeight:800, fontSize:22, color:'var(--ink)' }}>
                    {(Number(sellAmt)*Number(sellPrice)).toFixed(6)} ETH
                  </div>
                </div>
              )}
              <button className="btn btn-ink" style={{ justifyContent:'center', padding:13, fontSize:14 }}
                onClick={handleSell} disabled={txPending || !sellAmt || !sellPrice}>
                {txPending ? 'Confirming…' : 'List Energy'} <ArrowRight size={15}/>
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
