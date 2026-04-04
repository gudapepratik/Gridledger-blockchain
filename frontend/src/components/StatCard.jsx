import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export default function StatCard({ label, value, sub, icon: Icon, trend, color = 'default', delay = 0 }) {
  const colorMap = {
    default: { iconBg: 'rgba(219,230,76,0.12)', iconColor: 'var(--accent)' },
    green:   { iconBg: 'rgba(116,195,101,0.12)', iconColor: 'var(--green)' },
    blue:    { iconBg: 'rgba(30,72,143,0.3)', iconColor: '#93b4f0' },
    red:     { iconBg: 'rgba(239,68,68,0.12)', iconColor: '#f87171' },
  }
  const c = colorMap[color] || colorMap.default

  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus
  const trendColor = trend > 0 ? 'var(--green)' : trend < 0 ? '#f87171' : 'var(--text-muted)'

  return (
    <div className={`card animate-fade-up delay-${delay}`} style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 12,
          background: c.iconBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {Icon && <Icon size={20} color={c.iconColor} />}
        </div>
        {trend !== undefined && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: trendColor, fontSize: 12, fontWeight: 600 }}>
            <TrendIcon size={13} />
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="metric-value">{value}</div>
      <div className="metric-label">{label}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>{sub}</div>}
    </div>
  )
}
