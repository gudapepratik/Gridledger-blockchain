import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--bg-glass)', border: '1px solid var(--border-subtle)',
      borderRadius: 10, padding: '10px 14px', backdropFilter: 'blur(12px)',
    }}>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontSize: 13, fontWeight: 600, color: p.color }}>
          {p.value.toFixed(2)} kWh
        </div>
      ))}
    </div>
  )
}

export default function EnergyChart({ data = [], title = 'Energy' }) {
  const isEmpty = !data.length

  // Mock data if empty
  const chartData = isEmpty
    ? Array.from({ length: 24 }, (_, i) => ({
        hour: `${i}:00`,
        generation: i >= 6 && i <= 18 ? Math.max(0, 5 * Math.sin(((i - 6) * Math.PI) / 12)) * (0.85 + Math.random() * 0.3) : 0,
        consumption: 0.4 + Math.random() * 0.6 + (i >= 7 && i <= 9 || i >= 18 && i <= 21 ? 1.2 : 0),
      }))
    : data

  return (
    <div className="card" style={{ padding: '24px 20px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, color: 'var(--text-primary)' }}>{title}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Last 24 hours</div>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          {[{ color: 'var(--accent)', label: 'Generation' }, { color: 'var(--green)', label: 'Consumption' }].map(({ color, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: color, display: 'inline-block' }} />
              {label}
            </div>
          ))}
        </div>
      </div>

      {isEmpty && (
        <div style={{ textAlign: 'center', marginBottom: 4, fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>
          Showing sample data — connect wallet to see live readings
        </div>
      )}

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: -30 }}>
          <defs>
            <linearGradient id="genGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#DBE64C" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#DBE64C" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="conGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#74C365" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#74C365" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="hour" tick={{ fill: 'rgba(246,247,237,0.35)', fontSize: 10 }} axisLine={false} tickLine={false} interval={3} />
          <YAxis tick={{ fill: 'rgba(246,247,237,0.35)', fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="generation" stroke="#DBE64C" strokeWidth={2} fill="url(#genGrad)" dot={false} />
          <Area type="monotone" dataKey="consumption" stroke="#74C365" strokeWidth={2} fill="url(#conGrad)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
