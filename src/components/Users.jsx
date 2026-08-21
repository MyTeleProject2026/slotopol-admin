import { useEffect, useState } from 'react'
import api from '../api/client'

export default function Users() {
  const [users, setUsers] = useState([])

  // Simulated fetch - You need a `/user/list` endpoint on the backend!
  const fetchUsers = () => {
    api.get('/user/is?uid=1').then(res => 
      setUsers([{uid:1, email:'admin@slotopol.com', name:'Administrator'}])
    )
  }

  useEffect(() => { fetchUsers() }, [])

  const handleCreate = async () => {
    const email = prompt('Enter new user email:')
    const secret = prompt('Enter password:')
    if (email && secret) {
      try {
        await api.post('/signup', { email, secret })
        alert('User created!')
        fetchUsers()
      } catch(e) { alert('Error: ' + e.message) }
    }
  }

  const handleDelete = async (uid) => {
    if (!confirm(`Delete user ${uid}?`)) return
    await api.post('/user/delete', { uid })
    fetchUsers()
  }

  return (
    <div>
      <h2>👤 User Management</h2>
      <div className="action-bar">
        <button className="action-btn action-btn-edit" onClick={handleCreate}>+ Create New User</button>
      </div>
      
      <div className="glass-card">
        <table>
          <thead>
            <tr><th>UID</th><th>Email</th><th>Name</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.uid}>
                <td>{u.uid}</td>
                <td>{u.email}</td>
                <td><span className="highlight">{u.name}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button className="action-btn action-btn-edit" onClick={() => {
                      const newName = prompt('New name:', u.name)
                      if (newName) api.post('/user/rename', { uid: u.uid, name: newName }).then(fetchUsers)
                    }}>Rename</button>
                    <button className="action-btn action-btn-delete" onClick={() => handleDelete(u.uid)}>Delete</button>
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
