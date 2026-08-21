import { useEffect, useState } from 'react'
import api from '../api/client'

export default function Clubs() {
  const [clubs, setClubs] = useState([])

  useEffect(() => {
    api.get('/club/list').then(res => setClubs(res.data.clubs))
  }, [])

  return (
    <div>
      <h2>Clubs</h2>
      <table border="1">
        <thead>
          <tr><th>CID</th><th>Name</th><th>Bank</th><th>Fund</th><th>Deposit</th></tr>
        </thead>
        <tbody>
          {clubs.map(c => (
            <tr key={c.cid}>
              <td>{c.cid}</td>
              <td>{c.name}</td>
              <td>{c.bank}</td>
              <td>{c.fund}</td>
              <td>{c.lock}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
