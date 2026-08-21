import { useEffect, useState } from 'react'
import api from '../api/client'

export default function Allocations() {
  const [allocations, setAllocations] = useState([])
  const [clubId, setClubId] = useState('')
  const [amount, setAmount] = useState('')

  const fetchAllocations = () => {
    api.get('/admin/allocations').then(res => setAllocations(res.data.allocations || []))
  }

  useEffect(() => { fetchAllocations() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await api.post('/admin/allocate', { club_id: parseInt(clubId), amount: parseFloat(amount) })
      alert('Allocation Request Created!')
      setClubId(''); setAmount('')
      fetchAllocations()
    } catch (e) { alert('Error: ' + e.message) }
  }

  const handleAction = async (id, action) => {
    if (!confirm(`Are you sure you want to ${action} this allocation?`)) return
    await api.post(`/admin/allocation/${action}`, { id })
    fetchAllocations()
  }

  const statusColors = {
    PENDING: '#F9C80E',
    APPROVED: '#00F0FF',
    REJECTED: '#FF2079',
    CANCELLED: '#666'
  }

  return (
    <div>
      <h2>💰 Master Allocations</h2>
      
      <div className="glass-card" style={{ marginBottom: '20px' }}>
        <h3 style={{ color: '#fff', marginBottom: '15px' }}>Request New Allocation</h3>
        <form onSubmit={handleCreate} style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 1, minWidth: '120px' }}>
            <label>Club ID</label>
            <input value={clubId} onChange={e => setClubId(e.target.value)} required placeholder="e.g. 1" />
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: '150px' }}>
            <label>Amount</label>
            <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required placeholder="50000" />
          </div>
          <button type="submit" style={{ width: 'auto', padding: '14px 30px' }}>Submit Request</button>
        </form>
      </div>

      <div className="glass-card">
        <table>
          <thead>
            <tr><th>ID</th><th>Club ID</th><th>Amount</th><th>Status</th><th>Created At</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {allocations.map(a => (
              <tr key={a.id}>
                <td>{a.id}</td>
                <td>{a.club_id}</td>
                <td>${a.amount.toLocaleString()}</td>
                <td>
                  <span style={{ color: statusColors[a.status] || '#fff', fontWeight: 'bold' }}>
                    {a.status}
                  </span>
                </td>
                <td>{new Date(a.created_at).toLocaleString()}</td>
                <td>
                  {a.status === 'PENDING' && (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="action-btn action-btn-save" onClick={() => handleAction(a.id, 'approve')}>Approve</button>
                      <button className="action-btn action-btn-delete" onClick={() => handleAction(a.id, 'reject')}>Reject</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
