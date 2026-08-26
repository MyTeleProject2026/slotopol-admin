import { useCallback, useEffect, useMemo, useState } from 'react'
import api from '../api/client'

const unwrap = (data, key) => Array.isArray(data) ? data : Array.isArray(data?.[key]) ? data[key] : Array.isArray(data?.data?.[key]) ? data.data[key] : []

function ErrorText({ error }) {
  return error ? <div className="control-error" role="alert">{error}</div> : null
}

export default function ControlPlane() {
  const [tab, setTab] = useState('overview')
  const [clubs, setClubs] = useState([])
  const [clubId, setClubId] = useState('')
  const [games, setGames] = useState([])
  const [profiles, setProfiles] = useState([])
  const [balances, setBalances] = useState([])
  const [allocations, setAllocations] = useState([])
  const [country, setCountry] = useState({ country_code: 'MM', currency: 'MMK', min_bet: 0, max_bet: 0, bet_step: 0, enabled: true })
  const [credit, setCredit] = useState({ currency: 'MMK', amount: '' })
  const [allocation, setAllocation] = useState({ amount: '', note: '' })
  const [search, setSearch] = useState('')
  const [provider, setProvider] = useState('all')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const selectedClub = useMemo(() => clubs.find((club) => String(club.cid ?? club.id) === String(clubId)), [clubs, clubId])

  const run = useCallback(async (operation, successMessage = '') => {
    setBusy(true); setError(''); setMessage('')
    try {
      const response = await operation()
      if (successMessage) setMessage(successMessage)
      return response
    } catch (e) {
      setError(e.response?.data?.what || e.response?.data?.error || e.message || 'Operation failed')
      return null
    } finally { setBusy(false) }
  }, [])

  const loadClubs = useCallback(async () => {
    const response = await run(() => api.post('/club/list', {}))
    if (!response) return
    setClubs(unwrap(response.data, 'clubs'))
  }, [run])

  const loadControlData = useCallback(async (cid = clubId) => {
    if (!cid) return
    const requests = await Promise.allSettled([
      api.get('/game/list', { params: { inc: 'all', cid, sort: true, _: Date.now() } }),
      api.get('/admin/club/currency-balance', { params: { cid } }),
      api.get('/admin/club/profile', { params: { cid } }),
      api.get('/admin/allocations'),
    ])
    const [gameRes, balanceRes, profileRes, allocationRes] = requests
    if (gameRes.status === 'fulfilled') setGames(Array.isArray(gameRes.value.data?.list) ? gameRes.value.data.list : [])
    if (balanceRes.status === 'fulfilled') setBalances(balanceRes.value.data?.balances || [])
    if (profileRes.status === 'fulfilled') {
      const p = profileRes.value.data || {}
      setCountry((current) => ({ ...current, country_code: p.country_code || current.country_code, currency: p.currency || current.currency }))
    }
    if (allocationRes.status === 'fulfilled') setAllocations(allocationRes.value.data?.allocations || [])
  }, [clubId])

  useEffect(() => { loadClubs(); api.get('/admin/country-game-profiles').then((r) => setProfiles(r.data?.profiles || [])).catch(() => setProfiles([])) }, [loadClubs])
  useEffect(() => { if (clubId) loadControlData(clubId) }, [clubId, loadControlData])

  const providers = useMemo(() => [...new Set(games.map((game) => game.prov).filter(Boolean))].sort(), [games])
  const filteredGames = useMemo(() => {
    const q = search.trim().toLowerCase()
    return games.filter((game) => {
      const providerOk = provider === 'all' || game.prov === provider
      const text = [game.game_id, game.prov, game.name].filter(Boolean).join(' ').toLowerCase()
      return providerOk && (!q || text.includes(q))
    })
  }, [games, provider, search])

  const setGamePermission = async (gameIds, enabled) => {
    if (!clubId || !gameIds.length) return
    const response = await run(
      () => gameIds.length === 1
        ? api.post('/admin/game/permission', { club_id: Number(clubId), game_id: gameIds[0], enabled })
        : api.post('/admin/game/permissions/bulk', { club_id: Number(clubId), game_ids: gameIds, enabled }),
      `${enabled ? 'Enabled' : 'Disabled'} ${gameIds.length} game${gameIds.length === 1 ? '' : 's'} for Club ${clubId}`,
    )
    if (response) await loadControlData(clubId)
  }

  const saveCountryProfile = async (event) => {
    event.preventDefault()
    const response = await run(() => api.post('/admin/country-game-profile', {
      country_code: country.country_code.toUpperCase(), currency: country.currency.toUpperCase(),
      min_bet: Number(country.min_bet), max_bet: Number(country.max_bet), bet_step: Number(country.bet_step), enabled: country.enabled,
    }), 'Country/currency game policy saved')
    if (response) setProfiles((await api.get('/admin/country-game-profiles')).data?.profiles || [])
  }

  const saveClubProfile = async () => {
    if (!clubId) return
    await run(() => api.post('/admin/club/profile', { club_id: Number(clubId), country_code: country.country_code, currency: country.currency }), 'Club country and currency saved')
    await loadControlData(clubId)
  }

  const adjustCredit = async () => {
    const amount = Number(credit.amount)
    if (!clubId || !credit.currency || !Number.isFinite(amount) || amount === 0) return
    const response = await run(() => api.post('/admin/club/currency-balance/adjust', { club_id: Number(clubId), currency: credit.currency.toUpperCase(), amount }), 'Provider credit updated')
    if (response) { setCredit((c) => ({ ...c, amount: '' })); await loadControlData(clubId) }
  }

  const createAllocation = async (event) => {
    event.preventDefault()
    const amount = Number(allocation.amount)
    if (!clubId || !Number.isFinite(amount) || amount <= 0) return
    const response = await run(() => api.post('/admin/allocate', { club_id: Number(clubId), amount, note: allocation.note }), 'Allocation request created')
    if (response) { setAllocation({ amount: '', note: '' }); await loadControlData(clubId) }
  }

  const approveAllocation = async (id) => {
    if (!confirm(`Approve allocation #${id}? This changes the club bank.`)) return
    const response = await run(() => api.post('/admin/allocation/approve', { id }), `Allocation #${id} approved`)
    if (response) await loadControlData(clubId)
  }

  const tabs = [
    ['overview', 'Overview'], ['games', 'Game Governance'], ['clubs', 'Club Controls'],
    ['currency', 'Currency & Credit'], ['limits', 'Country Limits'], ['treasury', 'Treasury'], ['diagnostics', 'Diagnostics'],
  ]

  return <section className="control-plane">
    <div className="page-heading">
      <div><h1>Advanced Control Plane</h1><p>Server-backed governance for games, clubs, country policies, provider credit and treasury operations.</p></div>
      <button onClick={() => loadControlData(clubId)} disabled={busy || !clubId}>Refresh selected club</button>
    </div>

    <div className="control-tabs">{tabs.map(([key, label]) => <button key={key} className={tab === key ? 'control-tab active' : 'control-tab'} onClick={() => setTab(key)}>{label}</button>)}</div>
    <ErrorText error={error} />
    {message && <div className="control-success" role="status">{message}</div>}

    <div className="control-toolbar">
      <label>Active club<select value={clubId} onChange={(e) => setClubId(e.target.value)}><option value="">Select club</option>{clubs.map((club) => <option key={club.cid ?? club.id} value={club.cid ?? club.id}>{club.cid ?? club.id} · {club.name || 'Unnamed club'}</option>)}</select></label>
      <div className="control-kpi"><strong>{games.length}</strong><span>games</span></div>
      <div className="control-kpi"><strong>{games.filter((g) => g.enabled).length}</strong><span>enabled</span></div>
      <div className="control-kpi"><strong>{balances.length}</strong><span>currencies</span></div>
      <div className="control-kpi"><strong>{allocations.filter((a) => a.status === 'PENDING').length}</strong><span>pending allocations</span></div>
    </div>

    {tab === 'overview' && <div className="control-grid">
      <article className="control-card"><h3>Governance scope</h3><p>Game availability is enforced by Slotopol-server permission records; no permission record means disabled. Use Game Governance to apply single or bulk changes.</p><ul><li>Per-club game enable/disable</li><li>Country/currency policy</li><li>Provider-credit controls</li><li>Master allocation approval</li></ul></article>
      <article className="control-card"><h3>Selected club</h3>{selectedClub ? <pre>{JSON.stringify(selectedClub, null, 2)}</pre> : <p>Select a club to inspect its authoritative state.</p>}</article>
      <article className="control-card"><h3>Server safety</h3><p>Controls are sent to the authenticated Slotopol-server API and are not simulated in the browser. Permission failures and server validation errors are surfaced directly.</p></article>
    </div>}

    {tab === 'games' && <div className="control-section">
      <div className="control-toolbar compact"><input placeholder="Search game/provider" value={search} onChange={(e) => setSearch(e.target.value)} /><select value={provider} onChange={(e) => setProvider(e.target.value)}><option value="all">All providers</option>{providers.map((p) => <option key={p}>{p}</option>)}</select><button onClick={() => setGamePermission(filteredGames.map((g) => g.game_id).filter(Boolean), true)} disabled={busy || !clubId}>Enable visible</button><button className="danger" onClick={() => setGamePermission(filteredGames.map((g) => g.game_id).filter(Boolean), false)} disabled={busy || !clubId}>Disable visible</button></div>
      <div className="table-wrap"><table><thead><tr><th>ID</th><th>Provider</th><th>Game</th><th>RTP</th><th>Lines</th><th>Status</th><th>Control</th></tr></thead><tbody>{filteredGames.map((game) => <tr key={game.game_id}><td>{game.game_id}</td><td>{game.prov}</td><td>{game.name}</td><td>{game.rtp ?? '—'}</td><td>{game.lnum ?? '—'}</td><td><span className={game.enabled ? 'status-ok' : 'status-error'}>{game.enabled ? 'ENABLED' : 'DISABLED'}</span></td><td><button className={game.enabled ? 'danger' : ''} onClick={() => setGamePermission([game.game_id], !game.enabled)} disabled={busy}>{game.enabled ? 'Disable' : 'Enable'}</button></td></tr>)}</tbody></table></div>
    </div>}

    {tab === 'clubs' && <div className="control-grid">
      <article className="control-card"><h3>Club registry</h3><button onClick={loadClubs} disabled={busy}>Reload clubs</button><div className="club-list">{clubs.map((club) => <button key={club.cid ?? club.id} className={String(clubId) === String(club.cid ?? club.id) ? 'club-chip active' : 'club-chip'} onClick={() => setClubId(String(club.cid ?? club.id))}>{club.cid ?? club.id} · {club.name || 'Unnamed'}<span>{Number(club.bank || 0).toLocaleString()}</span></button>)}</div></article>
      <article className="control-card"><h3>Club profile</h3><div className="form-grid"><label>Country<input value={country.country_code} onChange={(e) => setCountry({ ...country, country_code: e.target.value.toUpperCase() })} /></label><label>Currency<input value={country.currency} onChange={(e) => setCountry({ ...country, currency: e.target.value.toUpperCase() })} /></label></div><button onClick={saveClubProfile} disabled={busy || !clubId}>Save selected club profile</button></article>
    </div>}

    {tab === 'currency' && <div className="control-grid">
      <article className="control-card"><h3>Provider credit balances</h3>{balances.length ? <table><thead><tr><th>Currency</th><th>Balance</th><th>Updated</th></tr></thead><tbody>{balances.map((row) => <tr key={row.currency}><td>{row.currency}</td><td>{Number(row.balance || 0).toLocaleString()}</td><td>{row.updated_at ? new Date(row.updated_at).toLocaleString() : '—'}</td></tr>)}</tbody></table> : <p>No provider-credit rows for this club.</p>}</article>
      <article className="control-card"><h3>Adjust provider credit</h3><p>This changes provider-side club credit, not a player wallet.</p><label>Currency<input value={credit.currency} onChange={(e) => setCredit({ ...credit, currency: e.target.value.toUpperCase() })} /></label><label>Amount<input type="number" step="0.01" value={credit.amount} onChange={(e) => setCredit({ ...credit, amount: e.target.value })} placeholder="Positive or negative" /></label><button onClick={adjustCredit} disabled={busy || !clubId}>Apply adjustment</button></article>
    </div>}

    {tab === 'limits' && <div className="control-grid">
      <article className="control-card"><h3>Country / currency defaults</h3><form onSubmit={saveCountryProfile} className="form-grid"><label>Country<input value={country.country_code} onChange={(e) => setCountry({ ...country, country_code: e.target.value.toUpperCase() })} maxLength={8} /></label><label>Currency<input value={country.currency} onChange={(e) => setCountry({ ...country, currency: e.target.value.toUpperCase() })} maxLength={8} /></label><label>Min bet<input type="number" step="0.01" value={country.min_bet} onChange={(e) => setCountry({ ...country, min_bet: e.target.value })} /></label><label>Max bet<input type="number" step="0.01" value={country.max_bet} onChange={(e) => setCountry({ ...country, max_bet: e.target.value })} /></label><label>Bet step<input type="number" step="0.01" value={country.bet_step} onChange={(e) => setCountry({ ...country, bet_step: e.target.value })} /></label><label>Enabled<select value={String(country.enabled)} onChange={(e) => setCountry({ ...country, enabled: e.target.value === 'true' })}><option value="true">Yes</option><option value="false">No</option></select></label><button type="submit" disabled={busy}>Save country policy</button></form></article>
      <article className="control-card"><h3>Configured policies</h3><div className="table-wrap"><table><thead><tr><th>Country</th><th>Currency</th><th>Min</th><th>Max</th><th>Step</th><th>Enabled</th></tr></thead><tbody>{profiles.map((p) => <tr key={p.id}><td>{p.country_code}</td><td>{p.currency}</td><td>{p.min_bet}</td><td>{p.max_bet}</td><td>{p.bet_step}</td><td>{p.enabled ? 'Yes' : 'No'}</td></tr>)}</tbody></table></div></article>
    </div>}

    {tab === 'treasury' && <div className="control-grid">
      <article className="control-card"><h3>Create master allocation</h3><form onSubmit={createAllocation}><label>Amount<input type="number" step="0.01" min="0.01" value={allocation.amount} onChange={(e) => setAllocation({ ...allocation, amount: e.target.value })} /></label><label>Note<input value={allocation.note} onChange={(e) => setAllocation({ ...allocation, note: e.target.value })} placeholder="Reason / reference" /></label><button type="submit" disabled={busy || !clubId}>Create pending allocation</button></form></article>
      <article className="control-card"><h3>Approval queue</h3><div className="table-wrap"><table><thead><tr><th>ID</th><th>Club</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead><tbody>{allocations.map((a) => <tr key={a.id}><td>{a.id}</td><td>{a.club_id}</td><td>{Number(a.amount || 0).toLocaleString()}</td><td>{a.status}</td><td>{a.status === 'PENDING' && <button onClick={() => approveAllocation(a.id)} disabled={busy}>Approve</button>}</td></tr>)}</tbody></table></div></article>
    </div>}

    {tab === 'diagnostics' && <div className="control-grid"><article className="control-card"><h3>Live probes</h3><button onClick={() => run(() => api.get('/ping'), 'API ping OK')}>Ping</button><button onClick={() => run(() => api.get('/servinfo'), 'Service info loaded')}>Service info</button><button onClick={() => run(() => api.get('/memusage'), 'Memory diagnostics loaded')}>Memory</button><button onClick={() => run(() => api.get('/diskusage'), 'Disk diagnostics loaded')}>Disk</button></article><article className="control-card"><h3>Current configuration payload</h3><pre>{JSON.stringify({ clubId, selectedClub, country, balances, pendingAllocations: allocations.filter((a) => a.status === 'PENDING').length }, null, 2)}</pre></article></div>}
  </section>
}
