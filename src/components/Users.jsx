import { useEffect, useState } from 'react'
import api from '../api/client'

export default function Users() {
  const [users, setUsers] = useState([])

  // ✅ FIX: Use POST for /user/is (backend expects POST)
  const fetchUsers = () => {
    api.post('/user/is', { uid: 1 }).then(res => {
      if (res.data.exists) {
        setUsers([{ uid: res.data.uid, email: res.data.email, name: res.data.name }])
      }
    }).catch(e => console.error(e))
  }

  useEffect(() => { fetchUsers() }, [])

  return (
    <div>
      <h2>👤 User Management</h2>
      <div className="glass-card" style={{ minHeight: '150px' }}>
        {users.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>No users loaded.</div>
        ) : (
          <table>
            <thead>
              <tr><th>UID</th><th>Email</th><th>Name</th></tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.uid}>
                  <td>{u.uid}</td>
                  <td>{u.email}</td>
                  <td><span className="highlight">{u.name}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
