import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import Clubs from './components/Clubs'
import Users from './components/Users'
import Games from './components/Games'
import Allocations from './components/Allocations'
import ClubConfiguration from './components/ClubConfiguration'

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" />
}

function Sidebar() {
  const location = useLocation()
  const handleLogout = () => {
    localStorage.removeItem('token')
    window.location.href = '/login'
  }
  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/clubs', label: 'Clubs', icon: '🏛️' },
    { path: '/users', label: 'Users', icon: '🧑‍💻' },
    { path: '/games', label: 'Games', icon: '🎮' },
    { path: '/allocations', label: 'Allocations', icon: '💰' },
    { path: '/club-configuration', label: 'Club Config', icon: '🌏' },
  ]
  return (
    <div className="sidebar">
      <div className="sidebar-brand">🎰 Slotopol</div>
      <div className="sidebar-links">
        {navItems.map((item) => (
          <Link key={item.path} to={item.path} className={location.pathname === item.path ? 'sidebar-item active' : 'sidebar-item'}>
            <span>{item.icon}</span> {item.label}
          </Link>
        ))}
      </div>
      <button onClick={handleLogout} className="sidebar-logout">🚪 Logout</button>
    </div>
  )
}

function BottomNav() {
  const location = useLocation()
  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/clubs', label: 'Clubs', icon: '🏛️' },
    { path: '/games', label: 'Games', icon: '🎮' },
    { path: '/allocations', label: 'Balance', icon: '💰' },
    { path: '/club-configuration', label: 'Config', icon: '🌏' },
  ]
  return (
    <div className="bottom-nav">
      {navItems.map((item) => (
        <Link key={item.path} to={item.path} className={location.pathname === item.path ? 'bottom-item active' : 'bottom-item'}>
          <span className="bottom-icon">{item.icon}</span>
          <span className="bottom-label">{item.label}</span>
        </Link>
      ))}
    </div>
  )
}

function Layout({ children }) {
  return (
    <div className="app-wrapper">
      <Sidebar />
      <div className="main-content">{children}</div>
      <BottomNav />
    </div>
  )
}

function Page({ children }) {
  return <PrivateRoute><Layout><div className="glass-card">{children}</div></Layout></PrivateRoute>
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
