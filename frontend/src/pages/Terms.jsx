import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, X } from 'lucide-react'

const CLAUSES = [
  {
    title:'1. Nature of the Platform',
    body:`GridLedger is a demonstration platform operating on the Ethereum Sepolia Testnet. All transactions involve test ETH and ERT tokens that have no real-world monetary value. GridLedger is not a licensed energy exchange, financial service provider, or investment platform. Nothing on this platform constitutes financial advice.`,
  },
  {
    title:'2. Testnet Only',
    body:`You acknowledge that GridLedger operates exclusively on the Sepolia Testnet. Real ETH or mainnet assets must never be sent to addresses on this platform. Any loss of real assets resulting from mis-sent transactions is entirely the user\'s own responsibility.`,
  },
  {
    title:'3. Wallet Security',
    body:`You are solely responsible for the security of your MetaMask wallet and private keys. GridLedger never requests, stores, or has access to your private keys. You agree not to share your seed phrase with anyone, including the GridLedger team.`,
  },
  {
    title:'4. Smart Contract Risk',
    body:`Smart contracts are immutable code. While GridLedger contracts have been tested, they may contain bugs or vulnerabilities. You use the platform at your own risk. Testnet tokens that are lost due to contract errors cannot be recovered.`,
  },
  {
    title:'5. Oracle & Simulation',
    body:`Energy generation and consumption data is simulated by the GridLedger backend oracle. This data does not represent real-world energy readings. The simulation is for demonstration purposes only and should not be used for any energy reporting or billing.`,
  },
  {
    title:'6. Service Availability',
    body:`The backend oracle is hosted on Render\'s free tier and may experience interruptions (cold starts, maintenance). The on-chain Marketplace is always available as long as the Ethereum Sepolia network is operational. GridLedger provides no uptime guarantee for off-chain services.`,
  },
  {
    title:'7. Open Source',
    body:`GridLedger is open-source software licensed under the MIT License. You are free to fork, modify, and deploy your own instance. The project authors accept no liability for deployments made by third parties based on this code.`,
  },
  {
    title:'8. Changes to Terms',
    body:`These terms may be updated at any time. Continued use of the platform after changes constitutes acceptance of the new terms. We recommend checking this page periodically.`,
  },
]

