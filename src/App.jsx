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

function Layout({ children }) {
  const location = useLocation()

  const handleLogout = () => {
    localStorage.removeItem('token')
    window.location.href = '/login'
  }

  return (
    <div className="app-wrapper">
      {/* Glass Navigation Bar */}
      <nav className="nav-glass">
        <div className="nav-brand">🎰 Slotopol Admin</div>
        <div className="nav-links">
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Dashboard</Link>
          <Link to="/clubs" className={location.pathname === '/clubs' ? 'active' : ''}>Clubs</Link>
          <Link to="/users" className={location.pathname === '/users' ? 'active' : ''}>Users</Link>
          <Link to="/games" className={location.pathname === '/games' ? 'active' : ''}>Games</Link>
          <Link to="/allocations" className={location.pathname === '/allocations' ? 'active' : ''}>Allocations</Link>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="content-area">
        {children}
      </div>
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
