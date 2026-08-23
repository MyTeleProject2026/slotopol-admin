import { useEffect, useMemo, useState } from 'react'
import api from '../api/client'

export default function Games() {
  const [games, setGames] = useState([])
  const [selectedClub, setSelectedClub] = useState('1')
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [search, setSearch] = useState('')
  const [provider, setProvider] = useState('all')
  const [selectedGames, setSelectedGames] = useState([])
  const [message, setMessage] = useState({ type: '', text: '' })

  const fetchGames = async () => {
    if (!selectedClub) {
      setGames([])
      return
    }
    setLoading(true)
    setMessage({ type: '', text: '' })
    try {
      const response = await api.get(`/game/list?inc=all&cid=${encodeURIComponent(selectedClub)}&sort=true&_=${Date.now()}`)
      const list = Array.isArray(response.data?.list) ? response.data.list : []
      setGames(list)
      setSelectedGames([])
    } catch (error) {
      console.error('Error fetching games:', error)
      setMessage({ type: 'error', text: `Failed to load games. ${error.response?.data?.what || error.message}` })
      setGames([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchGames() }, [selectedClub])

  const providers = useMemo(() => [...new Set(games.map(game => game.prov).filter(Boolean))].sort(), [games])

  const filteredGames = useMemo(() => {
    const query = search.trim().toLowerCase()
    return games.filter(game => {
      const matchesProvider = provider === 'all' || game.prov === provider
      const searchableText = [game.game_id, game.prov, game.name].filter(Boolean).join(' ').toLowerCase()
      return matchesProvider && (query === '' || searchableText.includes(query))
    })
  }, [games, search, provider])

  const applyPermission = async (gameIds, enabled) => {
    const ids = [...new Set(gameIds.filter(Boolean))]
    if (!ids.length) {
      setMessage({ type: 'error', text: 'Please select at least one game.' })
      return false
    }

    setUpdating(true)
    setMessage({ type: '', text: '' })
    try {
      const response = ids.length === 1
        ? await api.post('/admin/game/permission', {
            club_id: Number(selectedClub),
            game_id: ids[0],
            enabled
          })
        : await api.post('/admin/game/permissions/bulk', {
            club_id: Number(selectedClub),
            game_ids: ids,
            enabled
          })

      if (response.status !== 204 && response.status !== 200) {
        throw new Error(`Server returned HTTP ${response.status}`)
      }

      // The server returns 204 after committing the database change. Reload
      // the authoritative list instead of relying only on local React state.
      await fetchGames()
      setSelectedGames([])
      setMessage({
        type: 'success',
        text: `${enabled ? 'Enabled' : 'Disabled'} ${ids.length} game${ids.length === 1 ? '' : 's'} successfully.`
      })
      return true
    } catch (error) {
      console.error('Failed to update game permission:', error)
      setMessage({
        type: 'error',
        text: `Failed to update game permission. ${error.response?.data?.what || error.message}`
      })
      return false
    } finally {
      setUpdating(false)
    }
  }

  const toggleGame = async (game) => {
    if (!game?.game_id) {
      setMessage({ type: 'error', text: 'This game does not have a valid game_id.' })
      return
    }
    await applyPermission([game.game_id], !Boolean(game.enabled))
  }

  const toggleSelectedGame = (gameId) => {
    setSelectedGames(previous => previous.includes(gameId) ? previous.filter(id => id !== gameId) : [...previous, gameId])
  }

  const selectAllVisible = () => setSelectedGames(filteredGames.map(game => game.game_id).filter(Boolean))
  const clearSelection = () => setSelectedGames([])

  const updateSelectedGames = async (enabled) => {
    if (!selectedGames.length) {
      setMessage({ type: 'error', text: 'Please select at least one game.' })
      return
    }
    const action = enabled ? 'enable' : 'disable'
    if (!confirm(`Are you sure you want to ${action} ${selectedGames.length} selected game(s) for Club ${selectedClub}?`)) return
    await applyPermission(selectedGames, enabled)
  }

  const enabledCount = games.filter(game => Boolean(game.enabled)).length

  return (
    <div className="games-page">
      <h2>🎮 Game Library Controller</h2>

      {message.text && (
        <div className={message.type === 'success' ? 'success-message' : 'error-message'} role="status" aria-live="polite">
          {message.text}
        </div>
      )}

      <div className="glass-card games-toolbar">
        <label htmlFor="games-club">Club ID:</label>
        <input id="games-club" type="number" min="1" value={selectedClub} onChange={event => setSelectedClub(event.target.value)} />
        <button className="action-btn action-btn-save" onClick={fetchGames} disabled={loading || updating}>🔄 Refresh Games</button>
        <div className="games-count">Total: {games.length} · Enabled: {enabledCount} · Disabled: {games.length - enabledCount}</div>
      </div>

      <div className="glass-card games-filters">
        <input type="text" placeholder="Search game or provider..." value={search} onChange={event => setSearch(event.target.value)} />
        <select value={provider} onChange={event => setProvider(event.target.value)}>
          <option value="all">All Providers</option>
          {providers.map(item => <option key={item} value={item}>{item}</option>)}
        </select>
        <button className="action-btn" onClick={selectAllVisible} disabled={updating}>Select Visible</button>
        <button className="action-btn" onClick={clearSelection} disabled={updating}>Clear Selection</button>
        <button className="action-btn action-btn-save" onClick={() => updateSelectedGames(true)} disabled={updating || !selectedGames.length}>Enable Selected ({selectedGames.length})</button>
        <button className="action-btn action-btn-delete" onClick={() => updateSelectedGames(false)} disabled={updating || !selectedGames.length}>Disable Selected ({selectedGames.length})</button>
      </div>

      <div className="glass-card games-table-card">
        {loading ? (
          <div className="games-state">Loading games...</div>
        ) : filteredGames.length === 0 ? (
          <div className="games-state">No games found.</div>
        ) : (
          <div className="table-wrap">
            <table className="games-table">
              <thead><tr><th>Select</th><th>Game ID</th><th>Provider</th><th>Title</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {filteredGames.map(game => {
                  const isSelected = selectedGames.includes(game.game_id)
                  const enabled = Boolean(game.enabled)
                  return (
                    <tr key={game.game_id}>
                      <td><input type="checkbox" checked={isSelected} onChange={() => toggleSelectedGame(game.game_id)} aria-label={`Select ${game.name || game.game_id}`} /></td>
                      <td><span className="highlight">{game.game_id}</span></td>
                      <td>{game.prov}</td>
                      <td>{game.name}</td>
                      <td><span className={enabled ? 'game-status enabled' : 'game-status disabled'}>{enabled ? 'ACTIVE' : 'DISABLED'}</span></td>
                      <td><button className={enabled ? 'action-btn action-btn-delete' : 'action-btn action-btn-save'} onClick={() => toggleGame(game)} disabled={updating}>{enabled ? 'Disable' : 'Enable'}</button></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
