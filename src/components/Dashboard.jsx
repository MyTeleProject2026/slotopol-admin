import { useCallback, useEffect, useRef, useState } from 'react'
import api from '../api/client'

const baseURL = import.meta.env.VITE_API_URL

async function readLiveStream(onLog, onReady, signal) {
  const token = localStorage.getItem('token')
  const response = await fetch(`${baseURL}/admin/operations/stream`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'text/event-stream' },
    signal
  })
  if (!response.ok || !response.body) throw new Error(`Live log stream failed (${response.status})`)
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const frames = buffer.split('\n\n')
    buffer = frames.pop() || ''
    for (const frame of frames) {
      const event = frame.split('\n')
      const type = event.find(line => line.startsWith('event:'))?.slice(6).trim()
      const data = event.filter(line => line.startsWith('data:')).map(line => line.slice(5).trim()).join('')
      if (type === 'ready') onReady()
      if (type === 'log' && data) {
        try { onLog(JSON.parse(data)) } catch { /* ignore malformed stream frames */ }
      }
    }
  }
}

export default function Dashboard() {
  const [state, setState] = useState({ loading: true, error: '', server: null, clubs: 0, users: 0, games: 0, currencies: 0, operations: null })
  const [live, setLive] = useState(false)
  const [logs, setLogs] = useState([])
  const abortRef = useRef(null)

  const load = useCallback(async () => {
    setState(current => ({ ...current, loading: true, error: '' }))
    try {
      const [server, clubs, users, games, currencies, operations, recent] = await Promise.all([
        api.get('/servinfo'), api.post('/club/list', {}), api.get('/admin/users'),
        api.get('/game/list', { params: { inc: 'all', sort: true } }),
        api.get('/admin/club/currency-balances'), api.get('/admin/operations/summary'),
        api.get('/admin/operations/logs', { params: { limit: 25 } })
      ])
      const clubRows = Array.isArray(clubs.data) ? clubs.data : (clubs.data?.clubs || clubs.data?.list || clubs.data?.data || [])
      const userRows = users.data?.users || []
      const gameRows = games.data?.list || []
      const currencyRows = currencies.data?.balances || []
      setState({ loading: false, error: '', server: server.data, clubs: clubRows.length, users: userRows.length, games: gameRows.length, currencies: currencyRows.length, operations: operations.data })
      setLogs(recent.data?.events || [])
    } catch (e) {
      setState(current => ({ ...current, loading: false, error: e.response?.data?.what || e.message || 'Unable to load live server state' }))
    }
  }, [])

  useEffect(() => { load(); return () => abortRef.current?.abort() }, [load])

  useEffect(() => {
    let cancelled = false
    const connect = async () => {
      abortRef.current = new AbortController()
      try {
        await readLiveStream(log => {
          if (cancelled) return
          setLive(true)
          setLogs(current => [log, ...current.filter(item => item.id !== log.id)].slice(0, 50))
          setState(current => ({ ...current, operations: current.operations ? { ...current.operations, latest: log } : current.operations }))
        }, () => { if (!cancelled) setLive(true) }, abortRef.current.signal)
      } catch (e) {
        if (!cancelled) setLive(false)
      }
    }
    connect()
    return () => { cancelled = true; abortRef.current?.abort() }
  }, [])

  const cards = [['🏛️', state.clubs, 'Clubs'], ['🧑‍💻', state.users, 'Users'], ['🎮', state.games, 'Games Available'], ['💱', state.currencies, 'Currency Balances']]
  const op = state.operations

  return <div>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><div><h2>Main Control Center</h2><p>Authoritative Slotopol-server state and live operations telemetry.</p></div><button className="action-btn action-btn-save" onClick={load} disabled={state.loading}>{state.loading ? 'Refreshing…' : 'Refresh'}</button></div>
    {state.error && <div className="error-message">{state.error}</div>}
    <div className="dashboard-grid">{cards.map(([icon,value,label])=><div className="glass-card stat-card" key={label}><span className="stat-icon">{icon}</span><div className="stat-value">{state.loading?'…':value.toLocaleString()}</div><div className="stat-label">{label}</div></div>)}</div>
    <div className="dashboard-grid">
      <div className="glass-card" style={{padding:'20px'}}><h3>Slotopol-server</h3><p>{state.server ? `Connected ${state.server.version || state.server.build || ''}` : 'Waiting…'}</p><strong style={{color:live?'#168a45':'#b42318'}}>{live ? '● LIVE STREAM CONNECTED' : '● LIVE STREAM DISCONNECTED'}</strong></div>
      <div className="glass-card" style={{padding:'20px'}}><h3>Operations</h3><p>Total events: {op?.total?.toLocaleString() ?? '—'}</p><p>Errors: <strong>{op?.errors?.toLocaleString() ?? '—'}</strong> · Warnings: <strong>{op?.warnings?.toLocaleString() ?? '—'}</strong></p></div>
    </div>
    <div className="glass-card" style={{padding:'20px'}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><h3>Live Slotopol-server Activity</h3><span>{logs.length} recent events</span></div>
      <div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse'}}><thead><tr><th>Time</th><th>Level</th><th>Event</th><th>Endpoint</th><th>Status</th><th>Latency</th><th>Message</th></tr></thead><tbody>{logs.map(log=><tr key={log.id}><td>{new Date(log.timestamp).toLocaleTimeString()}</td><td>{log.level}</td><td>{log.event_type}</td><td>{log.endpoint || '—'}</td><td>{log.status || '—'}</td><td>{log.duration_ms ?? '—'} ms</td><td>{log.error || log.message || '—'}</td></tr>)}</tbody></table></div>
    </div>
  </div>
}
