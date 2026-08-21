import { useEffect, useState } from 'react'
import api from '../api/client'

export default function Users() {
  const [users, setUsers] = useState([])

  useEffect(() => {
    // We need a /user/list endpoint – we'll add it later.
    // For now, we'll manually query known users.
    api.get('/user/is?uid=1').then(res => setUsers([{uid:1, email:'admin@slotopol.com', name:'Administrator'}]))
  }, [])

  return (
    <div>
      <h2>Users</h2>
      <table border="1">
        <thead><tr><th>UID</th><th>Email</th><th>Name</th></tr></thead>
        <tbody>
          {users.map(u => (
            <tr key={u.uid}><td>{u.uid}</td><td>{u.email}</td><td>{u.name}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
