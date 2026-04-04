import { useState } from 'react'
import { useWallet } from '../context/WalletContext'
import { ArrowRight, X, Plus } from 'lucide-react'

const DEMO_ORDERS = [
  { orderId:0, seller:'0xAbcd…1234', tokenAmount:'100000000000000000000', pricePerToken:'1000000000000000', filledAmount:'20000000000000000000' },
  { orderId:1, seller:'0xDef0…5678', tokenAmount:'50000000000000000000',  pricePerToken:'1200000000000000', filledAmount:'0' },
  { orderId:2, seller:'0x1234…abcd', tokenAmount:'200000000000000000000', pricePerToken:'900000000000000',  filledAmount:'80000000000000000000' },
  { orderId:3, seller:'0x9876…dcba', tokenAmount:'30000000000000000000',  pricePerToken:'1500000000000000', filledAmount:'0' },
  { orderId:4, seller:'0xFeed…cafe', tokenAmount:'75000000000000000000',  pricePerToken:'1100000000000000', filledAmount:'25000000000000000000' },
]
const eth = (wei) => (Number(BigInt(wei))/1e18).toFixed(4)

export default function Marketplace() {
  const { isConnected, connect } = useWallet()
  const [buyModal, setBuyModal] = useState(null)
  const [sellModal, setSellModal] = useState(false)
  const [buyAmt, setBuyAmt] = useState('')
  const [sellAmt, setSellAmt] = useState('')
  const [sellPrice, setSellPrice] = useState('')
  const [sortBy, setSortBy] = useState('price')
  const orders = DEMO_ORDERS

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
            <button className="btn btn-ink" onClick={()=>isConnected?setSellModal(true):connect()}>
              <Plus size={14}/> Sell Energy
            </button>
          </div>
        </div>

        {/* Price band */}
        <div className="fu d1" style={{
          background:'var(--lime)', borderRadius:'var(--r-lg)', padding:'18px 24px', marginBottom:12,
          display:'flex', gap:36, flexWrap:'wrap', alignItems:'center'
        }}>
          {[
            { l:'Best Ask', v:'0.0009 ETH/kWh' },
            { l:'Avg Price', v:'0.0011 ETH/kWh' },
            { l:'Best Bid', v:'0.0015 ETH/kWh' },
            { l:'24h Volume', v:'420 ERT' },
          ].map(({l,v},i)=>(
            <div key={i}>
              <div style={{ fontSize:10, fontWeight:700, color:'rgba(0,31,63,0.5)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:3 }}>{l}</div>
              <div style={{ fontFamily:'var(--display)', fontWeight:800, fontSize:15, color:'var(--ink)' }}>{v}</div>
            </div>
          ))}
        </div>

        {/* Table wrapper */}
        <div className="fu d2 bento-cell cell-cream market-table-wrap" style={{ overflow:'hidden' }}>

          {/* Desktop header */}
          <div className="market-table-header" style={{
            display:'grid', gridTemplateColumns:'40px 1fr 120px 120px 120px 100px 48px',
            padding:'11px 22px', background:'var(--paper)', borderBottom:'1px solid var(--ink-rule)',
          }}>
            {['#','Seller','Available','Price/kWh','Total Cost','Filled',''].map((h,i)=>(
              <div key={i} style={{ fontSize:10, fontWeight:700, color:'var(--ink-dim)', textTransform:'uppercase', letterSpacing:'0.07em' }}>{h}</div>
            ))}
          </div>

          {/* Rows */}
          {orders.map((o, i) => {
            const total = BigInt(o.tokenAmount)
            const filled = BigInt(o.filledAmount)
            const remaining = total - filled
            const pct = Number((filled*100n)/total)
            const remErt = (Number(remaining)/1e18).toFixed(2)
            const priceEth = eth(o.pricePerToken)
            const totalCost = ((Number(remaining)/1e18)*(Number(BigInt(o.pricePerToken))/1e18)).toFixed(4)

            return (
              <div key={o.orderId}
                className="market-row"
                style={{
                  display:'grid', gridTemplateColumns:'40px 1fr 120px 120px 120px 100px 48px',
                  padding:'16px 22px', borderBottom: i<orders.length-1?'1px solid var(--ink-rule)':'none',
                  alignItems:'center', transition:'background 0.14s', cursor:'pointer',
                }}
                onMouseEnter={e=>e.currentTarget.style.background='var(--paper)'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                onClick={()=>{if(!isConnected){connect();return}setBuyModal(o);setBuyAmt('')}}
              >
                <div style={{ fontFamily:'var(--display)', fontSize:11, fontWeight:700, color:'var(--ink-dim)' }}>
                  {String(i+1).padStart(2,'0')}
                </div>
                <div className="market-row-meta">
                  <code style={{ fontSize:13, fontFamily:'monospace', color:'var(--text)' }}>{o.seller}</code>
                  <span className="tag tag-green" style={{ display:'none' }}>Active</span>
                </div>
                <div style={{ fontFamily:'var(--display)', fontWeight:700, fontSize:14 }}>{remErt} <span style={{ fontSize:11, color:'var(--ink-dim)' }}>ERT</span></div>
                <div style={{ fontFamily:'var(--display)', fontWeight:600, fontSize:14 }}>{priceEth} ETH</div>
                <div style={{ fontSize:13, color:'var(--ink-dim)' }}>{totalCost} ETH</div>
                <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                  <div className="progress-track" style={{ width:'85%' }}>
                    <div className="progress-fill" style={{ width:`${pct}%` }}/>
                  </div>
                  <div style={{ fontSize:10, color:'var(--ink-dim)' }}>{pct}%</div>
                </div>
                <button className="arrow-btn" onClick={e=>{e.stopPropagation();if(!isConnected){connect();return}setBuyModal(o);setBuyAmt('')}}>
                  <ArrowRight size={13}/>
                </button>
              </div>
            )
          })}
        </div>

        {/* Mobile card note */}
        <div style={{ marginTop:8, fontSize:12, color:'var(--ink-dim)', display:'none' }} className="mobile-scroll-hint">
          Tap a row to buy · Scroll ↔ to see all columns
        </div>

      </div>

      {/* Buy Modal */}
      {buyModal && (
        <div className="modal-bg" onClick={()=>setBuyModal(null)}>
          <div className="modal-box" onClick={e=>e.stopPropagation()}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:22 }}>
              <div>
                <div className="section-eyebrow" style={{ marginBottom:5 }}>Order #{buyModal.orderId}</div>
                <h2 style={{ fontSize:24, fontWeight:800 }}>Purchase Energy</h2>
              </div>
              <button className="arrow-btn" onClick={()=>setBuyModal(null)}><X size={14}/></button>
            </div>
            <div style={{ background:'var(--paper)', borderRadius:'var(--r-md)', padding:'14px 18px', marginBottom:18 }}>
              {[
                { l:'Seller', v:<code style={{ fontFamily:'monospace', fontSize:12 }}>{buyModal.seller}</code> },
                { l:'Price per kWh', v:<strong style={{ fontFamily:'var(--display)', fontSize:13 }}>{eth(buyModal.pricePerToken)} ETH</strong> },
                { l:'Available', v:<strong style={{ fontFamily:'var(--display)', fontSize:13, color:'var(--forest)' }}>{((Number(BigInt(buyModal.tokenAmount))-Number(BigInt(buyModal.filledAmount)))/1e18).toFixed(2)} ERT</strong> },
              ].map(({l,v},i)=>(
                <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: i<2?8:0 }}>
                  <span style={{ fontSize:13, color:'var(--ink-dim)' }}>{l}</span>{v}
                </div>
              ))}
            </div>
            <div style={{ marginBottom:18 }}>
              <label style={{ fontSize:13, fontWeight:600, display:'block', marginBottom:7 }}>Quantity (ERT)</label>
              <input className="input" type="number" placeholder="e.g. 10" value={buyAmt} onChange={e=>setBuyAmt(e.target.value)} min="1"/>
            </div>
            {buyAmt && Number(buyAmt)>0 && (
              <div style={{ background:'var(--lime)', borderRadius:'var(--r-md)', padding:'12px 18px', marginBottom:18 }}>
                <div style={{ fontSize:10, fontWeight:700, color:'rgba(0,31,63,0.5)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:3 }}>You Pay</div>
                <div style={{ fontFamily:'var(--display)', fontWeight:800, fontSize:22, color:'var(--ink)' }}>
                  {(Number(buyAmt)*Number(BigInt(buyModal.pricePerToken))/1e18).toFixed(6)} ETH
                </div>
              </div>
            )}
            <button className="btn btn-ink" style={{ width:'100%', justifyContent:'center', padding:13, fontSize:14 }}>
              Confirm Purchase <ArrowRight size={15}/>
            </button>
          </div>
        </div>
      )}

      {/* Sell Modal */}
      {sellModal && (
        <div className="modal-bg" onClick={()=>setSellModal(false)}>
          <div className="modal-box" onClick={e=>e.stopPropagation()}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:22 }}>
              <div>
                <div className="section-eyebrow" style={{ marginBottom:5 }}>New Listing</div>
                <h2 style={{ fontSize:24, fontWeight:800 }}>Sell Energy</h2>
              </div>
              <button className="arrow-btn" onClick={()=>setSellModal(false)}><X size={14}/></button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div>
                <label style={{ fontSize:13, fontWeight:600, display:'block', marginBottom:7 }}>Amount to sell (ERT)</label>
                <input className="input" type="number" placeholder="e.g. 100" value={sellAmt} onChange={e=>setSellAmt(e.target.value)}/>
              </div>
              <div>
                <label style={{ fontSize:13, fontWeight:600, display:'block', marginBottom:7 }}>Price per token (ETH)</label>
                <input className="input" type="number" placeholder="e.g. 0.001" value={sellPrice} onChange={e=>setSellPrice(e.target.value)} step="0.0001"/>
              </div>
              {sellAmt && sellPrice && (
                <div style={{ background:'var(--lime)', borderRadius:'var(--r-md)', padding:'12px 18px' }}>
                  <div style={{ fontSize:10, fontWeight:700, color:'rgba(0,31,63,0.5)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:3 }}>Estimated Revenue</div>
                  <div style={{ fontFamily:'var(--display)', fontWeight:800, fontSize:22, color:'var(--ink)' }}>
                    {(Number(sellAmt)*Number(sellPrice)).toFixed(4)} ETH
                  </div>
                </div>
              )}
              <button className="btn btn-ink" style={{ justifyContent:'center', padding:13, fontSize:14 }}>
                List Energy <ArrowRight size={15}/>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
