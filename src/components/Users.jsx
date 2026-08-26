import { useEffect, useState } from 'react'
import api from '../api/client'

export default function Users() {
  const [users, setUsers] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchUsers = async () => {
    setLoading(true); setError('')
    try {
      const res = await api.get('/admin/users', { params: query.trim() ? { q: query.trim() } : {} })
      setUsers(Array.isArray(res.data?.users) ? res.data.users : [])
    } catch (e) {
      setUsers([]); setError(e.response?.data?.what || e.message || 'Unable to load users')
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchUsers() }, [])

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,flexWrap:'wrap'}}>
        <h2>👤 User Management</h2>
        <div style={{display:'flex',gap:8}}>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search email or name" onKeyDown={e => e.key === 'Enter' && fetchUsers()} />
          <button className="action-btn action-btn-save" onClick={fetchUsers} disabled={loading}>{loading ? 'Loading…' : 'Refresh'}</button>
        </div>
      </div>
      {error && <div className="error-message">{error}</div>}
      <div className="glass-card" style={{ minHeight: '150px', overflowX: 'auto' }}>
        {loading ? <div style={{textAlign:'center',padding:40,color:'#666'}}>Loading users…</div> : users.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>No users returned.</div>
        ) : (
          <table>
            <thead><tr><th>UID</th><th>Email</th><th>Name</th><th>Status</th></tr></thead>
            <tbody>{users.map(u => <tr key={u.uid}><td>{u.uid}</td><td>{u.email}</td><td><span className="highlight">{u.name || '—'}</span></td><td>{u.status}</td></tr>)}</tbody>
          </table>
        )}
      </div>
    </div>
  )
}
