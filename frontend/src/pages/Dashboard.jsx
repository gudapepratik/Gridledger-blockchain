import { useWallet } from '../context/WalletContext'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { ArrowRight, Zap, Flame } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const mockData = Array.from({ length: 24 }, (_, h) => ({
  h: `${h}:00`,
  gen: h >= 6 && h <= 18 ? +(5 * Math.max(0, Math.sin(((h-6)*Math.PI)/12)) * (0.8 + Math.random()*0.4)).toFixed(2) : 0,
  con: +(0.5 + Math.random()*0.5 + ((h>=7&&h<=9)||(h>=18&&h<=21)?1.4:0)).toFixed(2),
}))

const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'var(--ink)', borderRadius:10, padding:'8px 14px', minWidth:110 }}>
      <div style={{ fontSize:11, color:'var(--ink-dim)', marginBottom:3 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontSize:13, fontWeight:600, color: i===0?'var(--lime)':'var(--mantis)' }}>
          {p.value} kWh
        </div>
      ))}
    </div>
  )
}

const ACTIVITIES = [
  { label:'Oracle minted 2.34 kWh', tag:'Generated', time:'2m ago' },
  { label:'50 ERT sold to 0xDef0…5678', tag:'Trade', time:'8m ago' },
  { label:'Oracle burned 1.12 kWh', tag:'Consumed', time:'15m ago' },
  { label:'100 ERT listed @ 0.001 ETH', tag:'Order', time:'22m ago' },
  { label:'30 ERT purchased by 0x9876…dcba', tag:'Trade', time:'31m ago' },
]
const TAG_COLOR = { Generated:'tag-lime', Trade:'tag-ink', Consumed:'tag-red', Order:'tag-blue' }

