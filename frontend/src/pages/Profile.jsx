import { useState } from 'react'
import { useWallet } from '../context/WalletContext'
import { Copy, ExternalLink } from 'lucide-react'

export default function Profile() {
  const { isConnected, account, connect } = useWallet()
  const [displayName, setDisplayName] = useState('')
  const [peakKw, setPeakKw] = useState('5')
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)

  const copy = () => {
    if (account) { navigator.clipboard.writeText(account); setCopied(true); setTimeout(()=>setCopied(false),2000) }
  }

  const stats = [
    { l:'Total Generated', v:'347.2 kWh', bg:'var(--lime)' },
    { l:'Total Consumed',  v:'182.8 kWh', bg:'var(--bg)' },
    { l:'Total Sold',      v:'140 ERT',   bg:'var(--bg)' },
    { l:'Revenue Earned',  v:'0.168 ETH', bg:'var(--mantis)' },
  ]

  return (
    <div className="page">
      <div className="wrap" style={{ paddingTop:32, paddingBottom:60, maxWidth:1000, margin:'0 auto' }}>

        {/* Header */}
        <div className="fu" style={{ marginBottom:28 }}>
          <div className="section-eyebrow" style={{ marginBottom:8 }}>Account</div>
          <h1 className="page-title" style={{ fontSize:48, fontWeight:800, letterSpacing:'-0.04em', lineHeight:1 }}>Your Profile</h1>
        </div>

        {/* Identity card */}
        <div className="fu d1" style={{
          background:'var(--ink)', borderRadius:'var(--r-xl)', padding:'28px 32px',
          marginBottom:10, display:'flex', alignItems:'center', gap:24, flexWrap:'wrap'
        }}>
          <div style={{
            width:60, height:60, borderRadius:'var(--r-md)', flexShrink:0,
            background:'var(--lime)', display:'flex', alignItems:'center', justifyContent:'center',
            fontFamily:'var(--display)', fontWeight:800, fontSize:24, color:'var(--ink)'
          }}>
            {isConnected&&account ? account[2].toUpperCase() : '?'}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontFamily:'var(--display)', fontWeight:800, fontSize:19, color:'var(--cream)', marginBottom:8 }}>
              {isConnected?(displayName||'Anonymous Prosumer'):'Not Connected'}
            </div>
            {isConnected ? (
              <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                <code style={{ fontSize:11, color:'rgba(232,233,223,0.5)', background:'rgba(232,233,223,0.07)', padding:'4px 10px', borderRadius:6, fontFamily:'monospace', overflow:'hidden', textOverflow:'ellipsis', maxWidth:'220px' }}>
                  {account}
                </code>
                <button className="btn btn-outline" style={{ fontSize:12, padding:'4px 11px', color:'rgba(232,233,223,0.65)', borderColor:'rgba(232,233,223,0.15)' }} onClick={copy}>
                  <Copy size={11}/> {copied?'Copied!':'Copy'}
                </button>
                <a href={`https://sepolia.etherscan.io/address/${account}`} target="_blank" rel="noopener noreferrer"
                  className="btn btn-outline" style={{ fontSize:12, padding:'4px 11px', color:'rgba(232,233,223,0.65)', borderColor:'rgba(232,233,223,0.15)', textDecoration:'none' }}>
                  <ExternalLink size={11}/> Etherscan
                </a>
              </div>
            ) : (
              <button className="btn btn-lime" onClick={connect} style={{ marginTop:4 }}>Connect Wallet</button>
            )}
          </div>
          {isConnected && (
            <div style={{ textAlign:'right', flexShrink:0 }}>
              <div style={{ fontSize:10, color:'rgba(232,233,223,0.4)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:5 }}>Status</div>
              <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                <span className="live-dot"/>
                <span style={{ fontFamily:'var(--display)', fontWeight:700, fontSize:13, color:'var(--mantis)' }}>Active Prosumer</span>
              </div>
            </div>
          )}
        </div>

        {/* Stats grid */}
        <div className="fu d2 seamless-grid profile-stats" style={{ gridTemplateColumns:'repeat(4,1fr)', marginBottom:20 }}>
          {stats.map(({l,v,bg},i)=>(
            <div key={i} className="sg-cell" style={{ background:bg }}>
              <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:'var(--ink-dim)', marginBottom:8 }}>{l}</div>
              <div style={{ fontFamily:'var(--display)', fontWeight:800, fontSize:22, color:'var(--text)' }}>{isConnected?v:'—'}</div>
            </div>
          ))}
        </div>

        {/* Settings */}
        <div className="fu d3" style={{ border:'1px solid var(--ink-rule)', borderRadius:'var(--r-xl)', overflow:'hidden' }}>
          <div style={{ background:'var(--lime)', padding:'18px 28px', borderBottom:'1px solid rgba(0,31,63,0.12)' }}>
            <div className="section-eyebrow" style={{ color:'rgba(0,31,63,0.5)' }}>Configuration</div>
            <div style={{ fontFamily:'var(--display)', fontWeight:800, fontSize:18, marginTop:3, color:'var(--ink)' }}>Prosumer Settings</div>
          </div>
          <div style={{ padding:'28px', background:'var(--bg)', display:'flex', flexDirection:'column', gap:20 }}>
            <div>
              <label style={{ fontSize:13, fontWeight:600, display:'block', marginBottom:7 }}>Display Name</label>
              <input className="input" placeholder="Enter a display name" value={displayName} onChange={e=>setDisplayName(e.target.value)} style={{ maxWidth:400 }}/>
            </div>
            <div>
              <label style={{ fontSize:13, fontWeight:600, display:'block', marginBottom:7 }}>Solar Panel Capacity (kW)</label>
              <input className="input" type="number" min="0.5" max="50" step="0.5" value={peakKw} onChange={e=>setPeakKw(e.target.value)} style={{ maxWidth:180 }}/>
              <div style={{ fontSize:12, color:'var(--ink-dim)', marginTop:6 }}>Controls simulated solar generation per cycle.</div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <button className="btn btn-ink" disabled={!isConnected} onClick={()=>{setSaved(true);setTimeout(()=>setSaved(false),2000)}}
                style={{ opacity:!isConnected?0.45:1 }}>
                {saved?'✓ Saved!':'Save Settings'}
              </button>
              {!isConnected && <span style={{ fontSize:12, color:'var(--ink-dim)' }}>Connect wallet to save</span>}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
