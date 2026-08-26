import { useCallback, useEffect, useState } from 'react'
import api from '../api/client'

const probes = [
  { key: 'ping', label: 'API Ping', method: 'get', path: '/ping' },
  { key: 'service', label: 'Service Info', method: 'get', path: '/servinfo' },
  { key: 'memory', label: 'Runtime Memory', method: 'get', path: '/memusage' },
  { key: 'games', label: 'Game Algorithms', method: 'get', path: '/game/algs' },
]

function pretty(value) {
  return JSON.stringify(value, null, 2)
}

export default function OperationsCenter() {
  const [results, setResults] = useState({})
  const [loading, setLoading] = useState(false)
  const [updated, setUpdated] = useState(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    const entries = await Promise.all(probes.map(async (probe) => {
      const started = Date.now()
      try {
        const response = await api.request({ method: probe.method, url: probe.path })
        return [probe.key, { ok: true, latency: Date.now() - started, data: response.data }]
      } catch (error) {
        return [probe.key, { ok: false, latency: Date.now() - started, error: error.response?.data?.what || error.message }]
      }
    }))
    setResults(Object.fromEntries(entries))
    setUpdated(new Date())
    setLoading(false)
  }, [])

  useEffect(() => { refresh() }, [refresh])

  return <section>
    <div className="page-heading"><div><h1>Operations Center</h1><p>Live server health, diagnostics, and supported game capability visibility.</p></div><button onClick={refresh} disabled={loading}>{loading ? 'Refreshing…' : 'Refresh checks'}</button></div>
    <div className="ops-grid">
      {probes.map((probe) => {
        const result = results[probe.key]
        return <article className="ops-card" key={probe.key}>
          <div className="ops-card-title"><strong>{probe.label}</strong><span className={result?.ok ? 'status-ok' : 'status-error'}>{result ? (result.ok ? 'ONLINE' : 'FAILED') : 'CHECKING'}</span></div>
          <small>{probe.path}{result ? ` · ${result.latency} ms` : ''}</small>
          {result?.error && <p className="ops-error">{result.error}</p>}
          {result?.data && <pre>{pretty(result.data)}</pre>}
        </article>
      })}
    </div>
    {updated && <p className="ops-updated">Last checked: {updated.toLocaleString()}</p>}
  </section>
}