export default function Terms() {
  const navigate = useNavigate()
  const [accepted, setAccepted] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const allAccepted = CLAUSES.every((_, i) => accepted[i])

  const handleSubmit = () => {
    if (!allAccepted) return
    localStorage.setItem('gl-terms-accepted', 'true')
    setSubmitted(true)
    setTimeout(() => navigate('/'), 1800)
  }

  if (submitted) {
    return (
      <div className="page" style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'80svh' }}>
        <div style={{ textAlign:'center' }}>
          <div style={{ width:64, height:64, borderRadius:'50%', background:'var(--lime)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
            <Check size={32} color="var(--ink)" strokeWidth={2.5}/>
          </div>
          <h2 style={{ fontFamily:'var(--display)', fontSize:24, fontWeight:800, marginBottom:8 }}>Terms Accepted</h2>
          <p style={{ color:'var(--ink-dim)', fontSize:15 }}>Redirecting to Dashboard…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="wrap" style={{ paddingTop:40, paddingBottom:72, maxWidth:820, margin:'0 auto' }}>

        {/* Header */}
        <div className="fu" style={{ marginBottom:32 }}>
          <div className="section-eyebrow" style={{ marginBottom:10 }}>Legal</div>
          <h1 style={{ fontSize:44, fontWeight:800, letterSpacing:'-0.04em', lineHeight:1, marginBottom:12 }}>
            Terms &amp; Conditions
          </h1>
          <p style={{ fontSize:15, color:'var(--ink-dim)', lineHeight:1.7, maxWidth:540 }}>
            Please read and individually accept each section before using the platform. Last updated: April 2026.
          </p>
        </div>

        {/* Progress bar */}
        <div className="fu d1" style={{ marginBottom:28 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
            <span style={{ fontSize:12, color:'var(--ink-dim)', fontWeight:500 }}>
              {Object.values(accepted).filter(Boolean).length} of {CLAUSES.length} sections accepted
            </span>
            <span style={{ fontSize:12, fontWeight:700, color: allAccepted?'var(--forest)':'var(--ink-dim)' }}>
              {allAccepted ? '✓ All accepted' : `${Math.round((Object.values(accepted).filter(Boolean).length/CLAUSES.length)*100)}%`}
            </span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{
              width:`${(Object.values(accepted).filter(Boolean).length/CLAUSES.length)*100}%`,
              background:'var(--forest)', transition:'width 0.4s var(--ease)',
            }}/>
          </div>
        </div>

        {/* Clauses */}
        <div className="fu d2" style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:28 }}>
          {CLAUSES.map((c, i) => {
            const isOk = !!accepted[i]
            return (
              <div key={i} style={{
                border: `1.5px solid ${isOk?'var(--forest)':'var(--ink-rule)'}`,
                borderRadius:'var(--r-lg)', overflow:'hidden',
                transition:'border-color 0.22s',
              }}>
                {/* Clause header */}
                <div style={{
                  padding:'16px 22px', background: isOk?'rgba(0,128,76,0.07)':'var(--paper)',
                  display:'flex', justifyContent:'space-between', alignItems:'center',
                  cursor:'pointer', transition:'background 0.18s',
                }}
                  onClick={()=>setAccepted(prev=>({...prev,[i]:!prev[i]}))}
                >
                  <div style={{ fontFamily:'var(--display)', fontWeight:700, fontSize:15, color:'var(--text)' }}>{c.title}</div>
                  <div style={{
                    width:26, height:26, borderRadius:'50%', flexShrink:0,
                    background: isOk?'var(--forest)':'transparent',
                    border:`2px solid ${isOk?'var(--forest)':'var(--ink-faint)'}`,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    transition:'all 0.2s var(--ease-back)',
                  }}>
                    {isOk && <Check size={13} color="#fff" strokeWidth={2.5}/>}
                  </div>
                </div>
                {/* Clause body */}
                <div style={{ padding:'0 22px 18px', paddingTop:14 }}>
                  <p style={{ fontSize:14, lineHeight:1.8, color:'var(--ink-dim)' }}>{c.body}</p>
                  <button onClick={()=>setAccepted(prev=>({...prev,[i]:!prev[i]}))}
                    className="btn" style={{
                      marginTop:14, fontSize:13, padding:'7px 16px',
                      background: isOk?'var(--forest)':'var(--paper)',
                      color: isOk?'#fff':'var(--text)',
                      border:`1px solid ${isOk?'transparent':'var(--ink-rule)'}`,
                      borderRadius:'var(--r-pill)', transition:'all 0.18s',
                    }}>
                    {isOk ? <><Check size={13}/> Accepted</> : 'I accept this clause'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Submit */}
        <div className="fu d3" style={{ position:'sticky', bottom:20, zIndex:50 }}>
          <div style={{
            background: allAccepted?'var(--lime)':'var(--paper)',
            borderRadius:'var(--r-lg)', border:'1px solid var(--ink-rule)',
            padding:'18px 24px', display:'flex', alignItems:'center', justifyContent:'space-between',
            transition:'background 0.3s', flexWrap:'wrap', gap:12,
            boxShadow:'0 8px 32px rgba(0,0,0,0.12)',
          }}>
            <div>
              <div style={{ fontFamily:'var(--display)', fontWeight:700, fontSize:15, color: allAccepted?'var(--ink)':'var(--ink-dim)' }}>
                {allAccepted ? '✓ You\'ve accepted all clauses' : 'Accept all clauses to continue'}
              </div>
              <div style={{ fontSize:12, color: allAccepted?'rgba(0,31,63,0.5)':'var(--ink-dim)', marginTop:3 }}>
                By proceeding you agree to these terms.
              </div>
            </div>
            <button className="btn" onClick={handleSubmit} disabled={!allAccepted}
              style={{
                background: allAccepted?'var(--ink)':'var(--ink-faint)',
                color: allAccepted?'var(--cream)':'var(--ink-dim)',
                padding:'12px 28px', fontSize:14, borderRadius:'var(--r-pill)',
                cursor: allAccepted?'pointer':'not-allowed', transition:'all 0.2s',
              }}>
              Proceed to Dashboard
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
