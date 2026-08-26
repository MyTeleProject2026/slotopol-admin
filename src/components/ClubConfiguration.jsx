import { useEffect, useState } from 'react'
import api from '../api/client'

const COUNTRIES = [
  { code: 'MM', name: 'Myanmar', currency: 'MMK' },
  { code: 'TH', name: 'Thailand', currency: 'THB' },
  { code: 'US', name: 'United States', currency: 'USD' },
]

export default function ClubConfiguration() {
  const [clubId, setClubId] = useState('')
  const [countryCode, setCountryCode] = useState('MM')
  const [currency, setCurrency] = useState('MMK')
  const [balance, setBalance] = useState(null)
  const [profiles, setProfiles] = useState([])
  const [status, setStatus] = useState('')

  useEffect(() => {
    api.get('/admin/country-game-profiles').then(r => setProfiles(r.data?.profiles || [])).catch(() => setProfiles([]))
  }, [])

  const chooseCountry = (code) => {
    setCountryCode(code)
    const country = COUNTRIES.find(item => item.code === code)
    if (country) setCurrency(country.currency)
  }

  const loadBalance = async () => {
    if (!clubId) return
    setStatus('Loading...')
    try {
      const response = await api.get('/admin/club/currency-balance', { params: { cid: clubId, currency } })
      setBalance(response.data?.balances?.[0] || { balance: 0, currency })
      setStatus('Loaded')
    } catch (error) { setStatus(error.response?.data?.what || 'Unable to load balance') }
  }

  const saveClubProfile = async () => {
    if (!clubId) return
    setStatus('Saving...')
    try {
      await api.post('/admin/club/profile', { club_id: Number(clubId), country_code: countryCode, currency })
      setStatus('Club country/currency saved')
      await loadBalance()
    } catch (error) { setStatus(error.response?.data?.what || 'Unable to save club profile') }
  }

  return (
    <div className="page">
      <h2>Club Country & Currency</h2>
      <p>Country determines the club's configured provider-credit currency. Funding is performed only through the Virtual Treasury page.</p>

      <div className="form-grid">
        <label>Club ID<input value={clubId} onChange={e => setClubId(e.target.value)} placeholder="N999Bet club ID" /></label>
        <label>Country<select value={countryCode} onChange={e => chooseCountry(e.target.value)}>{COUNTRIES.map(country => <option key={country.code} value={country.code}>{country.name}</option>)}</select></label>
        <label>Currency<input value={currency} readOnly aria-readonly="true" /></label>
      </div>

      <div className="actions"><button onClick={saveClubProfile}>Save Club Profile</button><button onClick={loadBalance}>Load Balance</button></div>

      <div className="card">
        <strong>{currency} provider credit</strong>
        <div>{balance == null ? '—' : Number(balance.balance || 0).toLocaleString()}</div>
        <p className="muted">To recharge this club, use <strong>Currency Transfer</strong>. The server derives the currency from this profile and mints virtual Slotopol-server credit.</p>
      </div>

      <h3>Country game defaults</h3>
      {profiles.length === 0 ? <p>No profiles configured yet.</p> : <div className="table-wrap"><table><thead><tr><th>Country</th><th>Currency</th><th>Min bet</th><th>Max bet</th><th>Step</th><th>Enabled</th></tr></thead><tbody>{profiles.map(profile => <tr key={profile.id}><td>{profile.country_code}</td><td>{profile.currency}</td><td>{profile.min_bet}</td><td>{profile.max_bet}</td><td>{profile.bet_step}</td><td>{profile.enabled ? 'Yes' : 'No'}</td></tr>)}</tbody></table></div>}
      {status && <p role="status">{status}</p>}
    </div>
  )
}
