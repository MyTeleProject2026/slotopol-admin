import { useState } from 'react'
import api from '../api/client'

export default function CurrencyTransferCenter() {
  const [form, setForm] = useState({ to_club_id: '', amount: '', reference: '' })
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const update = (key, value) => setForm(current => ({ ...current, [key]: value }))

  const submit = async (event) => {
    event.preventDefault(); setError(''); setResult(null)
    if (!window.confirm('Transfer virtual Slotopol-server treasury credit to this club? This creates an immutable server ledger entry.')) return
    setBusy(true)
    try {
      const { data } = await api.post('/admin/treasury/mint-transfer', {
        to_club_id: Number(form.to_club_id),
        amount: Number(form.amount),
        reference: form.reference.trim()
      })
      setResult(data)
      setForm({ to_club_id: '', amount: '', reference: '' })
    } catch (err) {
      setError(err.response?.data?.what || err.response?.data?.error || err.message || 'Virtual treasury transfer failed.')
    } finally { setBusy(false) }
  }

  return <section>
    <div className="page-heading"><div><p className="eyebrow">Virtual Treasury</p><h2>Slotopol-server → Club Funding</h2><p className="muted">Demo/provider credit only. The server treasury has no finite balance and no external payment rail. The target club's configured country currency is selected server-side.</p></div></div>
    <form className="control-grid" onSubmit={submit}>
      <label>Target Club ID<input required inputMode="numeric" min="1" value={form.to_club_id} onChange={e => update('to_club_id', e.target.value)} /></label>
      <label>Amount<input required type="number" min="0.01" step="0.01" value={form.amount} onChange={e => update('amount', e.target.value)} /></label>
      <label className="wide-field">Reference<input maxLength={128} value={form.reference} onChange={e => update('reference', e.target.value)} placeholder="Optional funding reference" /></label>
      <div className="wide-field action-row"><button className="primary-button" disabled={busy}>{busy ? 'Transferring…' : 'Transfer Virtual Credit'}</button></div>
    </form>
    {error && <div className="status-error">{error}</div>}
    {result && <div className="status-success"><strong>Transfer completed.</strong><div>Club {result.club_id} · {result.amount} {result.currency} · country {result.country_code} · new balance {result.balance} · ledger #{result.ledger_id}</div></div>}
  </section>
}
