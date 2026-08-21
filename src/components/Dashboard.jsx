import { Link } from 'react-router-dom'

export default function Dashboard() {
  return (
    <div>
      <h1>Slotopol Admin Dashboard</h1>
      <nav>
        <Link to="/clubs">Clubs</Link> |{' '}
        <Link to="/users">Users</Link> |{' '}
        <Link to="/games">Games</Link> |{' '}
        <Link to="/allocations">Allocations</Link>
      </nav>
      <div style={{ marginTop: 20 }}>
        <p>Welcome to Slotopol Admin Panel.</p>
      </div>
    </div>
  )
}
