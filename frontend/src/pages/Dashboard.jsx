import { useEffect, useState, useCallback } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { ArrowRight, Zap, Flame, RefreshCw } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useWallet } from '../context/WalletContext'
import { useContracts } from '../hooks/useContracts'
import { useSocket } from '../hooks/useSocket'
import { getReadings, getReadingStats, getNetworkStats, registerUser } from '../lib/api'
import { ethers } from 'ethers'

const fmtKwh = (v) => Number(v).toFixed(2)

function buildChartData(readings) {
  const buckets = Array.from({ length: 24 }, (_, h) => ({ h: `${h}:00`, gen: 0, con: 0 }))
  for (const r of readings) {
    const h = new Date(r.timestamp).getHours()
    if (r.type === 'generation') buckets[h].gen = +(buckets[h].gen + r.kwhAmount).toFixed(2)
    else                         buckets[h].con = +(buckets[h].con + r.kwhAmount).toFixed(2)
  }
  return buckets
}

const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'var(--ink)', borderRadius:10, padding:'8px 14px', minWidth:110 }}>
      <div style={{ fontSize:11, color:'var(--on-ink-sub)', marginBottom:3 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontSize:13, fontWeight:600, color: i===0?'var(--lime)':'var(--mantis)' }}>
          {p.value} kWh
        </div>
      ))}
    </div>
  )
}

const ACTIVITY_LIMIT = 5

