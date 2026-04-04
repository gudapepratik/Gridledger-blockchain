import { ExternalLink, Zap, Flame, ArrowRightLeft } from 'lucide-react'

const typeConfig = {
  generation: { label: 'Generated',  icon: Zap,           color: 'var(--accent)', badge: 'badge-yellow' },
  consumption: { label: 'Consumed',  icon: Flame,          color: 'var(--green)',  badge: 'badge-green'  },
  trade:       { label: 'Trade',     icon: ArrowRightLeft, color: '#93b4f0',      badge: 'badge-blue'   },
}

export default function TransactionFeed({ transactions = [] }) {
  const demo = [
    { type: 'generation', kwh: 2.34, txHash: '0xabc...123', time: '2 min ago' },
    { type: 'trade',      kwh: 5.00, txHash: '0xdef...456', time: '8 min ago' },
    { type: 'consumption',kwh: 1.12, txHash: '0xghi...789', time: '15 min ago' },
    { type: 'generation', kwh: 3.67, txHash: '0xjkl...012', time: '22 min ago' },
    { type: 'trade',      kwh: 10.0, txHash: '0xmno...345', time: '31 min ago' },
  ]

  const items = transactions.length ? transactions : demo
  const isDemo = !transactions.length

  return (
    <div className="card" style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15 }}>Recent Activity</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Last 10 on-chain events</div>
        </div>
        <span className="pulse-dot" />
      </div>

      {isDemo && (
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12, fontStyle: 'italic' }}>
          Connect wallet to see your activity
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map((tx, i) => {
          const cfg = typeConfig[tx.type] || typeConfig.generation
          const Icon = cfg.icon
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 14px', borderRadius: 10,
              background: 'rgba(0,31,63,0.4)',
              border: '1px solid var(--border-subtle)',
              transition: 'border-color 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-strong)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
            >
              <div style={{
                width: 34, height: 34, borderRadius: 9,
                background: `${cfg.color}1a`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <Icon size={16} color={cfg.color} />
              </div>
              <div style={{ flexGrow: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className={`badge ${cfg.badge}`}>{cfg.label}</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: cfg.color }}>
                    {tx.kwh?.toFixed(2)} kWh
                  </span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{tx.time}</div>
              </div>
              {tx.txHash && (
                <a
                  href={`https://sepolia.etherscan.io/tx/${tx.txHash}`}
                  target="_blank" rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  style={{ color: 'var(--text-muted)', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
