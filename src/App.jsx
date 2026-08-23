import { Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import Clubs from './components/Clubs'
import Users from './components/Users'
import Games from './components/Games'
import Allocations from './components/Allocations'
import ClubConfiguration from './components/ClubConfiguration'

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" replace />
}

function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('refreshToken')
  sessionStorage.clear()
  window.location.replace('/login')
}

function Sidebar() {
  const location = useLocation()
  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/clubs', label: 'Clubs', icon: '🏛️' },
    { path: '/users', label: 'Users', icon: '🧑‍💻' },
    { path: '/games', label: 'Games', icon: '🎮' },
    { path: '/allocations', label: 'Allocations', icon: '💰' },
    { path: '/club-configuration', label: 'Club Config', icon: '🌏' },
  ]
  return (
    <aside className="sidebar" aria-label="Primary navigation">
      <div className="sidebar-brand">🎰 Slotopol</div>
      <nav className="sidebar-links">
        {navItems.map((item) => (
          <Link key={item.path} to={item.path} className={location.pathname === item.path ? 'sidebar-item active' : 'sidebar-item'}>
            <span aria-hidden="true">{item.icon}</span><span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <button type="button" onClick={logout} className="sidebar-logout">🚪 Logout</button>
    </aside>
  )
}

function BottomNav() {
  const location = useLocation()
  const navItems = [
    { path: '/', label: 'Home', icon: '📊' },
    { path: '/clubs', label: 'Clubs', icon: '🏛️' },
    { path: '/games', label: 'Games', icon: '🎮' },
    { path: '/allocations', label: 'Balance', icon: '💰' },
    { path: '/club-configuration', label: 'Config', icon: '🌏' },
  ]
  return (
    <nav className="bottom-nav" aria-label="Mobile navigation">
      {navItems.map((item) => (
        <Link key={item.path} to={item.path} className={location.pathname === item.path ? 'bottom-item active' : 'bottom-item'}>
          <span className="bottom-icon" aria-hidden="true">{item.icon}</span>
          <span className="bottom-label">{item.label}</span>
        </Link>
      ))}
      <button type="button" className="bottom-item bottom-logout" onClick={logout} aria-label="Logout">
        <span className="bottom-icon" aria-hidden="true">🚪</span>
        <span className="bottom-label">Logout</span>
      </button>
    </nav>
  )
}

function MobileHeader() {
  const location = useLocation()
  const labels = {
    '/': 'Dashboard',
    '/clubs': 'Clubs',
    '/users': 'Users',
    '/games': 'Games',
    '/allocations': 'Allocations',
    '/club-configuration': 'Club Configuration',
  }
  return (
    <header className="mobile-header">
      <strong>🎰 Slotopol</strong>
      <span>{labels[location.pathname] || 'Admin'}</span>
      <button type="button" className="mobile-logout" onClick={logout}>🚪</button>
    </header>
  )
}

function Layout({ children }) {
  return (
    <div className="app-wrapper">
      <Sidebar />
      <div className="main-content">
        <MobileHeader />
        <main className="page-shell">{children}</main>
      </div>
      <BottomNav />
    </div>
  )
}

function Page({ children }) {
  return <PrivateRoute><Layout><div className="glass-card page-card">{children}</div></Layout></PrivateRoute>
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Page><Dashboard /></Page>} />
      <Route path="/clubs" element={<Page><Clubs /></Page>} />
      <Route path="/users" element={<Page><Users /></Page>} />
      <Route path="/games" element={<Page><Games /></Page>} />
      <Route path="/allocations" element={<Page><Allocations /></Page>} />
      <Route path="/club-configuration" element={<Page><ClubConfiguration /></Page>} />
    </Routes>
  )
}

export default App
