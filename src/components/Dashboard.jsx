import { useEffect, useState } from 'react'
import api from '../api/client'

export default function Dashboard() {
  const [state, setState] = useState({ loading: true, error: '', server: null, clubs: 0, users: 0, games: 0, currencies: 0 })

  const load = async () => {
    setState(current => ({ ...current, loading: true, error: '' }))
    try {
      const [server, clubs, users, games, currencies] = await Promise.all([
        api.get('/servinfo'),
        api.post('/club/list', {}),
        api.get('/admin/users'),
        api.get('/game/list', { params: { inc: 'all', sort: true } }),
        api.get('/admin/club/currency-balances')
      ])
      const clubRows = Array.isArray(clubs.data) ? clubs.data : (clubs.data?.clubs || clubs.data?.list || clubs.data?.data || [])
      const userRows = users.data?.users || []
      const gameRows = games.data?.list || []
      const currencyRows = currencies.data?.balances || []
      setState({ loading: false, error: '', server: server.data, clubs: clubRows.length, users: userRows.length, games: gameRows.length, currencies: currencyRows.length })
    } catch (e) {
      setState(current => ({ ...current, loading: false, error: e.response?.data?.what || e.message || 'Unable to load live server state' }))
    }
  }

  useEffect(() => { load() }, [])

  const cards = [
    ['🏛️', state.clubs, 'Clubs'],
    ['🧑‍💻', state.users, 'Users'],
    ['🎮', state.games, 'Games Available'],
    ['💱', state.currencies, 'Currency Balances']
  ]

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><h2>Main Control Center</h2><button className="action-btn action-btn-save" onClick={load} disabled={state.loading}>{state.loading ? 'Refreshing…' : 'Refresh'}</button></div>
      {state.error && <div className="error-message">{state.error}</div>}
      <div className="dashboard-grid">
        {cards.map(([icon, value, label]) => <div className="glass-card stat-card" key={label}><span className="stat-icon">{icon}</span><div className="stat-value">{state.loading ? '…' : value.toLocaleString()}</div><div className="stat-label">{label}</div></div>)}
      </div>
      <div className="glass-card" style={{padding:'20px'}}>
        <h3>Server Connection</h3>
        <p>{state.server ? `Connected to Slotopol-server ${state.server.version || state.server.build || ''}` : 'Waiting for server response…'}</p>
        <p style={{color:'#888'}}>All dashboard figures above are fetched from the configured Slotopol-server; no demo/random activity is generated in the browser.</p>
      </div>
    </div>
  )
}
