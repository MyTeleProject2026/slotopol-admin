import { useEffect, useState } from 'react'
import api from '../api/client'

export default function CurrencyReconciliation() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  async function load() {
    setLoading(true); setError('')
    try { const res = await api.get('/admin/club/currency-reconciliation'); setData(res.data || {}) }
    catch (err) { setError(err.response?.data?.what || err.message || 'Unable to run reconciliation') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])
  const rows = data?.currencies || []
  const negative = data?.negative_balances || []
  const invalid = data?.invalid_balances || []
  return <section>
    <div className="page-heading"><div><p className="eyebrow">Financial safety</p><h1>Currency Reconciliation</h1><p>Read-only consistency checks across live provider-credit balances and immutable transfer history.</p></div><button type="button" className="primary-button" onClick={load} disabled={loading}>{loading ? 'Checking…' : 'Run check'}</button></div>
    {error && <div className="error-banner">{error}</div>}
    <div className="stats-grid"><article className="stat-card"><span>Status</span><strong>{data?.status || '—'}</strong></article><article className="stat-card"><span>Ledger entries checked</span><strong>{Number(data?.ledger_entries_checked || 0).toLocaleString()}</strong></article><article className="stat-card"><span>Exceptions</span><strong>{negative.length + invalid.length}</strong></article></div>
    <div className="table-wrap"><table><thead><tr><th>Currency</th><th>Live provider credit</th><th>Outgoing ledger volume</th></tr></thead><tbody>{rows.map((row) => <tr key={row.currency}><td>{row.currency}</td><td>{Number(row.provider_credit_total || 0).toLocaleString(undefined,{maximumFractionDigits:8})}</td><td>{Number(row.ledger_outgoing_total || 0).toLocaleString(undefined,{maximumFractionDigits:8})}</td></tr>)}{!loading && rows.length===0 && <tr><td colSpan="3">No reconciliation data found.</td></tr>}</tbody></table></div>
    {(negative.length > 0 || invalid.length > 0) && <div className="error-banner">Attention required: {negative.length} negative and {invalid.length} invalid provider-credit balances were detected. This check does not auto-correct financial data.</div>}
  </section>
}
