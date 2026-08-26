import { useState } from 'react'
import api from '../api/client'

export default function CurrencyTransferCenter() {
  const [form, setForm] = useState({ from_club_id: '', to_club_id: '', from_currency: '', to_currency: '', from_amount: '', rate: '', reference: '' })
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  const submit = async (event) => {
    event.preventDefault(); setError(''); setResult(null)
    if (!window.confirm('Execute this provider-credit transfer? This changes both club balances and creates an immutable ledger entry.')) return
    setBusy(true)
    try {
      const { data } = await api.post('/admin/club/currency-transfer', { ...form, from_club_id: Number(form.from_club_id), to_club_id: Number(form.to_club_id), from_amount: Number(form.from_amount), rate: Number(form.rate) })
      setResult(data); setForm({ from_club_id: '', to_club_id: '', from_currency: '', to_currency: '', from_amount: '', rate: '', reference: '' })
    } catch (err) { setError(err.response?.data?.what || err.response?.data?.error || err.message || 'Transfer failed.') }
    finally { setBusy(false) }
  }
  return <section>
    <div className="page-heading"><div><p className="eyebrow">Treasury</p><h2>Club Currency Transfer</h2><p className="muted">Server-authoritative provider-credit movement with explicit FX rate and immutable ledger provenance.</p></div></div>
    <form className="control-grid" onSubmit={submit}>
      <label>From Club<input required inputMode="numeric" value={form.from_club_id} onChange={(e) => update('from_club_id', e.target.value)} /></label>
      <label>To Club<input required inputMode="numeric" value={form.to_club_id} onChange={(e) => update('to_club_id', e.target.value)} /></label>
      <label>From Currency<input required maxLength={12} value={form.from_currency} onChange={(e) => update('from_currency', e.target.value.toUpperCase())} /></label>
      <label>To Currency<input required maxLength={12} value={form.to_currency} onChange={(e) => update('to_currency', e.target.value.toUpperCase())} /></label>
      <label>From Amount<input required type="number" min="0.01" step="0.01" value={form.from_amount} onChange={(e) => update('from_amount', e.target.value)} /></label>
      <label>FX Rate<input required type="number" min="0.00000001" step="0.00000001" value={form.rate} onChange={(e) => update('rate', e.target.value)} /></label>
      <label className="wide-field">Reference<input maxLength={128} value={form.reference} onChange={(e) => update('reference', e.target.value)} placeholder="Optional reconciliation reference" /></label>
      <div className="wide-field action-row"><button className="primary-button" disabled={busy}>{busy ? 'Executing…' : 'Execute Transfer'}</button></div>
    </form>
    {error && <div className="status-error">{error}</div>}
    {result && <div className="status-success"><strong>Transfer completed.</strong><div>Ledger #{result.ledger_id} · {result.from_amount} {result.from_currency} → {result.to_amount} {result.to_currency} · rate {result.rate}</div></div>}
  </section>
}
