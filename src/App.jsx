import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import Clubs from './components/Clubs'
import Users from './components/Users'
import Games from './components/Games'
import Allocations from './components/Allocations'

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" />
}

/* ===============================================
   DESKTOP SIDEBAR
   =============================================== */
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
  ]

  return (
    <div className="sidebar">
      <div className="sidebar-brand">🎰 Slotopol</div>
      <div className="sidebar-links">
        {navItems.map((item) => (
          <Link 
            key={item.path} 
            to={item.path} 
            className={location.pathname === item.path ? 'sidebar-item active' : 'sidebar-item'}
          >
            <span>{item.icon}</span> {item.label}
          </Link>
        ))}
      </div>
      <button onClick={handleLogout} className="sidebar-logout">
        🚪 Logout
      </button>
    </div>
  )
}

/* ===============================================
   MOBILE BOTTOM NAVIGATION
   =============================================== */
function BottomNav() {
  const location = useLocation()
  
  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/clubs', label: 'Clubs', icon: '🏛️' },
    { path: '/users', label: 'Users', icon: '🧑‍💻' },
    { path: '/games', label: 'Games', icon: '🎮' },
    { path: '/allocations', label: 'Allocations', icon: '💰' },
  ]

  return (
    <div className="bottom-nav">
      {navItems.map((item) => (
        <Link 
          key={item.path} 
          to={item.path} 
          className={location.pathname === item.path ? 'bottom-item active' : 'bottom-item'}
        >
          <span className="bottom-icon">{item.icon}</span>
          <span className="bottom-label">{item.label}</span>
        </Link>
      ))}
    </div>
  )
}

/* ===============================================
   MAIN LAYOUT WRAPPER
   =============================================== */
function Layout({ children }) {
  return (
    <div className="app-wrapper">
      {/* Desktop Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="main-content">
        {children}
      </div>

      {/* Mobile Bottom Nav */}
      <BottomNav />
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route 
        path="/" 
        element={
          <PrivateRoute>
            <Layout>
              <div className="glass-card"><Dashboard /></div>
            </Layout>
          </PrivateRoute>
        } 
      />
      
      <Route 
        path="/clubs" 
        element={
          <PrivateRoute>
            <Layout>
              <div className="glass-card"><Clubs /></div>
            </Layout>
          </PrivateRoute>
        } 
      />
      
      <Route 
        path="/users" 
        element={
          <PrivateRoute>
            <Layout>
              <div className="glass-card"><Users /></div>
            </Layout>
          </PrivateRoute>
        } 
      />
      
      <Route 
        path="/games" 
        element={
          <PrivateRoute>
            <Layout>
              <div className="glass-card"><Games /></div>
            </Layout>
          </PrivateRoute>
        } 
      />
      
      <Route 
        path="/allocations" 
        element={
          <PrivateRoute>
            <Layout>
              <div className="glass-card"><Allocations /></div>
            </Layout>
          </PrivateRoute>
        } 
      />
    </Routes>
  )
}

export default App
