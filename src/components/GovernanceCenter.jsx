import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'

const probes = [
  ['API', '/ping', 'get'], ['Service', '/servinfo', 'get'], ['Memory', '/memusage', 'get'], ['Disk', '/diskusage', 'get'],
  ['Games', '/game/algs', 'get'], ['Clubs', '/club/list', 'post'], ['Treasury', '/admin/allocations', 'get'], ['Policies', '/admin/country-game-profiles', 'get'],
]
const arrayFrom = (value, keys = []) => {
  if (Array.isArray(value)) return value
  for (const key of keys) {
    if (Array.isArray(value?.[key])) return value[key]
    if (Array.isArray(value?.data?.[key])) return value.data[key]
  }
  return []
}

export default function GovernanceCenter() {
  const [results, setResults] = useState({})
  const [loading, setLoading] = useState(false)
  const [updated, setUpdated] = useState(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    const next = {}
    await Promise.all(probes.map(async ([key, path, method]) => {
      const started = performance.now()
      try {
        const response = method === 'post'
          ? await api.post(path, {})
          : await api.get(path, { params: { _: Date.now() } })
        next[key] = { ok: true, latency: Math.round(performance.now() - started), data: response.data }
      } catch (e) {
        next[key] = { ok: false, latency: Math.round(performance.now() - started), status: e.response?.status, error: e.response?.data?.what || e.response?.data?.error || e.message }
      }
    }))
    setResults(next)
    setUpdated(new Date())
    setLoading(false)
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const games = useMemo(() => arrayFrom(results.Games?.data, ['list', 'games']), [results.Games])
  const clubs = useMemo(() => arrayFrom(results.Clubs?.data, ['clubs', 'list']), [results.Clubs])
  const allocations = useMemo(() => arrayFrom(results.Treasury?.data, ['allocations', 'list']), [results.Treasury])
  const policies = useMemo(() => arrayFrom(results.Policies?.data, ['profiles', 'policies']), [results.Policies])
  const providers = useMemo(() => new Set(games.map((g) => g.prov).filter(Boolean)).size, [games])
  const pending = allocations.filter((a) => String(a.status || '').toUpperCase() === 'PENDING').length
  const failed = Object.values(results).filter((r) => r && !r.ok).length
  const health = failed === 0 && Object.keys(results).length === probes.length ? 'HEALTHY' : failed ? 'DEGRADED' : 'CHECKING'

  return <section className="governance-center">
    <div className="page-heading"><div><h1>Professional Governance Center</h1><p>Live operational visibility across the Slotopol-server control surface. Values are read from server APIs.</p></div><button onClick={refresh} disabled={loading}>{loading ? 'Checking…' : 'Run full health check'}</button></div>
    <div className="governance-banner"><div><span className={health === 'HEALTHY' ? 'status-ok' : health === 'DEGRADED' ? 'status-error' : ''}>{health}</span><small>{updated ? `Last checked ${updated.toLocaleString()}` : 'Initial server check'}</small></div><span>{failed} failed endpoint{failed === 1 ? '' : 's'}</span></div>
    <div className="governance-kpis"><article><strong>{games.length}</strong><span>Games visible</span></article><article><strong>{providers}</strong><span>Providers</span></article><article><strong>{clubs.length}</strong><span>Clubs</span></article><article><strong>{pending}</strong><span>Pending treasury</span></article><article><strong>{policies.length}</strong><span>Country policies</span></article></div>
    <div className="governance-layout">
      <article className="control-card"><h3>Server health matrix</h3><div className="health-list">{probes.map(([key, path]) => { const result = results[key]; return <div className="health-row" key={key}><div><strong>{key}</strong><small>{path}</small></div><span className={result?.ok ? 'status-ok' : result ? 'status-error' : ''}>{result ? (result.ok ? `ONLINE · ${result.latency} ms` : `FAILED${result.status ? ` · HTTP ${result.status}` : ''}`) : 'CHECKING'}</span></div> })}</div></article>
      <article className="control-card"><h3>Operational safeguards</h3><ul className="governance-list"><li><strong>Game changes:</strong> use Game Governance for server-enforced club permissions.</li><li><strong>Treasury:</strong> pending allocations remain visible before approval.</li><li><strong>Currency:</strong> country policies are read from the server configuration API.</li><li><strong>Diagnostics:</strong> service, memory and disk probes are checked live.</li><li><strong>Authentication:</strong> authenticated admin calls use the existing bearer-token client.</li></ul><div className="governance-actions"><Link to="/control-plane">Control Plane</Link><Link to="/operations">Operations</Link><Link to="/allocations">Treasury</Link><Link to="/game-capabilities">Game Capabilities</Link></div></article>
    </div>
    <article className="control-card governance-probe-data"><h3>Live service information</h3><div className="governance-data-grid">{['Service', 'Memory', 'Disk'].map((key) => <div key={key}><strong>{key}</strong><pre>{results[key]?.data ? JSON.stringify(results[key].data, null, 2) : results[key]?.error || 'No response yet'}</pre></div>)}</div></article>
  </section>
}
