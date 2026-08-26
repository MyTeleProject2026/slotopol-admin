import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import Clubs from './components/Clubs'
import Users from './components/Users'
import Games from './components/Games'
import Allocations from './components/Allocations'
import ClubConfiguration from './components/ClubConfiguration'
import OperationsCenter from './components/OperationsCenter'
import GameCapabilities from './components/GameCapabilities'
import ControlPlane from './components/ControlPlane'
import GovernanceCenter from './components/GovernanceCenter'
import AuditCenter from './components/AuditCenter'
import SettlementCenter from './components/SettlementCenter'

function PrivateRoute({ children }) { return localStorage.getItem('token') ? children : <Navigate to="/login" replace /> }
function logout() { localStorage.removeItem('token'); localStorage.removeItem('refreshToken'); sessionStorage.clear(); window.location.replace('/login') }
const navItems = [
  { path: '/', label: 'Dashboard', icon: '📊' }, { path: '/governance', label: 'Governance', icon: '🧭' },
  { path: '/control-plane', label: 'Control Plane', icon: '🎛️' }, { path: '/audit', label: 'Audit', icon: '📜' },
  { path: '/settlement', label: 'Settlement', icon: '🧾' }, { path: '/operations', label: 'Operations', icon: '🛡️' },
  { path: '/clubs', label: 'Clubs', icon: '🏛️' }, { path: '/users', label: 'Users', icon: '🧑‍💻' },
  { path: '/games', label: 'Game Control', icon: '🎮' }, { path: '/game-capabilities', label: 'Capabilities', icon: '🧩' },
  { path: '/allocations', label: 'Treasury', icon: '💰' }, { path: '/club-configuration', label: 'Club Config', icon: '🌏' },
]
function Sidebar() { const location = useLocation(); return <aside className="sidebar" aria-label="Primary navigation"><div className="sidebar-brand">🎰 Slotopol</div><nav className="sidebar-links">{navItems.map((item) => <Link key={item.path} to={item.path} className={location.pathname === item.path ? 'sidebar-item active' : 'sidebar-item'}><span>{item.icon}</span><span>{item.label}</span></Link>)}</nav><button type="button" onClick={logout} className="sidebar-logout">🚪 Logout</button></aside> }
function BottomNav() { const location = useLocation(); return <nav className="bottom-nav">{navItems.slice(0, 5).map((item) => <Link key={item.path} to={item.path} className={location.pathname === item.path ? 'bottom-item active' : 'bottom-item'}><span className="bottom-icon">{item.icon}</span><span className="bottom-label">{item.label}</span></Link>)}<button type="button" className="bottom-item bottom-logout" onClick={logout}><span className="bottom-icon">🚪</span><span className="bottom-label">Logout</span></button></nav> }
function MobileHeader() { const location = useLocation(); const item = navItems.find((entry) => entry.path === location.pathname); return <header className="mobile-header"><strong>🎰 Slotopol</strong><span>{item?.label || 'Admin'}</span><button type="button" className="mobile-logout" onClick={logout}>🚪</button></header> }
function Layout({ children }) { return <div className="app-wrapper"><Sidebar /><div className="main-content"><MobileHeader /><main className="page-shell">{children}</main></div><BottomNav /></div> }
function Page({ children }) { return <PrivateRoute><Layout><div className="glass-card page-card">{children}</div></Layout></PrivateRoute> }
export default function App() { return <Routes><Route path="/login" element={<Login />} /><Route path="/" element={<Page><Dashboard /></Page>} /><Route path="/governance" element={<Page><GovernanceCenter /></Page>} /><Route path="/control-plane" element={<Page><ControlPlane /></Page>} /><Route path="/audit" element={<Page><AuditCenter /></Page>} /><Route path="/settlement" element={<Page><SettlementCenter /></Page>} /><Route path="/operations" element={<Page><OperationsCenter /></Page>} /><Route path="/clubs" element={<Page><Clubs /></Page>} /><Route path="/users" element={<Page><Users /></Page>} /><Route path="/games" element={<Page><Games /></Page>} /><Route path="/game-capabilities" element={<Page><GameCapabilities /></Page>} /><Route path="/allocations" element={<Page><Allocations /></Page>} /><Route path="/club-configuration" element={<Page><ClubConfiguration /></Page>} /></Routes> }
