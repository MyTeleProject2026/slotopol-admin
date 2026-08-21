import { useState } from 'react'
import api from '../api/client'

export default function Allocations() {
  const [amount, setAmount] = useState('')
  const [clubId, setClubId] = useState('')
  const [message, setMessage] = useState('')

  const handleAllocate = async (e) => {
    e.preventDefault()
    try {
      await api.post('/admin/allocate', { club_id: parseInt(clubId), amount: parseFloat(amount) })
      setMessage('✅ Allocation request submitted successfully!')
      setAmount(''); setClubId('')
    } catch (err) {
      setMessage('❌ Error: ' + (err.response?.data?.what || err.message))
    }
  }

  return (
    <div>
      <h2>Master Allocations</h2>
      <form onSubmit={handleAllocate} className="premium-form">
        <div className="form-group">
          <label>Club ID</label>
          <input value={clubId} onChange={e => setClubId(e.target.value)} required placeholder="e.g. 1" />
        </div>
        <div className="form-group">
          <label>Amount</label>
          <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required placeholder="50000" />
        </div>
        <button type="submit">Request Allocation</button>
      </form>
      
      {message && (
        <div className={message.startsWith('✅') ? 'success-message' : 'error-message'}>
          {message}
        </div>
      )}
    </div>
  )
}
