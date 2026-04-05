import { useState, useEffect, useCallback } from 'react'
import { useWallet } from '../context/WalletContext'
import { getReadings, getReadingStats, getTrades } from '../lib/api'
import { ExternalLink, Download, RefreshCw } from 'lucide-react'
import { ethers } from 'ethers'

const fmtKwh  = (v) => Number(v).toFixed(2)
const fmtEth  = (wei) => (Number(BigInt(wei || '0')) / 1e18).toFixed(5)
const fmtErt  = (wei) => (Number(BigInt(wei || '0')) / 1e18).toFixed(2)
const EXPLORER = 'https://sepolia.etherscan.io'

export default function History() {
  const { isConnected, account } = useWallet()
  const [tab,       setTab]       = useState('readings')
  const [readings,  setReadings]  = useState([])
  const [trades,    setTrades]    = useState([])
  const [stats,     setStats]     = useState(null)
  const [loading,   setLoading]   = useState(false)

  const fetchAll = useCallback(async () => {
    if (!account) return
    setLoading(true)
    try {
      const [rRes, tRes, sRes] = await Promise.all([
        getReadings(account, 50),
        getTrades(account, 50),
        getReadingStats(account),
      ])
      if (rRes.success) setReadings(rRes.data)
      if (tRes.success) setTrades(tRes.data)
      if (sRes.success) setStats(sRes.data)
    } catch (e) { console.warn('history fetch err', e) }
    finally     { setLoading(false) }
  }, [account])

  useEffect(() => { fetchAll() }, [fetchAll])

  // CSV export
  const exportCSV = () => {
    const rows = tab === 'readings'
      ? [['Timestamp','Type','kWh','Tokens','TxHash'],
         ...readings.map(r => [r.timestamp, r.type, r.kwhAmount, r.tokenAmount, r.txHash || ''])]
      : [['Timestamp','Side','ERT','ETH Paid','TxHash'],
         ...trades.map(t => [t.createdAt, t.buyerAddress?.toLowerCase()===account?.toLowerCase()?'buy':'sell', fmtErt(t.tokenAmount), fmtEth(t.ethPaid), t.txHash || ''])]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type:'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a'); a.href=url; a.download=`gridledger-${tab}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  // Lifetime totals (from all readings, not just today)
  const totalGenKwh = readings.filter(r=>r.type==='generation').reduce((s,r)=>s+r.kwhAmount,0)
  const totalConKwh = readings.filter(r=>r.type==='consumption').reduce((s,r)=>s+r.kwhAmount,0)
  const totalEth    = trades.reduce((s,t)=>s+(Number(BigInt(t.ethPaid||'0'))/1e18),0)

  return (
    <div className="page">
      <div className="wrap" style={{ paddingTop:32, paddingBottom:60 }}>

        {/* Header */}
        <div className="fu page-header" style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:28, flexWrap:'wrap', gap:16 }}>
          <div>
            <div className="section-eyebrow" style={{ marginBottom:8 }}>Ledger</div>
            <h1 className="page-title" style={{ fontSize:48, fontWeight:800, letterSpacing:'-0.04em', lineHeight:1 }}>
              Transaction<br/>History
            </h1>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button className="btn btn-ghost" onClick={fetchAll} title="Refresh" style={{ border:'1px solid var(--ink-rule)', borderRadius:'var(--r-pill)', padding:'8px 12px' }}>
              <RefreshCw size={14} style={{ animation: loading?'spin 1s linear infinite':'none' }}/>
            </button>
            <button className="btn btn-outline" onClick={exportCSV} style={{ display:'flex', alignItems:'center', gap:7 }}>
              <Download size={14}/> Export CSV
            </button>
          </div>
        </div>

        {/* Stats grid */}
        <div className="fu d1 seamless-grid history-stats" style={{ gridTemplateColumns:'repeat(4,1fr)', marginBottom:20 }}>
          {[
            { l:'Total Generated', v: isConnected ? `${fmtKwh(totalGenKwh)} kWh` : '—', bg:'var(--lime)' },
            { l:'Total Consumed',  v: isConnected ? `${fmtKwh(totalConKwh)} kWh` : '—', bg:'var(--bg)' },
            { l:'Trades Count',    v: isConnected ? String(trades.length) : '—',          bg:'var(--bg)' },
            { l:'ETH Traded',      v: isConnected ? `${totalEth.toFixed(4)} ETH` : '—',  bg:'var(--ink)' },
          ].map(({l,v,bg},i)=>(
            <div key={i} className="sg-cell" style={{ background:bg }}>
              <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.07em', textTransform:'uppercase', color: bg==='var(--ink)'?'rgba(232,233,223,0.45)':bg==='var(--lime)'?'rgba(0,31,63,0.5)':'var(--ink-dim)', marginBottom:8 }}>{l}</div>
              <div style={{ fontFamily:'var(--display)', fontWeight:800, fontSize:22, color: bg==='var(--ink)'?'var(--cream)':bg==='var(--lime)'?'var(--ink)':'var(--text)' }}>{v}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="fu d2" style={{ display:'flex', gap:4, marginBottom:10 }}>
          {[{id:'readings',l:'Meter Readings'},{id:'trades',l:'Trade History'}].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} className="btn" style={{
              background: tab===t.id?'var(--text)':'var(--paper)', color: tab===t.id?'var(--bg)':'var(--ink-dim)',
              borderRadius:'var(--r-pill)', fontSize:13, padding:'8px 18px', border:'1px solid var(--ink-rule)',
            }}>{t.l}</button>
          ))}
        </div>

        {/* Table */}
        <div className="fu d3 history-table-wrap" style={{ border:'1px solid var(--ink-rule)', borderRadius:'var(--r-lg)', overflow:'hidden', background:'var(--bg)' }}>
          {!isConnected && (
            <div style={{ padding:'11px 22px', background:'rgba(219,230,76,0.18)', borderBottom:'1px solid var(--ink-rule)', fontSize:13, fontWeight:500 }}>
              Connect wallet to view your personal history
            </div>
          )}

          <div className="history-table-inner" style={{ overflowX:'auto' }}>

            {/* Header */}
            <div style={{
              display:'grid', minWidth:600,
              gridTemplateColumns: tab==='readings'?'1fr 100px 80px 80px 160px 100px':'1fr 60px 100px 120px 160px',
              padding:'11px 22px', background:'var(--paper)', borderBottom:'1px solid var(--ink-rule)',
            }}>
              {(tab==='readings'
                ? ['Timestamp','Type','kWh','Tokens','Tx Hash','Status']
                : ['Timestamp','Side','ERT','ETH Paid','Tx Hash']
              ).map(h=>(
                <div key={h} style={{ fontSize:10, fontWeight:700, color:'var(--ink-dim)', textTransform:'uppercase', letterSpacing:'0.07em', whiteSpace:'nowrap' }}>{h}</div>
              ))}
            </div>

            {/* Empty state */}
            {((tab==='readings' && readings.length===0) || (tab==='trades' && trades.length===0)) && (
              <div style={{ padding:'36px 24px', textAlign:'center', color:'var(--ink-dim)', fontSize:14 }}>
                {loading ? 'Loading…' : isConnected ? 'No records yet — the oracle is running and will appear here shortly.' : 'Connect wallet to see records'}
              </div>
            )}

            {/* Readings rows */}
            {tab==='readings' && readings.map((r,i)=>(
              <div key={i} style={{ display:'grid', minWidth:600, gridTemplateColumns:'1fr 100px 80px 80px 160px 100px', padding:'14px 22px', borderBottom:i<readings.length-1?'1px solid var(--ink-rule)':'none', alignItems:'center', transition:'background 0.14s' }}
                onMouseEnter={e=>e.currentTarget.style.background='var(--paper)'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <div style={{ fontSize:12, color:'var(--ink-dim)', whiteSpace:'nowrap' }}>{new Date(r.timestamp).toLocaleString()}</div>
                <span className={`tag ${r.type==='generation'?'tag-lime':'tag-red'}`}>{r.type==='generation'?'⚡ Gen':'🔥 Con'}</span>
                <div style={{ fontFamily:'var(--display)', fontWeight:700, fontSize:13 }}>{fmtKwh(r.kwhAmount)}</div>
                <div style={{ fontSize:13, color:'var(--ink-dim)' }}>{(Number(BigInt(r.tokenAmount||'0'))/1e18).toFixed(3)}</div>
                {r.txHash
                  ? <a href={`${EXPLORER}/tx/${r.txHash}`} target="_blank" rel="noopener noreferrer"
                      style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, color:'var(--ink-dim)', textDecoration:'none', fontFamily:'monospace' }}
                      onMouseEnter={e=>e.currentTarget.style.color='var(--forest)'}
                      onMouseLeave={e=>e.currentTarget.style.color='var(--ink-dim)'}>
                      {r.txHash.slice(0,12)}… <ExternalLink size={10}/>
                    </a>
                  : <span style={{ fontSize:11, color:'var(--ink-dim)' }}>Pending…</span>}
                <span className={r.txHash?'tag tag-green':'tag tag-blue'}>{r.txHash?'Confirmed':'Pending'}</span>
              </div>
            ))}

            {/* Trades rows */}
            {tab==='trades' && trades.map((t,i)=>{
              const isBuy = t.buyerAddress?.toLowerCase() === account?.toLowerCase()
              return (
                <div key={i} style={{ display:'grid', minWidth:600, gridTemplateColumns:'1fr 60px 100px 120px 160px', padding:'14px 22px', borderBottom:i<trades.length-1?'1px solid var(--ink-rule)':'none', alignItems:'center', transition:'background 0.14s' }}
                  onMouseEnter={e=>e.currentTarget.style.background='var(--paper)'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <div style={{ fontSize:12, color:'var(--ink-dim)', whiteSpace:'nowrap' }}>{new Date(t.createdAt).toLocaleString()}</div>
                  <span className={`tag ${isBuy?'tag-green':'tag-ink'}`}>{isBuy?'Buy':'Sell'}</span>
                  <div style={{ fontFamily:'var(--display)', fontWeight:700, fontSize:13 }}>{fmtErt(t.tokenAmount)} ERT</div>
                  <div style={{ fontFamily:'var(--display)', fontWeight:700, fontSize:13, color:'var(--forest)' }}>{fmtEth(t.ethPaid)} ETH</div>
                  {t.txHash
                    ? <a href={`${EXPLORER}/tx/${t.txHash}`} target="_blank" rel="noopener noreferrer"
                        style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, color:'var(--ink-dim)', textDecoration:'none', fontFamily:'monospace' }}
                        onMouseEnter={e=>e.currentTarget.style.color='var(--forest)'}
                        onMouseLeave={e=>e.currentTarget.style.color='var(--ink-dim)'}>
                        {t.txHash.slice(0,12)}… <ExternalLink size={10}/>
                      </a>
                    : <span style={{ fontSize:11, color:'var(--ink-dim)' }}>—</span>}
                </div>
              )
            })}
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
