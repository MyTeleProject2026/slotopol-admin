import { useEffect, useState } from 'react'
import api from '../api/client'

export default function CurrencyLedger() {
  const [entries, setEntries] = useState([])
  const [clubId, setClubId] = useState('')
  const [currency, setCurrency] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const params = {}
      if (clubId.trim()) params.club_id = clubId.trim()
      if (currency.trim()) params.currency = currency.trim().toUpperCase()
      const response = await api.get('/admin/club/currency-ledger', { params })
      setEntries(response.data?.entries || [])
    } catch (err) {
      setError(err.response?.data?.what || err.message || 'Unable to load currency ledger')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <section>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Financial governance</p>
          <h1>Currency Ledger</h1>
          <p>Immutable server-recorded provider-credit transfers and FX execution history.</p>
        </div>
        <button type="button" className="primary-button" onClick={load} disabled={loading}>
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      <div className="toolbar-grid">
        <label>Club ID<input value={clubId} onChange={(e) => setClubId(e.target.value)} placeholder="Any club" /></label>
        <label>Currency<input value={currency} onChange={(e) => setCurrency(e.target.value)} placeholder="USD / MMK / THB" maxLength={12} /></label>
        <button type="button" className="secondary-button" onClick={load} disabled={loading}>Apply filters</button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="table-wrap">
        <table>
          <thead><tr><th>ID</th><th>Time</th><th>From</th><th>To</th><th>Rate</th><th>Reference</th></tr></thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id}>
                <td>{entry.id}</td>
                <td>{entry.ctime ? new Date(entry.ctime).toLocaleString() : '—'}</td>
                <td>{entry.from_club_id} · {entry.from_currency} {Number(entry.from_amount).toLocaleString(undefined, { maximumFractionDigits: 8 })}</td>
                <td>{entry.to_club_id} · {entry.to_currency} {Number(entry.to_amount).toLocaleString(undefined, { maximumFractionDigits: 8 })}</td>
                <td>{Number(entry.rate).toLocaleString(undefined, { maximumFractionDigits: 8 })}</td>
                <td>{entry.reference}</td>
              </tr>
            ))}
            {!loading && entries.length === 0 && <tr><td colSpan="6">No ledger entries found.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  )
}
