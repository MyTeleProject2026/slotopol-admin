import { useEffect, useMemo, useState } from 'react'
import api from '../api/client'

export default function CurrencyOverview() {
  const [currency, setCurrency] = useState('')
  const [rows, setRows] = useState([])
  const [status, setStatus] = useState('Loading...')

  const load = async () => {
    setStatus('Loading...')
    try {
      const response = await api.get('/admin/club/currency-balances', {
        params: currency ? { currency } : {},
      })
      setRows(response.data?.balances || [])
      setStatus(`Loaded ${response.data?.count || 0} balances`)
    } catch (error) {
      setRows([])
      setStatus(error.response?.data?.what || 'Unable to load currency balances')
    }
  }

  useEffect(() => { load() }, [])

  const totals = useMemo(() => rows.reduce((acc, row) => {
    acc[row.currency] = (acc[row.currency] || 0) + Number(row.balance || 0)
    return acc
  }, {}), [rows])

  return (
    <div className="page">
      <div className="section-heading">
        <div>
          <h1>Club Currency Overview</h1>
          <p>Read-only provider-credit balances across every Slotopol club and configured currency.</p>
        </div>
        <button className="secondary-button" onClick={load}>Refresh</button>
      </div>

      <div className="stats-grid">
        {Object.entries(totals).length === 0 ? (
          <div className="stat-card"><span>Balances</span><strong>0</strong></div>
        ) : Object.entries(totals).map(([code, value]) => (
          <div className="stat-card" key={code}><span>{code} total provider credit</span><strong>{value.toLocaleString()}</strong></div>
        ))}
      </div>

      <div className="toolbar-card">
        <label>Currency filter
          <input value={currency} onChange={(event) => setCurrency(event.target.value.toUpperCase())} maxLength={8} placeholder="All currencies" />
        </label>
        <button onClick={load}>Apply Filter</button>
      </div>

      <div className="table-wrap">
        <table>
          <thead><tr><th>Club ID</th><th>Currency</th><th>Provider Credit</th><th>Updated</th></tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${row.club_id}-${row.currency}`}>
                <td>{row.club_id}</td>
                <td>{row.currency}</td>
                <td>{Number(row.balance || 0).toLocaleString()}</td>
                <td>{row.updated_at ? new Date(row.updated_at).toLocaleString() : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <div className="empty-state">No provider-credit balances found.</div>}
      </div>

      <p className="ops-updated" role="status">{status}</p>
    </div>
  )
}
