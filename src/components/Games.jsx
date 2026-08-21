import { useEffect, useState } from 'react'
import api from '../api/client'

export default function Games() {
  const [games, setGames] = useState([])

  useEffect(() => {
    api.get('/game/list?inc=all').then(res => setGames(res.data.list))
  }, [])

  return (
    <div>
      <h2>Game Library</h2>
      <table>
        <thead>
          <tr><th>Alias</th><th>Provider</th><th>Name</th></tr>
        </thead>
        <tbody>
          {games.slice(0, 20).map(g => (
            <tr key={g.alias}>
              <td><span className="highlight">{g.alias}</span></td>
              <td>{g.prov}</td>
              <td>{g.name}</td>
            </tr>
          ))}
          {games.length > 20 && <tr><td colSpan={3} style={{ textAlign: 'center', color: 'gray' }}>... and {games.length - 20} more</td></tr>}
        </tbody>
      </table>
    </div>
  )
}
