import { useCallback, useEffect, useState } from 'react'
import api from '../api/client'

export default function AuditCenter() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [action, setAction] = useState('')

  const refresh = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const { data } = await api.get('/admin/audit', { params: action ? { action } : undefined })
      setEvents(Array.isArray(data?.events) ? data.events : [])
    } catch (e) {
      setError(e.response?.data?.what || e.response?.data?.error || e.message)
    } finally { setLoading(false) }
  }, [action])

  useEffect(() => { refresh() }, [refresh])

  return <section className="governance-center">
    <div className="page-heading"><div><h1>Audit & Governance</h1><p>Server-recorded privileged administrative changes.</p></div><button onClick={refresh} disabled={loading}>{loading ? 'Loading…' : 'Refresh audit'}</button></div>
    <div className="control-card audit-toolbar"><label>Action filter<select value={action} onChange={e => setAction(e.target.value)}><option value="">All actions</option><option value="club.profile.update">Club profile update</option><option value="country-game-profile.update">Country game policy</option><option value="club.currency-balance.adjust">Currency balance adjustment</option></select></label></div>
    {error && <div className="governance-banner"><span className="status-error">ERROR</span><span>{error}</span></div>}
    <article className="control-card"><div className="page-heading"><div><h3>Administrative event ledger</h3><p>{events.length} event{events.length === 1 ? '' : 's'} returned</p></div></div><div className="audit-table-wrap"><table className="audit-table"><thead><tr><th>Time</th><th>Admin</th><th>Club</th><th>Action</th><th>Resource</th><th>IP</th><th>Details</th></tr></thead><tbody>{events.map(e => <tr key={e.id}><td>{e.ctime ? new Date(e.ctime).toLocaleString() : '—'}</td><td>{e.uid}</td><td>{e.cid || 'Platform'}</td><td><code>{e.action}</code></td><td>{e.resource}</td><td>{e.remote_ip || '—'}</td><td>{e.details || '—'}</td></tr>)}</tbody></table>{!events.length && !loading && <div className="empty-state">No audit events found.</div>}</div></article>
  </section>
}
