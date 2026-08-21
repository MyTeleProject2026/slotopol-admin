import { useEffect, useState } from 'react'
import api from '../api/client'

export default function Users() {
  const [users, setUsers] = useState([])

  useEffect(() => {
    // Mock data since /user/list endpoint doesn't exist yet
    api.get('/user/is?uid=1').then(res => setUsers([{uid:1, email:'admin@slotopol.com', name:'Administrator'}]))
  }, [])

  return (
    <div>
      <h2>Users Management</h2>
      <table>
        <thead>
          <tr><th>UID</th><th>Email</th><th>Name</th><th>Status</th></tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.uid}>
              <td>{u.uid}</td>
              <td>{u.email}</td>
              <td><span className="highlight">{u.name}</span></td>
              <td><span className="badge-active">Active</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
