import { useState } from 'react'
import { useWallet } from '../context/WalletContext'
import { ExternalLink, Download } from 'lucide-react'

const DEMO_READINGS = Array.from({ length:10 }, (_,i) => ({
  ts: new Date(Date.now() - i*1800000).toLocaleString(),
  type: i%3===0?'consumption':'generation',
  kwh: (Math.random()*5+0.5).toFixed(2),
  tokens: (Math.random()*5+0.5).toFixed(2),
  txHash: '0x'+Array.from({length:12},()=>Math.floor(Math.random()*16).toString(16)).join(''),
}))
const DEMO_TRADES = Array.from({ length:6 }, (_,i) => ({
  ts: new Date(Date.now() - i*7200000).toLocaleString(),
  side: i%2===0?'buy':'sell',
  kwh: (Math.random()*20+5).toFixed(2),
  eth: (Math.random()*0.05+0.005).toFixed(5),
  txHash: '0x'+Array.from({length:12},()=>Math.floor(Math.random()*16).toString(16)).join(''),
}))

export default function History() {
  const { isConnected } = useWallet()
  const [tab, setTab] = useState('readings')
  const readings = DEMO_READINGS
  const trades = DEMO_TRADES

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
          <button className="btn btn-outline" style={{ display:'flex', alignItems:'center', gap:7 }}>
            <Download size={14}/> Export CSV
          </button>
        </div>

        {/* Stats seamless grid */}
        <div className="fu d1 seamless-grid history-stats"
          style={{ gridTemplateColumns:'repeat(4,1fr)', marginBottom:20 }}>
          {[
            { l:'Total Generated', v:isConnected?'347.2 kWh':'—', bg:'var(--lime)' },
            { l:'Total Consumed',  v:isConnected?'182.8 kWh':'—', bg:'var(--bg)' },
            { l:'Orders Completed',v:isConnected?'12':'—',         bg:'var(--bg)' },
            { l:'All-time Revenue',v:isConnected?'0.168 ETH':'—', bg:'var(--ink)' },
          ].map(({l,v,bg},i)=>(
            <div key={i} className="sg-cell" style={{ background:bg }}>
              <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.07em', textTransform:'uppercase', color: bg==='var(--ink)'?'rgba(232,233,223,0.45)':'var(--ink-dim)', marginBottom:8 }}>{l}</div>
              <div style={{ fontFamily:'var(--display)', fontWeight:800, fontSize:22, color: bg==='var(--ink)'?'var(--cream)':bg==='var(--lime)'?'var(--ink)':'var(--text)' }}>{v}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="fu d2" style={{ display:'flex', gap:4, marginBottom:10 }}>
          {[{id:'readings',l:'Meter Readings'},{id:'trades',l:'Trade History'}].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} className="btn" style={{
              background: tab===t.id?'var(--text)':'var(--paper)',
              color: tab===t.id?'var(--bg)':'var(--ink-dim)',
              borderRadius:'var(--r-pill)', fontSize:13, padding:'8px 18px',
              border: '1px solid var(--ink-rule)',
            }}>{t.l}</button>
          ))}
        </div>

        {/* Scrollable table */}
        <div className="fu d3 history-table-wrap" style={{ border:'1px solid var(--ink-rule)', borderRadius:'var(--r-lg)', overflow:'hidden', background:'var(--bg)' }}>
          {!isConnected && (
            <div style={{ padding:'11px 22px', background:'rgba(219,230,76,0.18)', borderBottom:'1px solid var(--ink-rule)', fontSize:13, fontWeight:500 }}>
              ↳ Connect wallet to see your actual history — showing demo data
            </div>
          )}

          <div className="history-table-inner" style={{ overflowX:'auto' }}>
            {/* Header */}
            <div style={{
              display:'grid', minWidth:600,
              gridTemplateColumns: tab==='readings'?'1fr 100px 80px 80px 150px 100px':'1fr 70px 80px 110px 150px',
              padding:'11px 22px', background:'var(--paper)', borderBottom:'1px solid var(--ink-rule)'
            }}>
              {(tab==='readings'
                ?['Timestamp','Type','kWh','Tokens','Tx Hash','Status']
                :['Timestamp','Side','kWh','ETH Paid','Tx Hash']
              ).map(h=>(
                <div key={h} style={{ fontSize:10, fontWeight:700, color:'var(--ink-dim)', textTransform:'uppercase', letterSpacing:'0.07em', whiteSpace:'nowrap' }}>{h}</div>
              ))}
            </div>

            {/* Body */}
            {tab==='readings' ? readings.map((r,i)=>(
              <div key={i} style={{
                display:'grid', minWidth:600,
                gridTemplateColumns:'1fr 100px 80px 80px 150px 100px',
                padding:'14px 22px', borderBottom: i<readings.length-1?'1px solid var(--ink-rule)':'none',
                alignItems:'center', transition:'background 0.14s',
              }}
                onMouseEnter={e=>e.currentTarget.style.background='var(--paper)'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}
              >
                <div style={{ fontSize:12, color:'var(--ink-dim)', whiteSpace:'nowrap' }}>{r.ts}</div>
                <div><span className={`tag ${r.type==='generation'?'tag-lime':'tag-red'}`}>{r.type==='generation'?'⚡ Gen':'🔥 Con'}</span></div>
                <div style={{ fontFamily:'var(--display)', fontWeight:700, fontSize:13 }}>{r.kwh}</div>
                <div style={{ fontSize:13, color:'var(--ink-dim)' }}>{r.tokens}</div>
                <a href={`https://sepolia.etherscan.io/tx/${r.txHash}`} target="_blank" rel="noopener noreferrer"
                  style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, color:'var(--ink-dim)', textDecoration:'none', fontFamily:'monospace' }}
                  onMouseEnter={e=>e.currentTarget.style.color='var(--forest)'}
                  onMouseLeave={e=>e.currentTarget.style.color='var(--ink-dim)'}>
                  {r.txHash.slice(0,12)}… <ExternalLink size={10}/>
                </a>
                <span className="tag tag-green">✓ confirmed</span>
              </div>
            )) : trades.map((t,i)=>(
              <div key={i} style={{
                display:'grid', minWidth:600,
                gridTemplateColumns:'1fr 70px 80px 110px 150px',
                padding:'14px 22px', borderBottom: i<trades.length-1?'1px solid var(--ink-rule)':'none',
                alignItems:'center', transition:'background 0.14s',
              }}
                onMouseEnter={e=>e.currentTarget.style.background='var(--paper)'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}
              >
                <div style={{ fontSize:12, color:'var(--ink-dim)', whiteSpace:'nowrap' }}>{t.ts}</div>
                <span className={`tag ${t.side==='buy'?'tag-green':'tag-ink'}`}>{t.side==='buy'?'Buy':'Sell'}</span>
                <div style={{ fontFamily:'var(--display)', fontWeight:700, fontSize:13 }}>{t.kwh} ERT</div>
                <div style={{ fontFamily:'var(--display)', fontWeight:700, fontSize:13, color:'var(--forest)' }}>{t.eth} ETH</div>
                <a href={`https://sepolia.etherscan.io/tx/${t.txHash}`} target="_blank" rel="noopener noreferrer"
                  style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, color:'var(--ink-dim)', textDecoration:'none', fontFamily:'monospace' }}
                  onMouseEnter={e=>e.currentTarget.style.color='var(--forest)'}
                  onMouseLeave={e=>e.currentTarget.style.color='var(--ink-dim)'}>
                  {t.txHash.slice(0,12)}… <ExternalLink size={10}/>
                </a>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
