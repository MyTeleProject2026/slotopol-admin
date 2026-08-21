import { useEffect, useState } from 'react'
import api from '../api/client'

export default function Games() {
  const [games, setGames] = useState([])
  const [selectedClub, setSelectedClub] = useState('1')
  const [loading, setLoading] = useState(false)

  // Fetch games from the backend
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

  // Toggle game permission
  const toggleGame = async (alias, currentStatus) => {
    try {
      await api.post('/admin/game/permission', { 
        club_id: parseInt(selectedClub), 
        game_alias: alias,
        enabled: !currentStatus 
      })
      fetchGames()
    } catch (e) {
      alert("Failed to toggle game. Make sure the backend /admin/game/permission endpoint exists.")
    }
  }

  return (
    <div>
      <h2>🎮 Game Library Controller</h2>
      
      {/* Club Selector */}
      <div className="glass-card" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <label style={{ color: 'white' }}>Control games for Club ID:</label>
        <input 
          type="number" 
          value={selectedClub} 
          onChange={e => setSelectedClub(e.target.value)} 
          style={{ width: '80px', padding: '8px', color: 'white' }}
        />
        <span style={{ fontSize: '12px', color: '#888' }}>Enter a Club ID and press Enter to load</span>
      </div>

      {/* Game List Table */}
      <div className="glass-card" style={{ minHeight: '200px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>Loading available games...</div>
        ) : games.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <p style={{ marginBottom: '10px' }}>🚫 No games found for Club {selectedClub}.</p>
            <p style={{ fontSize: '13px', color: '#888' }}>
              If you recently deployed Slotopol-server, you must run the backend Docker build with game tags (e.g. `playngo`, `novomatic`, etc.) so the server compiles the games.
            </p>
            <p style={{ fontSize: '13px', color: '#888', marginTop: '10px' }}>
              Alternatively, ensure your DB has the `club_game_permissions` table created.
            </p>
          </div>
        ) : (
          <table>
            <thead>
              <tr><th>Alias</th><th>Provider</th><th>Title</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {games.map(g => (
                <tr key={g.alias}>
                  <td><span className="highlight">{g.alias}</span></td>
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
                      onClick={() => toggleGame(g.alias, g.enabled)}
                    >
                      {g.enabled ? 'Disable' : 'Enable'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
