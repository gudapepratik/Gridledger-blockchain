import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const SECTIONS = [
  {
    title:'Getting Started',
    steps:[
      { q:'What do I need to use GridLedger?', a:'You need the MetaMask browser extension and a small amount of Sepolia testnet ETH (for gas fees). GridLedger runs entirely on Sepolia — no real money is involved.' },
      { q:'How do I get Sepolia ETH?', a:'Visit the Alchemy Sepolia Faucet (faucet.alchemy.com) or the Google Cloud Faucet. Connect your MetaMask wallet and request test ETH — it arrives in minutes for free.' },
      { q:'How do I connect my wallet?', a:'Click the "Connect Wallet" button in the top-right navbar. MetaMask will ask you to approve the connection. Once connected, your address appears in the navbar with a green live indicator.' },
    ]
  },
  {
    title:'Energy Tokens (ERT)',
    steps:[
      { q:'What is an ERT token?', a:'ERT (EnergyToken) is a standard ERC-20 token on the Ethereum Sepolia network. Each token represents 1 Wh of generated energy. 1 kWh = 1,000 ERT.' },
      { q:'How do I earn ERT?', a:'The GridLedger oracle simulates solar panel readings every 30 seconds. When it detects generation, it automatically mints ERT to your wallet. You don\'t need to do anything — just stay connected.' },
      { q:'What happens when I consume energy?', a:'The oracle also burns ERT proportional to your consumption, keeping your net balance accurate. If you generate more than you consume, you have surplus to sell.' },
    ]
  },
  {
    title:'Trading on the Marketplace',
    steps:[
      { q:'How do I sell my surplus ERT?', a:'Go to Market → click "Sell Energy". Enter the amount of ERT and your asking price in ETH per token. Your tokens are locked in the smart contract escrow until a buyer fills your order.' },
      { q:'How do I buy energy?', a:'Browse the listings on the Market page. Click the → arrow on any listing, enter the quantity you want to buy, and confirm. The ETH is transferred atomically while ERT is released from escrow to you.' },
      { q:'Can I cancel my sell order?', a:'Yes — you can cancel any active order you created. The escrowed tokens are returned to your wallet in the same transaction. A cancel button will appear in your History tab (coming soon).' },
    ]
  },
  {
    title:'Safety & Transparency',
    steps:[
      { q:'Is my private key ever exposed?', a:'No. GridLedger uses the MetaMask browser extension for all signing. Your private key never leaves MetaMask. The backend oracle has its own separate key that only controls the ERT mint/burn functions.' },
      { q:'Where can I see the smart contract code?', a:'All contracts are open source on the project\'s GitHub repository and verified on Sepolia Etherscan. You can read every function before interacting.' },
      { q:'What if the backend oracle goes down?', a:'The oracle is hosted on Render\'s free tier, which can sleep after 15 minutes of inactivity. A cron job pings it every 10 minutes. If readings pause temporarily, they\'ll resume once the service wakes up. The Marketplace always remains live on-chain.' },
    ]
  },
]

function Accordion({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom:'1px solid var(--ink-rule)' }}>
      <button onClick={()=>setOpen(o=>!o)} style={{
        width:'100%', display:'flex', justifyContent:'space-between', alignItems:'center',
        padding:'16px 0', background:'none', border:'none', cursor:'pointer',
        fontFamily:'var(--font)', fontWeight:600, fontSize:15, color:'var(--text)',
        textAlign:'left', gap:12,
      }}>
        {q}
        <ChevronDown size={16} color="var(--ink-dim)"
          style={{ flexShrink:0, transform: open?'rotate(180deg)':'none', transition:'transform 0.22s' }}/>
      </button>
      <div style={{
        maxHeight: open?500:0, overflow:'hidden',
        transition:'max-height 0.3s cubic-bezier(0.22,1,0.36,1)',
      }}>
        <p style={{ fontSize:14, lineHeight:1.75, color:'var(--ink-dim)', paddingBottom:16 }}>{a}</p>
      </div>
    </div>
  )
}

export default function Help() {
  return (
    <div className="page">
      <div className="wrap" style={{ paddingTop:40, paddingBottom:72, maxWidth:820, margin:'0 auto' }}>

        {/* Header */}
        <div className="fu" style={{ marginBottom:40 }}>
          <div className="section-eyebrow" style={{ marginBottom:12 }}>Help Center</div>
          <h1 style={{ fontSize:48, fontWeight:800, letterSpacing:'-0.04em', lineHeight:1, marginBottom:14 }}>
            How does<br/>GridLedger work?
          </h1>
          <p style={{ fontSize:16, color:'var(--ink-dim)', lineHeight:1.7, maxWidth:540 }}>
            Everything you need to know to start generating, trading, and earning on the platform.
          </p>
        </div>

        {/* Quick-start banner */}
        <div className="fu d1" style={{ background:'var(--lime)', borderRadius:'var(--r-lg)', padding:'22px 28px', marginBottom:36 }}>
          <div style={{ fontFamily:'var(--display)', fontWeight:800, fontSize:16, color:'var(--on-lime)', marginBottom:8 }}>⚡ Quick Start in 3 steps</div>
          <div style={{ display:'flex', gap:32, flexWrap:'wrap' }}>
            {['1. Install MetaMask', '2. Get Sepolia ETH from a faucet', '3. Connect & start trading'].map((s,i)=>(
              <div key={i} style={{ fontSize:14, fontWeight:600, color:'var(--on-lime)', display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ width:22, height:22, borderRadius:'50%', background:'var(--on-lime)', color:'var(--lime)', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, flexShrink:0 }}>{i+1}</span>
                {s.slice(3)}
              </div>
            ))}
          </div>
        </div>

        {/* Accordion sections */}
        {SECTIONS.map((sec, si) => (
          <div key={si} className="fu" style={{ animationDelay:`${si*0.05}s`, marginBottom:32 }}>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:4 }}>
              <h2 style={{ fontFamily:'var(--display)', fontWeight:800, fontSize:20 }}>{sec.title}</h2>
              <div style={{ flex:1, height:1, background:'var(--ink-rule)' }}/>
            </div>
            {sec.steps.map((item, qi) => (
              <Accordion key={qi} q={item.q} a={item.a}/>
            ))}
          </div>
        ))}

        {/* Still stuck */}
        <div className="fu d4" style={{ background:'var(--ink)', borderRadius:'var(--r-lg)', padding:'28px 32px', marginTop:8, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:16 }}>
          <div>
            <div style={{ fontFamily:'var(--display)', fontWeight:800, fontSize:18, color:'var(--on-ink)', marginBottom:5 }}>Still have questions?</div>
            <div style={{ fontSize:14, color:'var(--on-ink-sub)' }}>The project is open-source — you can read the code or open a GitHub issue.</div>
          </div>
          <a href="https://github.com/gudapepratik/Gridledger-blockchain" target="_blank" rel="noopener noreferrer"
            className="btn btn-lime" style={{ fontSize:13 }}>
            View on GitHub
          </a>
        </div>

      </div>
    </div>
  )
}
