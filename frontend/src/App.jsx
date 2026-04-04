import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { WalletProvider } from './context/WalletContext'
import { ThemeProvider } from './context/ThemeContext'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Marketplace from './pages/Marketplace'
import History from './pages/History'
import Profile from './pages/Profile'
import About from './pages/About'
import Help from './pages/Help'
import Terms from './pages/Terms'

export default function App() {
  return (
    <ThemeProvider>
      <WalletProvider>
        <Navbar />
        <Routes>
          <Route path="/"            element={<Dashboard />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/history"     element={<History />} />
          <Route path="/profile"     element={<Profile />} />
          <Route path="/about"       element={<About />} />
          <Route path="/help"        element={<Help />} />
          <Route path="/terms"       element={<Terms />} />
          <Route path="*"            element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'var(--ink)',
              color: 'var(--cream)',
              border: '1px solid var(--ink-rule)',
              borderRadius: '12px',
              fontFamily: 'var(--font)',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: 'var(--lime)', secondary: 'var(--ink)' } },
            error:   { iconTheme: { primary: '#f87171', secondary: '#fff' } },
          }}
        />
      </WalletProvider>
    </ThemeProvider>
  )
}
