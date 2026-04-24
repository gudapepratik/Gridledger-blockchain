import { NavLink, useNavigate } from 'react-router-dom'
import { useWallet } from '../context/WalletContext'
import { useTheme } from '../context/ThemeContext'
import { useState } from 'react'
import { Sun, Moon, X, Menu } from 'lucide-react'

const links = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/marketplace', label: 'Market' },
  { to: '/history', label: 'History' },
  { to: '/profile', label: 'Profile' },
  { to: '/about', label: 'About' },
  { to: '/help', label: 'Help' },
]

export default function Navbar() {
  const { isConnected, account, truncateAddress, connect, disconnect, isConnecting, switchAccount } = useWallet()
  const { dark, toggle } = useTheme()
  const [walletOpen, setWalletOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <nav className="nav">
        {/* Logo */}
        <NavLink to="/" className="nav-logo" onClick={() => setMobileOpen(false)}>
          <div className="nav-logo-mark">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={dark ? '#12140D' : '#001F3F'} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
          </div>
          GridLedger
        </NavLink>

        {/* Desktop links */}
        <div className="nav-links">
          {links.map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              {label}
            </NavLink>
          ))}
        </div>

        {/* Right controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>

          {/* Dark mode toggle */}
          <button className="btn-ghost" onClick={toggle} title={dark ? 'Light mode' : 'Dark mode'}
            style={{ padding: 6 }}>
            {dark
              ? <Sun size={17} style={{ color: 'var(--lime)' }} />
              : <Moon size={17} />}
          </button>

          {/* Wallet — desktop */}
          <div style={{ position: 'relative' }} className="nav-wallet-desktop">
            {isConnected ? (
              <>
                <button className="btn btn-outline" style={{ fontSize: 13, padding: '7px 16px', display: 'flex', alignItems: 'center', gap: 7 }}
                  onClick={() => setWalletOpen(o => !o)}>
                  <span className="live-dot" />
                  {truncateAddress(account)}
                </button>
                {walletOpen && (
                  <>
                    <div onClick={() => setWalletOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 150 }} />
                    <div style={{
                      position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                      background: 'var(--bg)', border: '1px solid var(--ink-rule)',
                      borderRadius: 'var(--r-md)', padding: 14, minWidth: 230, zIndex: 200,
                      boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                      animation: 'fade-up 0.18s var(--ease) both',
                    }}>
                      <div style={{ fontSize: 10, color: 'var(--ink-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Connected</div>
                      <div style={{ fontSize: 12, fontFamily: 'monospace', wordBreak: 'break-all', marginBottom: 12, color: 'var(--text)', lineHeight: 1.5 }}>{truncateAddress(account)}</div>
                      <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', fontSize: 13, color: '#b91c1c', borderColor: 'rgba(220,38,38,0.25)', marginBottom: 8 }}
                        onClick={() => { disconnect(); setWalletOpen(false) }}>Disconnect</button>
                      <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', fontSize: 12, color: 'var(--ink-dim)' }}
                        onClick={() => { switchAccount(); setWalletOpen(false) }}>Switch Account</button>
                    </div>
                  </>
                )}
              </>
            ) : (
              <button className="btn btn-ink" onClick={connect} disabled={isConnecting} style={{ fontSize: 13 }}>
                {isConnecting ? 'Connecting…' : 'Connect Wallet'}
              </button>
            )}
          </div>

          {/* Hamburger */}
          <button className="hamburger" onClick={() => setMobileOpen(o => !o)} aria-label="Menu">
            {mobileOpen
              ? <><span style={{ transform: 'rotate(45deg) translate(5px, 5px)' }} /><span style={{ opacity: 0 }} /><span style={{ transform: 'rotate(-45deg) translate(5px, -5px)' }} /></>
              : <><span /><span /><span /></>}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="nav-mobile-menu open">
          {links.map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end}
              className="nav-mobile-link"
              onClick={() => setMobileOpen(false)}>
              {label}
            </NavLink>
          ))}
          <div style={{ paddingTop: 16 }}>
            {isConnected ? (
              <div>
                <div style={{ fontSize: 12, color: 'var(--ink-dim)', marginBottom: 8, fontFamily: 'monospace' }}>{truncateAddress(account)}</div>
                <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', color: '#b91c1c', borderColor: 'rgba(220,38,38,0.25)', marginBottom: 8 }}
                  onClick={() => { disconnect(); setMobileOpen(false) }}>Disconnect Wallet</button>
                <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', fontSize: 14, color: 'var(--ink-dim)' }}
                  onClick={() => { switchAccount(); setMobileOpen(false) }}>Switch Account</button>
              </div>
            ) : (
              <button className="btn btn-ink" style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => { connect(); setMobileOpen(false) }}>Connect Wallet</button>
            )}
          </div>
        </div>
      )}
    </>
  )
}
