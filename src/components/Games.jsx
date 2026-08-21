import { useEffect, useState } from 'react'
import api from '../api/client'

export default function Games() {
  const [games, setGames] = useState([])
  const [selectedClub, setSelectedClub] = useState('1')
  const [loading, setLoading] = useState(false)

  const fetchGames = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/game/list?inc=all&cid=${selectedClub}`)
      setGames(res.data.list || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchGames() }, [selectedClub])

  const toggleGame = async (alias, currentStatus) => {
    await api.post('/admin/game/permission', { 
      club_id: parseInt(selectedClub), 
      game_alias: alias,
      enabled: !currentStatus 
    })
    fetchGames()
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
          style={{ width: '80px', padding: '8px' }}
        />
      </div>

      <div className="glass-card" style={{ minHeight: '200px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>Loading games...</div>
        ) : games.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            ⚠️ No games found. Did you compile providers? Did you seed `club_game_permissions`?
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
