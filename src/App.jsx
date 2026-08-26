import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import Clubs from './components/Clubs'
import Users from './components/Users'
import Games from './components/Games'
import Allocations from './components/Allocations'
import ClubConfiguration from './components/ClubConfiguration'
import CurrencyOverview from './components/CurrencyOverview'
import CurrencyLedger from './components/CurrencyLedger'
import CurrencyTransferCenter from './components/CurrencyTransferCenter'
import CurrencyReconciliation from './components/CurrencyReconciliation'
import OperationsCenter from './components/OperationsCenter'
import GameCapabilities from './components/GameCapabilities'
import ControlPlane from './components/ControlPlane'
import GovernanceCenter from './components/GovernanceCenter'
import AuditCenter from './components/AuditCenter'
import SettlementCenter from './components/SettlementCenter'
import AccessControlCenter from './components/AccessControlCenter'

function PrivateRoute({children}) {
  const token = localStorage.getItem('token')
  const adminAccess = localStorage.getItem('adminAccess')
  return token && adminAccess ? children : <Navigate to="/login" replace />
}

function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('adminUid')
  localStorage.removeItem('adminAccess')
  sessionStorage.clear()
  window.location.replace('/login')
}

const navItems=[{path:'/',label:'Dashboard',icon:'📊'},{path:'/governance',label:'Governance',icon:'🧭'},{path:'/control-plane',label:'Control Plane',icon:'🎛️'},{path:'/audit',label:'Audit',icon:'📜'},{path:'/settlement',label:'Settlement',icon:'🧾'},{path:'/access-control',label:'Access Control',icon:'🔐'},{path:'/currency-overview',label:'Currency Overview',icon:'💱'},{path:'/currency-ledger',label:'Currency Ledger',icon:'📒'},{path:'/currency-transfer',label:'Virtual Treasury',icon:'🔄'},{path:'/currency-reconciliation',label:'Currency Reconciliation',icon:'⚖️'},{path:'/operations',label:'Operations',icon:'🛡️'},{path:'/clubs',label:'Clubs',icon:'🏛️'},{path:'/users',label:'Users',icon:'🧑‍💻'},{path:'/games',label:'Game Control',icon:'🎮'},{path:'/game-capabilities',label:'Capabilities',icon:'🧩'},{path:'/allocations',label:'Treasury',icon:'💰'},{path:'/club-configuration',label:'Club Config',icon:'🌏'}]
function Sidebar(){const l=useLocation();return <aside className="sidebar" aria-label="Primary navigation"><div className="sidebar-brand">🎰 Slotopol</div><nav className="sidebar-links">{navItems.map(i=><Link key={i.path} to={i.path} className={l.pathname===i.path?'sidebar-item active':'sidebar-item'}><span>{i.icon}</span><span>{i.label}</span></Link>)}</nav><button type="button" onClick={logout} className="sidebar-logout">🚪 Logout</button></aside>}
function BottomNav(){const l=useLocation();return <nav className="bottom-nav">{navItems.slice(0,5).map(i=><Link key={i.path} to={i.path} className={l.pathname===i.path?'bottom-item active':'bottom-item'}><span className="bottom-icon">{i.icon}</span><span className="bottom-label">{i.label}</span></Link>)}<button type="button" className="bottom-item bottom-logout" onClick={logout}><span className="bottom-icon">🚪</span><span className="bottom-label">Logout</span></button></nav>}
function MobileHeader(){const l=useLocation(),i=navItems.find(e=>e.path===l.pathname);return <header className="mobile-header"><strong>🎰 Slotopol</strong><span>{i?.label||'Admin'}</span><button type="button" className="mobile-logout" onClick={logout}>🚪</button></header>}
function Layout({children}){return <div className="app-wrapper"><Sidebar/><div className="main-content"><MobileHeader/><main className="page-shell">{children}</main></div><BottomNav/></div>}
function Page({children}){return <PrivateRoute><Layout><div className="glass-card page-card">{children}</div></Layout></PrivateRoute>}
export default function App(){return <Routes><Route path="/login" element={<Login/>}/><Route path="/" element={<Page><Dashboard/></Page>}/><Route path="/governance" element={<Page><GovernanceCenter/></Page>}/><Route path="/control-plane" element={<Page><ControlPlane/></Page>}/><Route path="/audit" element={<Page><AuditCenter/></Page>}/><Route path="/settlement" element={<Page><SettlementCenter/></Page>}/><Route path="/access-control" element={<Page><AccessControlCenter/></Page>}/><Route path="/currency-overview" element={<Page><CurrencyOverview/></Page>}/><Route path="/currency-ledger" element={<Page><CurrencyLedger/></Page>}/><Route path="/currency-transfer" element={<Page><CurrencyTransferCenter/></Page>}/><Route path="/currency-reconciliation" element={<Page><CurrencyReconciliation/></Page>}/><Route path="/operations" element={<Page><OperationsCenter/></Page>}/><Route path="/clubs" element={<Page><Clubs/></Page>}/><Route path="/users" element={<Page><Users/></Page>}/><Route path="/games" element={<Page><Games/></Page>}/><Route path="/game-capabilities" element={<Page><GameCapabilities/></Page>}/><Route path="/allocations" element={<Page><Allocations/></Page>}/><Route path="/club-configuration" element={<Page><ClubConfiguration/></Page>}/></Routes>}
