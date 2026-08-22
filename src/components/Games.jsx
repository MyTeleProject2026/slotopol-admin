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

  const fetchGames = async () => {
    if (!selectedClub) {
      setGames([])
      return
    }

    setLoading(true)

    try {
      const response = await api.get(
        `/game/list?inc=all&cid=${selectedClub}&sort=true&_=${Date.now()}`
      )

      setGames(response.data?.list || [])
      setSelectedGames([])
    } catch (error) {
      console.error('Error fetching games:', error)

      alert(
        'Failed to load games. ' +
        (error.response?.data?.what || error.message)
      )

      setGames([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGames()
  }, [selectedClub])

  const providers = useMemo(() => {
    return [
      ...new Set(
        games
          .map(game => game.prov)
          .filter(Boolean)
      )
    ].sort()
  }, [games])

  const filteredGames = useMemo(() => {
    const query = search.trim().toLowerCase()

    return games.filter(game => {
      const matchesProvider =
        provider === 'all' ||
        game.prov === provider

      const searchableText = [
        game.game_id,
        game.prov,
        game.name
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      const matchesSearch =
        query === '' ||
        searchableText.includes(query)

      return matchesProvider && matchesSearch
    })
  }, [games, search, provider])

  const toggleGame = async (game) => {
    if (!game?.game_id) {
      alert('This game does not have a valid game_id.')
      return
    }

    setUpdating(true)

    try {
      await api.post('/admin/game/permission', {
        club_id: Number(selectedClub),
        game_id: game.game_id,
        enabled: !game.enabled
      })

      setGames(previous =>
        previous.map(item =>
          item.game_id === game.game_id
            ? {
                ...item,
                enabled: !game.enabled
              }
            : item
        )
      )
    } catch (error) {
      alert(
        'Failed to update game permission. ' +
        (error.response?.data?.what || error.message)
      )
    } finally {
      setUpdating(false)
    }
  }

  const toggleSelectedGame = (gameId) => {
    setSelectedGames(previous => {
      if (previous.includes(gameId)) {
        return previous.filter(id => id !== gameId)
      }

      return [...previous, gameId]
    })
  }

  const selectAllVisible = () => {
    const visibleIds = filteredGames
      .map(game => game.game_id)
      .filter(Boolean)

    setSelectedGames(visibleIds)
  }

  const clearSelection = () => {
    setSelectedGames([])
  }

  const updateSelectedGames = async (enabled) => {
    if (selectedGames.length === 0) {
      alert('Please select at least one game.')
      return
    }

    const action = enabled ? 'enable' : 'disable'

    if (
      !confirm(
        `Are you sure you want to ${action} ${selectedGames.length} selected game(s) for Club ${selectedClub}?`
      )
    ) {
      return
    }

    setUpdating(true)

    try {
      await api.post('/admin/game/permissions/bulk', {
        club_id: Number(selectedClub),
        game_ids: selectedGames,
        enabled
      })

      setGames(previous =>
        previous.map(game =>
          selectedGames.includes(game.game_id)
            ? {
                ...game,
                enabled
              }
            : game
        )
      )

      alert(
        `Successfully ${enabled ? 'enabled' : 'disabled'} ${selectedGames.length} game(s).`
      )

      setSelectedGames([])
    } catch (error) {
      alert(
        'Failed to update selected games. ' +
        (error.response?.data?.what || error.message)
      )
    } finally {
      setUpdating(false)
    }
  }

  const enabledCount = games.filter(
    game => game.enabled
  ).length

  return (
    <div>
      <h2>🎮 Game Library Controller</h2>

      <div
        className="glass-card"
        style={{
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap'
        }}
      >
        <label style={{ color: 'white' }}>
          Club ID:
        </label>

        <input
          type="number"
          min="1"
          value={selectedClub}
          onChange={event =>
            setSelectedClub(event.target.value)
          }
          style={{
            width: '100px',
            padding: '8px',
            color: 'white'
          }}
        />

        <button
          className="action-btn action-btn-save"
          onClick={fetchGames}
          disabled={loading || updating}
          style={{
            width: 'auto',
            padding: '10px 20px'
          }}
        >
          🔄 Refresh Games
        </button>

        <div
          style={{
            color: '#aaa',
            marginLeft: 'auto'
          }}
        >
          Total: {games.length} |
          Enabled: {enabledCount} |
          Disabled: {games.length - enabledCount}
        </div>
      </div>

      <div
        className="glass-card"
        style={{
          marginBottom: '20px',
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap'
        }}
      >
        <input
          type="text"
          placeholder="Search game or provider..."
          value={search}
          onChange={event =>
            setSearch(event.target.value)
          }
          style={{
            flex: '1',
            minWidth: '200px',
            padding: '10px'
          }}
        />

        <select
          value={provider}
          onChange={event =>
            setProvider(event.target.value)
          }
          style={{
            minWidth: '180px',
            padding: '10px'
          }}
        >
          <option value="all">
            All Providers
          </option>

          {providers.map(item => (
            <option
              key={item}
              value={item}
            >
              {item}
            </option>
          ))}
        </select>

        <button
          className="action-btn"
          onClick={selectAllVisible}
          disabled={updating}
        >
          Select Visible
        </button>

        <button
          className="action-btn"
          onClick={clearSelection}
          disabled={updating}
        >
          Clear Selection
        </button>

        <button
          className="action-btn action-btn-save"
          onClick={() =>
            updateSelectedGames(true)
          }
          disabled={
            updating ||
            selectedGames.length === 0
          }
        >
          Enable Selected ({selectedGames.length})
        </button>

        <button
          className="action-btn action-btn-delete"
          onClick={() =>
            updateSelectedGames(false)
          }
          disabled={
            updating ||
            selectedGames.length === 0
          }
        >
          Disable Selected ({selectedGames.length})
        </button>
      </div>

      <div
        className="glass-card"
        style={{
          minHeight: '200px',
          overflowX: 'auto'
        }}
      >
        {loading ? (
          <div
            style={{
              textAlign: 'center',
              padding: '40px',
              color: '#888'
            }}
          >
            Loading games...
          </div>
        ) : filteredGames.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '40px',
              color: '#666'
            }}
          >
            No games found.
          </div>
        ) : (
          <div
            style={{
              overflowX: 'auto'
            }}
          >
            <table
              style={{
                minWidth: '850px',
                width: '100%'
              }}
            >
              <thead>
                <tr>
                  <th>Select</th>
                  <th>Game ID</th>
                  <th>Provider</th>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredGames.map(game => {
                  const isSelected =
                    selectedGames.includes(
                      game.game_id
                    )

                  return (
                    <tr
                      key={game.game_id}
                    >
                      <td>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() =>
                            toggleSelectedGame(
                              game.game_id
                            )
                          }
                        />
                      </td>

                      <td>
                        <span className="highlight">
                          {game.game_id}
                        </span>
                      </td>

                      <td>
                        {game.prov}
                      </td>

                      <td>
                        {game.name}
                      </td>

                      <td>
                        <span
                          style={{
                            color: game.enabled
                              ? '#00F0FF'
                              : '#666',
                            fontWeight: 'bold'
                          }}
                        >
                          {game.enabled
                            ? 'ACTIVE'
                            : 'DISABLED'}
                        </span>
                      </td>

                      <td>
                        <button
                          className={
                            game.enabled
                              ? 'action-btn action-btn-delete'
                              : 'action-btn action-btn-save'
                          }
                          onClick={() =>
                            toggleGame(game)
                          }
                          disabled={updating}
                        >
                          {game.enabled
                            ? 'Disable'
                            : 'Enable'}
                        </button>
                      </td>
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
