import { useEffect, useState } from 'react'
import api from '../api/client'

export default function Games() {
  const [games, setGames] = useState([])
  const [selectedClub, setSelectedClub] = useState('1')
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)

  const getAlias = (prov, name) => {
    const str = `${prov}/${name}`;
    return str.toLowerCase().replace(/[^a-z0-9_\/]/g, '');
  }

  const fetchGames = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/game/list?inc=all&cid=${selectedClub}`)
      setGames(res.data.list || [])
    } catch (e) {
      console.error("Error fetching games:", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchGames() }, [selectedClub])

  const toggleGame = async (alias, currentStatus) => {
    try {
      await api.post('/admin/game/permission', { 
        club_id: parseInt(selectedClub), 
        game_alias: alias,
        enabled: !currentStatus 
      })
      fetchGames()
    } catch (e) {
      alert("Failed to toggle game. " + (e.response?.data?.what || e.message))
    }
  }

  const handleAutoDiscover = async () => {
    if (!confirm(`This will fetch all compiled games from the backend and enable them for Club ${selectedClub}. Continue?`)) return;
    
    setSyncing(true)
    try {
      const res = await api.get(`/game/list?inc=all`)
      const allGames = res.data.list || []

      if (allGames.length === 0) {
        alert("No games found in the backend. Did you compile the server with game tags?")
        setSyncing(false)
        return
      }

      let successCount = 0
      for (const game of allGames) {
        const alias = getAlias(game.prov, game.name)
        if (!alias) continue

        try {
          await api.post('/admin/game/permission', {
            club_id: parseInt(selectedClub),
            game_alias: alias,
            enabled: true
          })
          successCount++
        } catch (e) {
          console.warn(`Failed to enable ${alias}`, e)
        }
      }

      alert(`✅ Successfully enabled ${successCount} out of ${allGames.length} games for Club ${selectedClub}!`)
      fetchGames()

    } catch (error) {
      // This prints the EXACT error message from the backend (like 400)
      alert("Error during auto-discovery: " + (error.response?.data?.what || error.message))
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div>
      <h2>🎮 Game Library Controller</h2>
      
      <div className="glass-card" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <label style={{ color: 'white' }}>Control games for Club ID:</label>
        <input 
          type="number" 
          value={selectedClub} 
          onChange={e => setSelectedClub(e.target.value)} 
          style={{ width: '80px', padding: '8px', color: 'white' }}
        />
        
        <button 
          className="action-btn action-btn-save" 
          onClick={handleAutoDiscover}
          disabled={syncing}
          style={{ width: 'auto', padding: '10px 20px' }}
        >
          {syncing ? '⏳ Syncing...' : '🔄 Auto-Discover & Enable All Games'}
        </button>
      </div>

      <div className="glass-card" style={{ minHeight: '200px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>Loading available games...</div>
        ) : games.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <p style={{ marginBottom: '10px' }}>🚫 No games found for Club {selectedClub}.</p>
            <p style={{ fontSize: '13px', color: '#888' }}>
              Click the <b>"Auto-Discover & Enable All Games"</b> button above. 
              The panel will pull all games from the backend and activate them automatically.
            </p>
          </div>
        ) : (
          <table>
            <thead>
              <tr><th>Alias</th><th>Provider</th><th>Title</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {games.map(g => {
                const rowAlias = getAlias(g.prov, g.name);
                return (
                  <tr key={rowAlias}>
                    <td><span className="highlight">{rowAlias}</span></td>
                    <td>{g.prov}</td>
                    <td>{g.name}</td>
                    <td>
                      <span style={{ color: g.enabled ? '#00F0FF' : '#666' }}>
                        {g.enabled ? 'ACTIVE' : 'DISABLED'}
                      </span>
                    </td>
                    <td>
                      <button 
                        className={g.enabled ? "action-btn action-btn-delete" : "action-btn action-btn-save"}
                        onClick={() => toggleGame(rowAlias, g.enabled)}
                      >
                        {g.enabled ? 'Disable' : 'Enable'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
