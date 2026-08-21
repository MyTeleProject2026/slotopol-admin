import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import Clubs from './components/Clubs'
import Users from './components/Users'
import Games from './components/Games'
import Allocations from './components/Allocations'

// PrivateRoute protects pages that require login
function PrivateRoute({ children }) {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" />
}

// Layout wrapper for authenticated pages (adds the top navigation)
function Layout({ children }) {
  const location = useLocation()
  
  const handleLogout = () => {
    localStorage.removeItem('token')
    window.location.href = '/login'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', padding: '20px' }}>
      <nav>
        <span style={{ fontWeight: 'bold', marginRight: '20px', color: '#333' }}>
          Slotopol Admin
        </span>
        <Link to="/">Dashboard</Link>
        <Link to="/clubs">Clubs</Link>
        <Link to="/users">Users</Link>
        <Link to="/games">Games</Link>
        <Link to="/allocations">Allocations</Link>
        <button 
          onClick={handleLogout} 
          style={{
            float: 'right',
            background: '#e53e3e',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            width: 'auto'
          }}
        >
          Logout
        </button>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '20px auto' }}>
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
              <Dashboard />
            </Layout>
          </PrivateRoute>
        } 
      />
      
      <Route 
        path="/clubs" 
        element={
          <PrivateRoute>
            <Layout>
              <Clubs />
            </Layout>
          </PrivateRoute>
        } 
      />
      
      <Route 
        path="/users" 
        element={
          <PrivateRoute>
            <Layout>
              <Users />
            </Layout>
          </PrivateRoute>
        } 
      />
      
      <Route 
        path="/games" 
        element={
          <PrivateRoute>
            <Layout>
              <Games />
            </Layout>
          </PrivateRoute>
        } 
      />
      
      <Route 
        path="/allocations" 
        element={
          <PrivateRoute>
            <Layout>
              <Allocations />
            </Layout>
          </PrivateRoute>
        } 
      />
    </Routes>
  )
}

export default App
