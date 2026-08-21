import { useEffect, useState } from 'react'
import api from '../api/client'

export default function Clubs() {
  const [clubs, setClubs] = useState([])
  const [editMode, setEditMode] = useState(null) // CID of club being edited

  const fetchClubs = () => api.get('/club/list').then(res => setClubs(res.data.clubs))

  useEffect(() => { fetchClubs() }, [])

  const handleRename = async (cid, newName) => {
    await api.post('/club/rename', { cid, name: newName })
    setEditMode(null)
    fetchClubs()
  }

  const handleCashin = async (cid, sum) => {
    await api.post('/club/cashin', { cid, sum })
    fetchClubs()
  }

  const handleJackpot = async (cid, fund) => {
    await api.post('/club/jpfund', { cid, fund })
    fetchClubs()
  }

  return (
    <div>
      <h2>🏛️ Club Management</h2>
      <div className="glass-card">
        <table>
          <thead>
            <tr><th>ID</th><th>Name</th><th>Bank</th><th>Jackpot Fund</th><th>Deposit</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {clubs.map(c => (
              <tr key={c.cid}>
                <td>{c.cid}</td>
                <td>
                  {editMode === c.cid ? (
                    <div className="inline-edit">
                      <input type="text" defaultValue={c.name} id={`name-${c.cid}`} />
                      <button className="action-btn action-btn-save" onClick={() => {
                        const val = document.getElementById(`name-${c.cid}`).value
                        handleRename(c.cid, val)
                      }}>Save</button>
                      <button className="action-btn action-btn-delete" onClick={() => setEditMode(null)}>Cancel</button>
                    </div>
                  ) : (
                    <span className="highlight">{c.name}</span>
                  )}
                </td>
                <td>${c.bank.toLocaleString()}</td>
                <td>
                  <div className="inline-edit">
                    <span>${c.fund.toLocaleString()}</span>
                    <button className="action-btn action-btn-edit" onClick={() => {
                      const val = prompt('Enter new Jackpot Fund amount:', c.fund)
                      if (val !== null) handleJackpot(c.cid, parseFloat(val))
                    }}>Edit</button>
                  </div>
                </td>
                <td>${c.lock.toLocaleString()}</td>
                <td>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <button className="action-btn action-btn-edit" onClick={() => setEditMode(c.cid)}>Rename</button>
                    <button className="action-btn action-btn-save" onClick={() => {
                      const val = prompt('Enter amount to add/subtract from bank:', '0')
                      if (val !== null) handleCashin(c.cid, parseFloat(val))
                    }}>Cash In/Out</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