export default function Dashboard() {
  const { isConnected, account, truncateAddress, connect } = useWallet()

  return (
    <div className="page">

      {/* Ticker */}
      <div className="ticker fu">
        {[
          { label:'Network', val:'Sepolia', dot:true },
          { label:'Total Traded', val:'1,248 kWh' },
          { label:'Active Listings', val:'14' },
          { label:'Avg Price', val:'0.0012 ETH/kWh' },
          { label:'Traders', val:'7' },
        ].map(({ label, val, dot }, i) => (
          <div key={i} className="ticker-item">
            <span className="section-eyebrow">{label}</span>
            <span style={{ fontFamily:'var(--display)', fontWeight:700, fontSize:13, display:'flex', alignItems:'center', gap:6 }}>
              {dot && <span className="live-dot" />}{val}
            </span>
          </div>
        ))}
      </div>

      <div className="wrap" style={{ padding:'28px 24px 60px' }}>

        {/* Hero top bento */}
        <div className="bento bento-hero-top fu"
          style={{ gridTemplateColumns:'1fr 1fr 280px', gridTemplateRows:'190px', marginBottom:10 }}>

          {/* Lime headline */}
          <div className="bento-cell cell-lime" style={{ padding:'28px 28px', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
            <div className="section-eyebrow" style={{ color:'rgba(0,31,63,0.5)' }}>P2P Energy Trading</div>
            <div>
              <h1 style={{ fontSize:38, fontWeight:800, color:'var(--ink)', lineHeight:1.0, letterSpacing:'-0.04em', marginBottom:14 }}>
                Trade clean<br/>energy direct.
              </h1>
              {isConnected
                ? <div style={{ display:'flex', alignItems:'center', gap:7 }}><span className="live-dot" /><span style={{ fontSize:13, fontWeight:600, color:'var(--ink)' }}>{truncateAddress(account)}</span></div>
                : <button className="btn btn-ink" onClick={connect} style={{ fontSize:13 }}>Connect Wallet</button>
              }
            </div>
          </div>

          {/* Dark stat — Generated */}
          <div className="bento-cell cell-ink d1" style={{ padding:'28px', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <span className="section-eyebrow" style={{ color:'rgba(232,233,223,0.45)' }}>Today Generated</span>
              <Zap size={16} color="var(--lime)" />
            </div>
            <div>
              <div className="stat-num" style={{ fontSize:46, color:'var(--lime)' }}>{isConnected?'18.4':'—'}</div>
              <div className="stat-label" style={{ color:'rgba(232,233,223,0.45)' }}>kWh · Peak 4.2 kW</div>
            </div>
          </div>

          {/* ERT balance */}
          <div className="bento-cell cell-mantis d2" style={{ padding:'28px', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
            <span className="section-eyebrow" style={{ color:'rgba(0,31,63,0.45)' }}>ERT Balance</span>
            <div>
              <div className="stat-num" style={{ fontSize:40 }}>{isConnected?'247':'—'}</div>
              <div className="stat-label">EnergyTokens</div>
            </div>
          </div>
        </div>

        {/* Mid bento */}
        <div className="bento bento-hero-mid fu d2"
          style={{ gridTemplateColumns:'260px 1fr 220px', gridTemplateRows:'148px', marginBottom:10 }}>

          {/* Consumed */}
          <div className="bento-cell cell-paper d1" style={{ padding:'24px', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <span className="section-eyebrow">Today Consumed</span>
              <Flame size={15} color="var(--ink-dim)" />
            </div>
            <div>
              <div className="stat-num" style={{ fontSize:32 }}>{isConnected?'11.2':'—'}</div>
              <div className="stat-label">kWh · Net +7.2 surplus</div>
            </div>
          </div>

          {/* Revenue trio */}
          <div className="bento-cell cell-cream d2" style={{ padding:'24px', display:'flex', gap:32, alignItems:'flex-end', flexWrap:'wrap' }}>
            {[
              { l:'Revenue Earned', v:isConnected?'0.168 ETH':'—' },
              { l:'Total Sold', v:isConnected?'140 ERT':'—' },
              { l:'Total Bought', v:isConnected?'80 ERT':'—' },
            ].map(({ l, v }) => (
              <div key={l}>
                <div className="stat-num" style={{ fontSize:20 }}>{v}</div>
                <div className="stat-label">{l}</div>
              </div>
            ))}
          </div>

          {/* CTA Forest */}
          <div className="bento-cell cell-forest d3" style={{ padding:'24px', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
            <span className="section-eyebrow" style={{ color:'rgba(246,247,237,0.5)' }}>Ready to trade?</span>
            <div>
              <div style={{ fontFamily:'var(--display)', fontWeight:700, fontSize:15, color:'#F6F7ED', lineHeight:1.25, marginBottom:12 }}>
                Browse open<br/>energy listings
              </div>
              <NavLink to="/marketplace" className="btn btn-lime" style={{ fontSize:12, padding:'7px 14px' }}>
                Open Market <ArrowRight size={13} />
              </NavLink>
            </div>
          </div>
        </div>

        {/* Chart + Activity */}
        <div className="bento bento-chart-row fu d3" style={{ gridTemplateColumns:'1fr 360px' }}>

          {/* Chart */}
          <div className="bento-cell cell-cream" style={{ padding:'24px 24px 16px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, flexWrap:'wrap', gap:8 }}>
              <div>
                <div className="section-eyebrow">Energy Flow</div>
                <div style={{ fontFamily:'var(--display)', fontWeight:700, fontSize:15, marginTop:3 }}>Generation vs Consumption · 24h</div>
              </div>
              <div style={{ display:'flex', gap:14 }}>
                {[{c:'var(--lime)',l:'Gen'},{c:'var(--mantis)',l:'Con'}].map(({c,l})=>(
                  <div key={l} style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:'var(--ink-dim)' }}>
                    <span style={{ width:8, height:8, borderRadius:2, background:c, display:'inline-block' }}/>{l}
                  </div>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={mockData} margin={{ left:-28, right:0, top:4, bottom:0 }}>
                <defs>
                  <linearGradient id="gG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#DBE64C" stopOpacity={0.3}/>
                    <stop offset="100%" stopColor="#DBE64C" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="gC" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#74C365" stopOpacity={0.25}/>
                    <stop offset="100%" stopColor="#74C365" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="h" tick={{ fontSize:10, fill:'var(--ink-dim)' }} axisLine={false} tickLine={false} interval={3}/>
                <YAxis tick={{ fontSize:10, fill:'var(--ink-dim)' }} axisLine={false} tickLine={false}/>
                <Tooltip content={<ChartTip/>}/>
                <Area type="monotone" dataKey="gen" stroke="var(--lime)" strokeWidth={2} fill="url(#gG)" dot={false}/>
                <Area type="monotone" dataKey="con" stroke="var(--mantis)" strokeWidth={2} fill="url(#gC)" dot={false}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Activity */}
          <div className="bento-cell cell-cream" style={{ padding:'24px', display:'flex', flexDirection:'column' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
              <div>
                <div className="section-eyebrow">Live Activity</div>
                <div style={{ fontFamily:'var(--display)', fontWeight:700, fontSize:15, marginTop:3 }}>Recent Events</div>
              </div>
              <span className="live-dot"/>
            </div>
            {ACTIVITIES.map((a, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 0', borderBottom: i<ACTIVITIES.length-1 ? '1px solid var(--ink-rule)' : 'none' }}>
                <span style={{ fontFamily:'var(--display)', fontSize:10, fontWeight:700, color:'var(--ink-dim)', width:22, flexShrink:0 }}>
                  {String(i+1).padStart(2,'0')}
                </span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, fontWeight:500, color:'var(--text)', lineHeight:1.3 }}>{a.label}</div>
                  <div style={{ fontSize:11, color:'var(--ink-dim)', marginTop:2 }}>{a.time}</div>
                </div>
                <span className={`tag ${TAG_COLOR[a.tag]||'tag-blue'}`}>{a.tag}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Not connected */}
        {!isConnected && (
          <div className="fu d4" style={{
            background:'var(--ink)', borderRadius:'var(--r-lg)', marginTop:10,
            padding:'28px 32px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16
          }}>
            <div>
              <div style={{ fontFamily:'var(--display)', fontWeight:800, fontSize:19, color:'var(--cream)', marginBottom:6 }}>
                Connect your wallet to unlock live data
              </div>
              <div style={{ fontSize:13, color:'rgba(232,233,223,0.5)' }}>
                Balances, readings, and trade history are wallet-specific.
              </div>
            </div>
            <button className="btn btn-lime" style={{ fontSize:14, padding:'11px 24px' }} onClick={connect}>
              Connect MetaMask
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
