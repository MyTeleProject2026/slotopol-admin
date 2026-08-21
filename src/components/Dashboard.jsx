import { useEffect, useState } from 'react'
import api from '../api/client'

export default function Dashboard() {
  const [logs, setLogs] = useState([])

  // Simulate fetching live logs. In the future, your backend can provide a /logs endpoint.
  useEffect(() => {
    // Connect to a fake log generator for demo purposes
    const interval = setInterval(() => {
      const now = new Date().toLocaleTimeString()
      const types = ['INFO', 'WARN', 'ERROR']
      const type = types[Math.floor(Math.random() * types.length)]
      const messages = [
        'User 3 (Player) spin success on Novomatic/DolphinsPearl',
        'API /game/list called by Admin',
        'Club 1 bank updated: +5000 credits',
        'Allocation #102 PENDING created for Club 2',
        'Database connection keep-alive ping OK',
        'User 1 (Admin) logged in successfully',
        'Game list retrieval failed: context deadline exceeded'
      ]
      const msg = messages[Math.floor(Math.random() * messages.length)]
      
      setLogs(prev => {
        const newLogs = [{ time: now, type, msg }, ...prev]
        return newLogs.slice(0, 100) // keep last 100 logs
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div>
      <h2>Main Control Center</h2>
      <div className="dashboard-grid">
        <div className="glass-card stat-card gold-border">
          <span className="stat-icon">🏛️</span>
          <div className="stat-value">3</div>
          <div className="stat-label">Active Clubs</div>
        </div>
        <div className="glass-card stat-card cyan-border">
          <span className="stat-icon">🧑‍💻</span>
          <div className="stat-value">12</div>
          <div className="stat-label">Total Users</div>
        </div>
        <div className="glass-card stat-card pink-border">
          <span className="stat-icon">🎮</span>
          <div className="stat-value">172</div>
          <div className="stat-label">Games Available</div>
        </div>
        <div className="glass-card stat-card purple-border">
          <span className="stat-icon">💰</span>
          <div className="stat-value">$1,000,000</div>
          <div className="stat-label">Master Bank</div>
        </div>
      </div>

      {/* LIVE TERMINAL LOGS */}
      <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(249,200,14,0.1)', background: 'rgba(0,0,0,0.3)' }}>
          <span style={{ fontFamily: 'Orbitron', fontSize: '14px', color: '#F9C80E' }}>📡 LIVE BACKEND ACTIVITY TERMINAL</span>
        </div>
        <div className="terminal-window">
          {logs.length === 0 && <div style={{ color: '#666' }}>Waiting for backend activity...</div>}
          {logs.map((log, idx) => (
            <div key={idx} className="log-line">
              <span className="log-time">[{log.time}]</span>
              <span className={`log-level-${log.type.toLowerCase()}`}>[{log.type}]</span>
              <span>{log.msg}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