export default function Dashboard() {
  const { isConnected, account, truncateAddress, connect } = useWallet()
  const { token } = useContracts()

  const [ertBalance, setErtBalance] = useState(null)
  const [stats,      setStats]      = useState(null)
  const [netStats,   setNetStats]   = useState(null)
  const [chartData,  setChartData]  = useState(buildChartData([]))
  const [activity,   setActivity]   = useState([])
  const [loading,    setLoading]    = useState(false)

  const fetchBalance = useCallback(async () => {
    if (!token || !account) return
    try {
      const bal = await token.balanceOf(account)
      setErtBalance(ethers.formatUnits(bal, 18))
    } catch (e) { console.warn('balance fetch err', e) }
  }, [token, account])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [netRes] = await Promise.all([getNetworkStats()])
      if (netRes.success) setNetStats(netRes.data)
      if (account) {
        const [statsRes, readingsRes] = await Promise.all([
          getReadingStats(account),
          getReadings(account, 100),
        ])
        if (statsRes.success)    setStats(statsRes.data)
        if (readingsRes.success) {
          setChartData(buildChartData(readingsRes.data))
          setActivity(readingsRes.data.slice(0, ACTIVITY_LIMIT))
        }
      }
    } catch (e) { console.warn('dashboard fetch err', e) }
    finally { setLoading(false) }
  }, [account])

  useEffect(() => {
    if (!account) return
    registerUser(account).catch(() => {})
    fetchData()
    fetchBalance()
  }, [account, fetchData, fetchBalance])

  useEffect(() => { fetchData() }, [])

  useSocket({
    'meter:reading': (r) => {
      if (r.walletAddress?.toLowerCase() !== account?.toLowerCase()) return
      setActivity(prev => [r, ...prev].slice(0, ACTIVITY_LIMIT))
      setChartData(prev => {
        const copy = [...prev]
        const h = new Date(r.timestamp).getHours()
        if (r.type === 'generation') copy[h].gen = +(copy[h].gen + r.kwhAmount).toFixed(2)
        else                         copy[h].con = +(copy[h].con + r.kwhAmount).toFixed(2)
        return copy
      })
      fetchBalance()
    },
    'order:created':   () => fetchData(),
    'order:fulfilled': () => { fetchData(); fetchBalance() },
  })

  const tagFor   = (type) => type === 'generation' ? 'tag-lime' : 'tag-red'
  const labelFor = (type) => type === 'generation' ? '⚡ Generated' : '🔥 Consumed'

  return (
    <div className="page">

      {/* Ticker */}
      <div className="ticker fu">
        {[
          { label: 'Network',         val: 'Sepolia',                                      dot: true },
          { label: 'Total Traded',    val: netStats ? `${netStats.totalTradedKwh} kWh` : '…' },
          { label: 'Active Listings', val: netStats ? String(netStats.activeListings)    : '…' },
          { label: 'Active Traders',  val: netStats ? String(netStats.activeTraders)     : '…' },
        ].map(({ label, val, dot }, i) => (
          <div key={i} className="ticker-item">
            <span className="section-eyebrow">{label}</span>
            <span style={{ fontFamily:'var(--display)', fontWeight:700, fontSize:13, display:'flex', alignItems:'center', gap:6 }}>
              {dot && <span className="live-dot" />}{val}
            </span>
          </div>
        ))}
        {loading && (
          <div className="ticker-item" style={{ marginLeft:'auto' }}>
            <RefreshCw size={12} style={{ animation:'spin 1s linear infinite', color:'var(--ink-dim)' }} />
          </div>
        )}
      </div>

      <div className="wrap" style={{ padding:'28px 24px 60px' }}>

        {/* Hero top bento */}
        <div className="bento bento-hero-top fu"
          style={{ gridTemplateColumns:'1fr 1fr 280px', gridTemplateRows:'190px', marginBottom:10 }}>

          {/* cell-lime: uses --on-lime automatically */}
          <div className="bento-cell cell-lime" style={{ padding:'28px', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
            <div className="section-eyebrow" style={{ color:'var(--on-lime-sub)' }}>P2P Energy Trading</div>
            <div>
              <h1 style={{ fontSize:38, fontWeight:800, lineHeight:1.0, letterSpacing:'-0.04em', marginBottom:14 }}>
                Trade clean<br/>energy direct.
              </h1>
              {isConnected
                ? <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                    <span className="live-dot"/>
                    <span style={{ fontSize:13, fontWeight:600 }}>{truncateAddress(account)}</span>
                  </div>
                : <button className="btn btn-ink" onClick={connect} style={{ fontSize:13 }}>Connect Wallet</button>}
            </div>
          </div>

          {/* cell-ink: uses --on-ink automatically */}
          <div className="bento-cell cell-ink d1" style={{ padding:'28px', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <span className="section-eyebrow" style={{ color:'var(--on-ink-sub)' }}>Today Generated</span>
              <Zap size={16} color="var(--lime)"/>
            </div>
            <div>
              <div className="stat-num" style={{ fontSize:46, color:'var(--on-ink-hi)' }}>
                {isConnected ? (stats ? fmtKwh(stats.generatedKwh) : '…') : '—'}
              </div>
              <div className="stat-label" style={{ color:'var(--on-ink-sub)' }}>kWh from solar today</div>
            </div>
          </div>

          {/* cell-mantis: uses --on-mantis automatically */}
          <div className="bento-cell cell-mantis d2" style={{ padding:'28px', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
            <span className="section-eyebrow" style={{ color:'var(--on-lime-sub)' }}>ERT Balance</span>
            <div>
              <div className="stat-num" style={{ fontSize:40 }}>
                {isConnected ? (ertBalance !== null ? Number(ertBalance).toFixed(0) : '…') : '—'}
              </div>
              <div className="stat-label">EnergyTokens on-chain</div>
            </div>
          </div>
        </div>

        {/* Mid bento */}
        <div className="bento bento-hero-mid fu d2"
          style={{ gridTemplateColumns:'260px 1fr 220px', gridTemplateRows:'148px', marginBottom:10 }}>

          <div className="bento-cell cell-paper d1" style={{ padding:'24px', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <span className="section-eyebrow">Today Consumed</span>
              <Flame size={15} color="var(--ink-dim)"/>
            </div>
            <div>
              <div className="stat-num" style={{ fontSize:32 }}>
                {isConnected ? (stats ? fmtKwh(stats.consumedKwh) : '…') : '—'}
              </div>
              <div className="stat-label">
                {isConnected && stats
                  ? `kWh · Net ${(stats.generatedKwh - stats.consumedKwh) >= 0 ? '+' : ''}${fmtKwh(stats.generatedKwh - stats.consumedKwh)} surplus`
                  : 'kWh consumed today'}
              </div>
            </div>
          </div>

          <div className="bento-cell cell-cream d2" style={{ padding:'24px', display:'flex', gap:32, alignItems:'flex-end', flexWrap:'wrap' }}>
            {[
              { l:'ERT Balance',     v: isConnected && ertBalance !== null ? `${Number(ertBalance).toFixed(0)} ERT` : '—' },
              { l:'Net Today',       v: isConnected && stats ? `${fmtKwh(stats.generatedKwh - stats.consumedKwh)} kWh` : '—' },
              { l:'Active Listings', v: netStats ? `${netStats.activeListings}` : '—' },
            ].map(({ l, v }) => (
              <div key={l}>
                <div className="stat-num" style={{ fontSize:20 }}>{v}</div>
                <div className="stat-label">{l}</div>
              </div>
            ))}
          </div>

          {/* cell-forest: uses --on-forest automatically */}
          <div className="bento-cell cell-forest d3" style={{ padding:'24px', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
            <span className="section-eyebrow" style={{ color:'var(--on-forest)', opacity:0.55 }}>Ready to trade?</span>
            <div>
              <div style={{ fontFamily:'var(--display)', fontWeight:700, fontSize:15, lineHeight:1.25, marginBottom:12 }}>
                Browse open<br/>energy listings
              </div>
              <NavLink to="/marketplace" className="btn btn-lime" style={{ fontSize:12, padding:'7px 14px' }}>
                Open Market <ArrowRight size={13}/>
              </NavLink>
            </div>
          </div>
        </div>

        {/* Chart + Activity */}
        <div className="bento bento-chart-row fu d3" style={{ gridTemplateColumns:'1fr 360px' }}>

          <div className="bento-cell cell-cream" style={{ padding:'24px 24px 16px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, flexWrap:'wrap', gap:8 }}>
              <div>
                <div className="section-eyebrow">Energy Flow</div>
                <div style={{ fontFamily:'var(--display)', fontWeight:700, fontSize:15, marginTop:3 }}>
                  Generation vs Consumption · 24h
                </div>
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
              <AreaChart data={chartData} margin={{ left:-28, right:0, top:4, bottom:0 }}>
                <defs>
                  <linearGradient id="gG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#DBE64C" stopOpacity={0.3}/><stop offset="100%" stopColor="#DBE64C" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="gC" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#74C365" stopOpacity={0.25}/><stop offset="100%" stopColor="#74C365" stopOpacity={0}/>
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

          <div className="bento-cell cell-cream" style={{ padding:'24px', display:'flex', flexDirection:'column' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
              <div>
                <div className="section-eyebrow">Live Activity</div>
                <div style={{ fontFamily:'var(--display)', fontWeight:700, fontSize:15, marginTop:3 }}>Recent Readings</div>
              </div>
              <span className="live-dot"/>
            </div>
            {activity.length === 0 && (
              <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--ink-dim)', fontSize:13 }}>
                {isConnected ? 'Waiting for oracle readings…' : 'Connect wallet to see activity'}
              </div>
            )}
            {activity.map((r, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 0', borderBottom: i<activity.length-1?'1px solid var(--ink-rule)':'none' }}>
                <span style={{ fontFamily:'var(--display)', fontSize:10, fontWeight:700, color:'var(--ink-dim)', width:22, flexShrink:0 }}>
                  {String(i+1).padStart(2,'0')}
                </span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, fontWeight:500, color:'var(--text)', lineHeight:1.3 }}>
                    {r.type === 'generation' ? 'Oracle minted' : 'Oracle burned'} {fmtKwh(r.kwhAmount)} kWh
                  </div>
                  <div style={{ fontSize:11, color:'var(--ink-dim)', marginTop:2 }}>
                    {new Date(r.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                <span className={`tag ${tagFor(r.type)}`}>{labelFor(r.type)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Not connected CTA — cell-ink */}
        {!isConnected && (
          <div className="bento-cell cell-ink fu d4" style={{ marginTop:10, padding:'28px 32px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
            <div>
              <div style={{ fontFamily:'var(--display)', fontWeight:800, fontSize:19, marginBottom:6 }}>
                Connect your wallet to unlock live data
              </div>
              <div style={{ fontSize:13, color:'var(--on-ink-sub)' }}>
                Balances, readings, and trade history are wallet-specific.
              </div>
            </div>
            <button className="btn btn-lime" style={{ fontSize:14, padding:'11px 24px' }} onClick={connect}>
              Connect MetaMask
            </button>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
