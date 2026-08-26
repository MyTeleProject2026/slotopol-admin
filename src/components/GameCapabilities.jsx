import { useCallback, useEffect, useMemo, useState } from 'react'
import api from '../api/client'

export default function GameCapabilities() {
  const [algorithms, setAlgorithms] = useState([])
  const [filter, setFilter] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const { data } = await api.get('/game/algs')
      setAlgorithms(Array.isArray(data) ? data : data?.algs || [])
    } catch (e) { setError(e.response?.data?.what || e.message) }
    setLoading(false)
  }, [])
  useEffect(() => { load() }, [load])

  const rows = useMemo(() => algorithms.filter((item) => JSON.stringify(item).toLowerCase().includes(filter.toLowerCase())), [algorithms, filter])

  return <section>
    <div className="page-heading"><div><h1>Game Capability Center</h1><p>Read-only visibility of the algorithms and predefined RTP/reel profiles exposed by Slotopol.</p></div><button onClick={load} disabled={loading}>{loading ? 'Loading…' : 'Reload'}</button></div>
    <div className="toolbar"><input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Search provider or game…" /><span>{rows.length} algorithms</span></div>
    {error && <div className="ops-error">{error}</div>}
    <div className="capability-list">
      {rows.map((item, index) => <article className="capability-card" key={`${item.gp || index}-${index}`}>
        <h3>{item.aliases?.map((alias) => `${alias.prov}/${alias.name}`).join(' · ') || item.name || `Algorithm ${index + 1}`}</h3>
        <div className="capability-meta"><span>Grid: {item.sx || '?'} × {item.sy || '?'}</span><span>Lines: {item.ln ?? '?'}</span><span>RTP profiles: {item.rtp?.length || 0}</span></div>
        {item.rtp?.length > 0 && <div className="rtp-list">{item.rtp.map((rtp) => <span key={rtp}>{Number(rtp).toFixed(3)}%</span>)}</div>}
      </article>)}
      {!loading && rows.length === 0 && <p>No capability records found.</p>}
    </div>
  </section>
}
