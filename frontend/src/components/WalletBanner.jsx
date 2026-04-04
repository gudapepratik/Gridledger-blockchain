export default function WalletBanner({ onConnect }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(0,128,76,0.15) 0%, rgba(219,230,76,0.08) 100%)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-xl)',
      padding: '48px 40px',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* decorative corners */}
      <div style={{ position:'absolute', top:0, left:0, width:120, height:120, background:'radial-gradient(circle at top left, rgba(219,230,76,0.12), transparent 70%)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:0, right:0, width:120, height:120, background:'radial-gradient(circle at bottom right, rgba(116,195,101,0.1), transparent 70%)', pointerEvents:'none' }} />

      <div style={{
        width: 64, height: 64, borderRadius: 20,
        background: 'linear-gradient(135deg, var(--accent), var(--green))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 20px',
        boxShadow: 'var(--shadow-glow)',
      }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#001F3F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/>
          <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/>
          <path d="M18 12a2 2 0 0 0 0 4h4v-4z"/>
        </svg>
      </div>

      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, marginBottom: 10 }}>
        Connect your wallet to start trading
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: 15, maxWidth: 420, margin: '0 auto 28px', lineHeight: 1.6 }}>
        GridLedger uses MetaMask for identity and signing. Connect your wallet to view your dashboard, buy and sell energy tokens.
      </p>
      <button className="btn-accent" style={{ fontSize: 16, padding: '12px 32px' }} onClick={onConnect}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/></svg>
        Connect MetaMask
      </button>
      <p style={{ marginTop: 14, fontSize: 12, color: 'var(--text-muted)' }}>
        Currently on Sepolia Testnet — no real funds required
      </p>
    </div>
  )
}
