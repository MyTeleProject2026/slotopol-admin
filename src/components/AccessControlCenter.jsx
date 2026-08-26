import { useCallback, useEffect, useState } from 'react'
import api from '../api/client'

export default function AccessControlCenter() {
  const [me, setMe] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get('/admin/rbac/me')
      setMe(data)
    } catch (e) {
      setError(e.response?.data?.what || e.response?.data?.error || e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const access = Number(me?.access || 0)
  const permissions = Array.isArray(me?.permissions) ? me.permissions : []

  return <section className="governance-center">
    <div className="page-heading">
      <div><h1>Access Control</h1><p>Server-authoritative Slotopol permissions and effective administrator access.</p></div>
      <button onClick={refresh} disabled={loading}>{loading ? 'Loading…' : 'Refresh access'}</button>
    </div>

    {error && <div className="governance-banner"><span className="status-error">ERROR</span><span>{error}</span></div>}

    <article className="control-card">
      <div className="metric-grid">
        <div className="metric-card"><span>Administrator UID</span><strong>{me?.uid || '—'}</strong></div>
        <div className="metric-card"><span>Effective access mask</span><strong>{access}</strong></div>
        <div className="metric-card"><span>Server capabilities</span><strong>{permissions.length}</strong></div>
      </div>
    </article>

    <article className="control-card">
      <div className="page-heading"><div><h3>Authoritative permission catalog</h3><p>These definitions come from Slotopol-server. Frontend visibility never replaces server authorization.</p></div></div>
      <div className="audit-table-wrap"><table className="audit-table"><thead><tr><th>Permission</th><th>Bit</th><th>Scope</th><th>Capability</th><th>Effective</th></tr></thead><tbody>{permissions.map(p => { const enabled = (access & Number(p.bit)) === Number(p.bit); return <tr key={p.key}><td><code>{p.key}</code></td><td>{p.bit}</td><td>{p.scope}</td><td>{p.label}</td><td><span className={enabled ? 'status-ok' : 'status-muted'}>{enabled ? 'GRANTED' : 'NOT GRANTED'}</span></td></tr> })}</tbody></table></div>
    </article>
  </section>
}
