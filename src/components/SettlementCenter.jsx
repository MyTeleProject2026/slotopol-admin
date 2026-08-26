import { useEffect, useState } from 'react'
import api from '../api/client'

function money(value) {
  return Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function SettlementCenter() {
  const [rows, setRows] = useState([])
  const [summary, setSummary] = useState({ count: 0, wins: 0, total_gain: 0 })
  const [limit, setLimit] = useState(100)
  const [gid, setGid] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function refresh() {
    setLoading(true)
    setError('')
    try {
      const params = { limit }
      if (gid.trim()) params.gid = gid.trim()
      const { data } = await api.get('/admin/settlement/recent', { params })
      setRows(data.records || [])
      setSummary({ count: data.count || 0, wins: data.wins || 0, total_gain: data.total_gain || 0 })
    } catch (err) {
      setError(err.response?.data?.what || err.message || 'Unable to load settlement records.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [])

  return (
    <section>
      <div className="section-heading">
        <div>
          <h1>Settlement & Reconciliation</h1>
          <p>Read-only view of real spin settlement records from Slotopol-server.</p>
        </div>
        <button className="primary-button" type="button" onClick={refresh} disabled={loading}>{loading ? 'Refreshing…' : 'Refresh'}</button>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><span>Records</span><strong>{summary.count}</strong></div>
        <div className="stat-card"><span>Winning spins</span><strong>{summary.wins}</strong></div>
        <div className="stat-card"><span>Total gain</span><strong>{money(summary.total_gain)}</strong></div>
      </div>

      <div className="toolbar-card">
        <label>Game ID<input value={gid} onChange={(e) => setGid(e.target.value)} placeholder="Optional GID" /></label>
        <label>Rows<select value={limit} onChange={(e) => setLimit(Number(e.target.value))}><option value={50}>50</option><option value={100}>100</option><option value={250}>250</option><option value={500}>500</option></select></label>
        <button className="secondary-button" type="button" onClick={refresh}>Apply</button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="table-wrap">
        <table>
          <thead><tr><th>Spin ID</th><th>Game ID</th><th>Time</th><th>RTP</th><th>Gain</th><th>Wallet</th><th>Wins</th></tr></thead>
          <tbody>
            {rows.map((row) => <tr key={row.sid}>
              <td>{row.sid}</td><td>{row.gid}</td><td>{new Date(row.ctime).toLocaleString()}</td>
              <td>{Number(row.mrtp || 0).toFixed(2)}%</td><td>{money(row.gain)}</td><td>{money(row.wallet)}</td>
              <td className="cell-truncate">{row.wins || '—'}</td>
            </tr>)}
            {!rows.length && !loading && <tr><td colSpan="7">No settlement records found.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  )
}
